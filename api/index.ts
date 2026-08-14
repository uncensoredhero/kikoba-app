import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // The Kikoba mark is styled separately so the frontend entry can stay stable.
  res.setHeader("Link", "</logo.css>; rel=stylesheet");
  // Vercel internally invokes this function at /api/index. The Express app
  // should still see the original root/API path.
  if (req.url === "/api/index") req.url = "/";
  return app(req as any, res as any);
}
