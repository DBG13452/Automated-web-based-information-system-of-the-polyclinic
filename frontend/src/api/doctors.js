import { apiRequest } from "./client";

export async function fetchDoctors(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/doctors${query}`);
}

export async function fetchDoctorById(doctorId) {
  return apiRequest(`/doctors/${doctorId}`);
}

export async function createDoctor(payload) {
  return apiRequest("/doctors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function createDoctorSchedule(doctorId, payload) {
  return apiRequest(`/doctors/${doctorId}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
