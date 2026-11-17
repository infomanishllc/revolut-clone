import { generateFakeProfile } from "../_helpers.js";

export default async function handler(req, res) {
  res.json(generateFakeProfile());
}
