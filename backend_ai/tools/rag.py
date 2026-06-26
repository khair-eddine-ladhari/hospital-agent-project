


from dotenv import load_dotenv
import os
load_dotenv()  # loads .env file

from flask import Flask, request, jsonify
from groq import Groq
from tenacity import retry, wait_random_exponential, stop_after_attempt
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

# --- Config -------------------------------------------------------
app = Flask(__name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# --- Embedding model (same as before — still local, still free) ----
embedder = SentenceTransformer("all-MiniLM-L6-v2")
EMBED_DIM = 384  # all-MiniLM-L6-v2 always outputs 384-dim vectors

# --- Pinecone setup -------------------------------------------------
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
INDEX_NAME = os.environ.get("PINECONE_INDEX", "doctor-notes")

# Create the index once if it doesn't exist yet (safe to leave this in —
# it's a no-op every run after the first).
existing_indexes = [idx["name"] for idx in pc.list_indexes()]
if INDEX_NAME not in existing_indexes:
    pc.create_index(
        name=INDEX_NAME,
        dimension=EMBED_DIM,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),  # free-tier region
    )

index = pc.Index(INDEX_NAME)


# --- Retry-wrapped Groq call (same pattern as your other services) --
@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(3))
def call_groq(system_prompt, user_prompt):
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0,
    )
    return response.choices[0].message.content


# --- 1. Index a note -------------------------------------------------
# Pinecone has no built-in document store like Chroma does — it only
# stores vectors + metadata. So the note text itself is stored INSIDE
# the metadata dict, which is how we get it back at search time.
@app.route("/index-note", methods=["POST"])
def index_note():
    try:
        data = request.get_json()
        note_id = data.get("noteId")
        patient_id = data.get("patientId")
        patient_name = data.get("patientName", "")
        content = data.get("content", "")
        date = data.get("date", "")
        doctor = data.get("doctor", "")

        if not note_id or not patient_id or not content.strip():
            return jsonify({"message": "noteId, patientId and content are required"}), 400

        vector = embedder.encode(content).tolist()

        index.upsert(vectors=[{
            "id": str(note_id),
            "values": vector,
            "metadata": {
                "patientId": patient_id,
                "patientName": patient_name,
                "date": str(date),
                "doctor": doctor,
                "content": content,  # stored here so we can read it back later
            },
        }])

        return jsonify({"message": "indexed", "noteId": note_id})
    except Exception as e:
        return jsonify({"message": str(e)}), 500


# --- 2. Search across ALL patients' notes ----------------------------
@app.route("/search-notes", methods=["POST"])
def search_notes():
    try:
        data = request.get_json()
        question = (data.get("question") or "").strip()
        doctor = data.get("doctor", "")
        top_k = data.get("topK", 5)

        if not question:
            return jsonify({"message": "question is required"}), 400

        query_vector = embedder.encode(question).tolist()

        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter={"doctor": {"$eq": doctor}},
        )
        matches = results.get("matches", [])

        if not matches:
            return jsonify({
                "answer": "I couldn't find any notes matching that.",
                "sources": [],
            })

        context_blocks = []
        for m in matches:
            meta = m.get("metadata", {})
            context_blocks.append(
                f'[Note {m["id"]}] Patient: {meta.get("patientName") or "unknown"} '
                f'({meta.get("patientId")}) | Date: {meta.get("date")} | '
                f'Dr. {meta.get("doctor") or "unknown"}\n"{meta.get("content", "")}"'
            )
        context_text = "\n\n".join(context_blocks)

        system_prompt = (
            "You are a clinical note search assistant. Answer the doctor's question "
            "using ONLY the notes provided below. Cite every claim using its [Note <id>] "
            "tag. If the notes don't contain the answer, say so plainly instead of "
            "guessing. Never invent patient names, dates, or symptoms not present in "
            "the provided notes."
        )
        user_prompt = f"Notes:\n{context_text}\n\nQuestion: {question}"

        answer = call_groq(system_prompt, user_prompt)

        sources = [
            {
                "noteId": m["id"],
                "patientId": m["metadata"].get("patientId"),
                "patientName": m["metadata"].get("patientName"),
                "date": m["metadata"].get("date"),
                "doctor": m["metadata"].get("doctor"),
                "snippet": m["metadata"].get("content", "")[:200],
                "score": m.get("score"),  # similarity score — extra info Chroma didn't surface as cleanly
            }
            for m in matches
        ]

        return jsonify({"answer": answer, "sources": sources})
    except Exception as e:
        return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5004, debug=True)