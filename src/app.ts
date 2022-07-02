import fastify from "fastify";
import { sortKeys, streamToBuffer } from "./utils";
import { fetch } from "undici";
import { z } from "zod";
import { resize } from "./image-utils";

export const app = fastify({
  logger: true,
});

// allow accessing `Request.raw` on POST
app.addContentTypeParser("*", function (_request, _payload, done) {
  done(null);
});

//
// GET /
//

app.get("/", (req) => {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const appUrl = `${protocol}://${req.hostname}`;
  const exampleUrl = "https://echarts.apache.org/en/images/logo.png";
  const content = `

# example

- GET

${appUrl}/resize?w=139&h=32&url=${exampleUrl}

- POST

curl ${exampleUrl} | curl '${appUrl}/resize?w=139&h=32' --data-binary @- > test.png

`.trim();
  return content;
});

//
// GET /debug
//

app.get("/debug", async () => {
  return {
    "process.env": sortKeys(process.env),
  };
});

//
// GET /resize
//

const zStringToInteger = z.string().regex(/^\d+$/).transform(Number);

const zSize = zStringToInteger.refine((n) => 0 < n && n < 2 ** 12); // 4K

const zContentLength = zStringToInteger.refine((n) => 0 < n && n < 2 ** 22); // 16M

const GET_RESIZE_SCHEMA = z.object({
  w: zSize,
  h: zSize,
  url: z.string().url(),
});

app.get("/resize", async (req, res) => {
  const parsed = GET_RESIZE_SCHEMA.safeParse(req.query);
  if (!parsed.success) {
    res.code(400).send({ message: "invalid parameters" });
    return;
  }
  const { w, h, url } = parsed.data;
  const urlRes = await fetch(url);
  if (!urlRes.headers.get("content-type")?.startsWith("image")) {
    res.code(400).send({ message: "invalid url (invalid image)" });
    return;
  }
  const contentLength = zContentLength.safeParse(
    urlRes.headers.get("content-length")
  );
  if (!contentLength.success) {
    res.code(400).send({ message: "invalid url (too large image)" });
    return;
  }
  const buffer = Buffer.from(await urlRes.arrayBuffer());
  res.header("content-type", "image/png");
  await resize(buffer, res.raw, w, h);
});

//
// POST /resize
//

const POST_RESIZE_SCHEMA = z.object({
  w: zSize,
  h: zSize,
});

app.post("/resize", async (req, res) => {
  const parsed = POST_RESIZE_SCHEMA.safeParse(req.query);
  if (!parsed.success) {
    res.code(400).send({ message: "invalid parameters" });
    return;
  }
  const { w, h } = parsed.data;
  const buffer = await streamToBuffer(req.raw);
  res.header("content-type", "image/png");
  await resize(buffer, res.raw, w, h);
});
