import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // Rewrites enter this Vercel function under /api; Express should receive
  // the application's original route such as /v1/... or /health.
  if (req.url?.startsWith("/api/")) req.url = req.url.slice(4) || "/";
  return app(req as any, res as any);
}
