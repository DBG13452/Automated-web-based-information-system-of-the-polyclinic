import { apiRequest } from "./client";

export async function fetchPatients(search = "") {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiRequest(`/patients${query}`);
}

export async function fetchPatientById(patientId) {
  return apiRequest(`/patients/${patientId}`);
}

export async function createPatient(payload) {
  return apiRequest("/patients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(patientId, payload) {
  return apiRequest(`/patients/${patientId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
