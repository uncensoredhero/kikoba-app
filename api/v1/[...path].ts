import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // Requests are rewritten from /v1/* to this Vercel function. Express keeps
  // the original Kikoba API path so routes such as /v1/auth/register match.
  if (req.url?.startsWith("/api")) req.url = req.url.slice(4) || "/";
  return app(req as any, res as any);
}
