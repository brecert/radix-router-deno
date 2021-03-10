import {
  Response,
  serve,
  ServerRequest,
} from "https://deno.land/std@0.90.0/http/server.ts";

import { Router } from "../router.ts";

type RouteHandler = (ctx: ServerRequest) => void;

const routes = new Router<RouteHandler>({
  "GET /": (ctx) => {
    ctx.respond({ body: "hello world!" });
  },
  "GET /about": (ctx) => {
    ctx.respond({ body: JSON.stringify({ version: "0.0.0" }) });
  },
  "POST /ping": (ctx) => {
    ctx.respond({ body: "pong!" });
  },
});

const server = serve({ port: 8080 });
console.log("listening on localhost:8080");

for await (const req of server) {
  const path = `${req.method} ${req.url}`;
  const fn = routes.getData(path);
  if (fn) {
    fn(req);
  } else {
    req.respond({ status: 404, body: "404 not found" });
  }
}
