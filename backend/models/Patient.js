

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
        frequency: String
      }
    ],

    diagnoses: [
      {
        name: String,
        date: {
          type: Date,
          default: Date.now
        }
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