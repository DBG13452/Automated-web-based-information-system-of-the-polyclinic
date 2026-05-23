import { apiRequest } from "./client";

export async function fetchDoctorAppointments(doctorId) {
  const query = doctorId ? `?doctor_id=${encodeURIComponent(doctorId)}` : "";
  return apiRequest(`/visits/appointments${query}`);
}

export async function fetchVisitDetails(appointmentId) {
  return apiRequest(`/visits/appointment/${appointmentId}`);
}

export async function completeVisit(appointmentId, payload) {
  return apiRequest(`/visits/appointment/${appointmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
