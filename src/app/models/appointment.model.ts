export interface AppointmentDTO {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  mode: string;
  notes?: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorProfilePicture?: string;
  clinicName?: string;
  clinicAddress?: string;
  patientName?: string;
  meetingLink?: string;
}
