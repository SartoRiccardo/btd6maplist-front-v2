import type { Config } from "./types";
import { apiRequest } from "../client";

export async function getConfig(): Promise<Config> {
  return apiRequest<Config>("/api/config");
}

export async function updateConfig(data: Partial<Config>): Promise<void> {
  return apiRequest<void>("/api/config", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
