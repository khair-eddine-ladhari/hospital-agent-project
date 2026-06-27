import Patient from "../models/Patient.js";



const addstatus = async (req, res) => {
   
  try {
    const { bloodPressure, heartRate, temperature, status } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, assignedDoctor: req.user._id },
      { bloodPressure, heartRate, temperature, status },
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export default addstatus