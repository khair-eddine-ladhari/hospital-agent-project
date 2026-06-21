import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialty: {
      type: String,
    },
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);