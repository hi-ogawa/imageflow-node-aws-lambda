import {
  DecodeOptions,
  FromBuffer,
  LosslessPNG,
  Steps,
} from "@imazen/imageflow";

export async function resize(
  input: Buffer,
  width: number,
  height: number
): Promise<Buffer> {
  let steps = new Steps(new FromBuffer(input, "input"), new DecodeOptions()); // TODO: `new FromStream(Readable)` fails
  steps = steps.constrainWithin(width, height);
  steps = steps.encode(
    new FromBuffer(null as any, "output"),
    new LosslessPNG()
  );
  const result: any = await steps.execute();
  return result.output;
}
