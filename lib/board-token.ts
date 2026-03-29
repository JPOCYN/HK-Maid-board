import { randomBytes } from "crypto";

export function generateBoardToken() {
  return randomBytes(16).toString("hex");
}
