import { apiRequest } from "./client";

export async function fetchAppointments() {
  return apiRequest("/appointments");
}

export async function fetchAvailableSlots(doctorId, workDate) {
  return apiRequest(
    `/doctors/${doctorId}/available-slots?work_date=${encodeURIComponent(workDate)}`
  );
}

export async function createAppointment(payload) {
  return apiRequest("/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
