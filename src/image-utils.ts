import { Writable } from "stream";
import {
  DecodeOptions,
  FromBuffer,
  FromStream,
  LosslessPNG,
  Steps,
} from "@imazen/imageflow";

export async function resize(
  input: Buffer,
  output: Writable,
  width: number,
  height: number
): Promise<void> {
  let steps = new Steps(new FromBuffer(input, "key"), new DecodeOptions()); // TODO: `new FromStream(Readable)` fails
  steps = steps.constrainWithin(width, height);
  steps = steps.encode(new FromStream(output), new LosslessPNG());
  await steps.execute();
}
