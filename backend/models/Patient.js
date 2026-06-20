import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true
    },

    age: {
      type: Number
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    bloodPressure: {
      type: String // e.g. "145/92"
    },

    heartRate: {
      type: Number
    },

    temperature: {
      type: Number
    },

  medications: [
  {
    name: String,
    dosage: String,
    frequency: String,
    date: { type: Date, default: Date.now }   // ← add this
  }
],

    diagnoses: [
      {
        name: String,
        icd10: String, // ← added: ICD-10 code for this diagnosis
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],

    symptoms: [
      {
        type: String
      }
    ],

    notes: [
      {
        content: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Patient", PatientSchema);