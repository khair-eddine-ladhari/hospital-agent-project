import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  structured: {
    symptoms:    [{ type: String }],
    diagnosis:   [{ type: String }],
    medications: [{ type: String }],
    icd10:       { type: String, default: null },
  },
}, { timestamps: true });

const patientSchema = new mongoose.Schema({
  patientId:      { type: String },
  fullName:       { type: String, required: true },
  age:            { type: Number },
  gender:         { type: String, enum: ['male', 'female'] },
  bloodPressure:  { type: String },
  heartRate:      { type: Number },
  temperature:    { type: Number },
  medications:    [{ type: String }],
  diagnoses:      [{ type: String }],
  notes:          [noteSchema], // ✅ embedded
  symptoms:       [{ type: String }],
  status:         { type: String, enum: ['stable', 'critical', 'follow-up'], default: 'stable' },
  lastVisit:      { type: Date },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);