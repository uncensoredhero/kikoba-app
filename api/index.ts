import type { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  // The Kikoba mark is styled separately so the frontend entry can stay stable.
  res.setHeader("Link", "</logo.css>; rel=stylesheet");

  // Serve the frontend entry through this handler so we can load the small
  // compatibility layer after the existing app script. This repairs browser
  // sessions whose local user ID predates the persistent Neon backend.
  if (req.url === "/" || req.url === "/api/index") {
    try {
      const html = readFileSync(join(process.cwd(), "public", "index.html"), "utf8")
        .replace("</body>", '<script src="/session-fix.js"></script></body>');
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
      return;
    } catch {
      // Fall through to Express if the frontend file cannot be read.
    }
  }

  if (req.url === "/api/index") req.url = "/";
  return app(req as any, res as any);
}
