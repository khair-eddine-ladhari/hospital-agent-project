


export interface Patient {
  _id: string;
  patientId: string;
  fullName: string;
  gender: string;
  assignedDoctor: string;
  diagnoses: Diagnosis[];
  medications: Medication[];
  notes: Note[];
  createdAt: string;
}

export interface Diagnosis {
  _id: string;
  name: string;
  date: string;
}

export interface Medication {
  _id: string;
  name: string;
  dosage: string;
  frequency: string;
  date: string;
}

export interface Note {
  _id: string;
  content: string;
  createdAt: string;
}