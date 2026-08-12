import type { IncomingMessage, ServerResponse } from "http";
import { z } from "zod";
import { db } from "../../../src/app/store.js";
import { createUser } from "../../../src/app/service.js";

export default async function handler(req: IncomingMessage & { method?: string }, res: ServerResponse) {
  res.setHeader("content-type", "application/json");
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("allow", "POST");
    res.end(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }));
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    const input = z.object({ name: z.string().min(2), email: z.string().email() }).parse(body);
    if ([...db.users.values()].some((user) => user.email === input.email)) {
      res.statusCode = 409;
      res.end(JSON.stringify({ error: "EMAIL_EXISTS" }));
      return;
    }
    res.statusCode = 201;
    res.end(JSON.stringify(createUser(input.name, input.email)));
  } catch (error) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "VALIDATION_ERROR" }));
  }
}
