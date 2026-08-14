import type { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  res.setHeader("Link", "</logo.css>; rel=stylesheet");

  // The session compatibility layer must execute BEFORE Kikoba's inline app
  // script. The previous version injected it at </body>, after the app had
  // already captured and started using the stale prototype user ID.
  if (req.url === "/" || req.url === "/api/index") {
    try {
      const html = readFileSync(join(process.cwd(), "public", "index.html"), "utf8")
        .replace("</head>", '<script src="/session-fix.js"></script></head>');
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
