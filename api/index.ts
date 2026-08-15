import type { IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";
import { app } from "../src/server.js";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  res.setHeader("Link", "</logo.css>; rel=stylesheet");
  if (req.url === "/" || req.url === "/api/index") {
    try {
      let html = readFileSync(join(process.cwd(), "public", "index.html"), "utf8");
      const enhancement = readFileSync(join(process.cwd(), "public", "chama-details.js"), "utf8");
      const createChama = readFileSync(join(process.cwd(), "public", "create-chama-ui.js"), "utf8");
      const session = readFileSync(join(process.cwd(), "public", "session-fix.js"), "utf8");
      const phaseB = readFileSync(join(process.cwd(), "public", "phase-b-force.js"), "utf8");
      const createCss = `.createChamaSheet{max-width:560px}.createStep{display:flex;gap:12px;align-items:flex-start;margin:20px 0 10px}.createStep>span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#dff7ed;font-weight:700}.createStep small,.friendPick small{display:block;margin-top:3px}.typeChoices{display:grid;gap:10px}.typeChoices label,.friendPick{display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #dce5e1;border-radius:14px;cursor:pointer}.typeChoices label:has(input:checked),.friendPick:has(input:checked){border-color:#25a779;background:#f0fbf6}.typeChoices input{margin-left:auto}.friendPicker{display:grid;gap:8px}.friendPick input{display:none}.friendAvatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#e9f4ef;font-weight:700}.pickMark{margin-left:auto;opacity:.25}.friendPick:has(input:checked) .pickMark{opacity:1}.createChamaSheet .input{width:100%;box-sizing:border-box;margin-bottom:4px}`;
      html = html.replace("</head>", `<style>${createCss}</style><script>${session}</script></head>`);
      html = html.replace("</body>", `<script>${enhancement}</script><script>${createChama}</script><script>${phaseB}</script></body>`);
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
      return;
    } catch (error) { console.error("Failed to load Kikoba demo frontend", error); }
  }
  if (req.url === "/api/index") req.url = "/";
  return app(req as any, res as any);
}
