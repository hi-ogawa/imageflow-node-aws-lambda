// cf. https://www.fastify.io/docs/latest/Guides/Serverless/

import { app } from "./app";

export default async function (req: any, res: any) {
  await app.ready();
  app.server.emit("request", req, res);
}
