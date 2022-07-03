import {
  Constrain,
  ConstrainMode,
  DecodeOptions,
  FromBuffer,
  LosslessPNG,
  Steps,
} from "@imazen/imageflow";

// https://github.com/imazen/imageflow/blob/3542b52d7572526b298d2853ee924d18b9a5cae2/docs/src/SUMMARY.md
// https://github.com/imazen/imageflow/blob/3542b52d7572526b298d2853ee924d18b9a5cae2/docs/src/json/constrain.md

export async function resize(
  input: Buffer,
  mode: ConstrainMode,
  width: number,
  height: number
): Promise<Buffer> {
  let steps = new Steps(new FromBuffer(input, "input"), new DecodeOptions()); // TODO: `new FromStream(Readable)` fails
  steps = steps.constrain(new Constrain(mode, width, height));
  steps = steps.encode(
    new FromBuffer(null as any, "output"),
    new LosslessPNG()
  );
  const result: any = await steps.execute();
  return result.output;
}
