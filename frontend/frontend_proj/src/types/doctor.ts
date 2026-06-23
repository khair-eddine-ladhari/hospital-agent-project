



export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  role: "doctor" | "admin";
  isActive: boolean;
  schedule: Schedule[];
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}