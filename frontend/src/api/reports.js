import { apiRequest } from "./client";

export async function fetchReportsSummary() {
  return apiRequest("/reports/summary");
}
