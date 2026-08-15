import type { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  res.setHeader("Link", "</logo.css>; rel=stylesheet");

  if (req.url === "/" || req.url === "/api/index") {
    try {
      let html = readFileSync(join(process.cwd(), "public", "index.html"), "utf8");
      // Inline enhancement scripts because / is served by this serverless function
      // and public JS files are not guaranteed to be exposed as standalone routes.
      const enhancement = readFileSync(join(process.cwd(), "public", "chama-details.js"), "utf8");
      const session = readFileSync(join(process.cwd(), "public", "session-fix.js"), "utf8");
      html = html.replace("</head>", `<script>${session}</script></head>`);
      html = html.replace("</body>", `<script>${enhancement}</script></body>`);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
      return;
    } catch (error) {
      console.error("Failed to load Kikoba demo frontend", error);
    }
  }

  if (req.url === "/api/index") req.url = "/";
  return app(req as any, res as any);
}
