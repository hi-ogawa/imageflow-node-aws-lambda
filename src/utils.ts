import { sortBy } from "lodash";
import path from "path";
import os from "os";
import crypto from "crypto";
import type { Readable } from "stream";

export function sortKeys(value: object): object {
  return Object.fromEntries(sortBy(Object.entries(value), ([k, _v]) => k));
}

export function getTemporaryFile(): string {
  return path.join(os.tmpdir(), crypto.randomBytes(16).toString("hex"));
}

// https://nodejs.org/docs/latest-v14.x/api/stream.html#stream_readable_symbol_asynciterator
export async function streamToString(readable: Readable): Promise<string> {
  readable.setEncoding("utf8");
  let res = "";
  for await (const chunk of readable) res += chunk;
  return res;
}

export function streamToBuffer(readable: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    readable.setEncoding("binary");
    const chunks: Buffer[] = [];

    readable.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk, "binary"));
    });

    readable.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    readable.on("error", (error) => {
      reject(error);
    });
  });
}
