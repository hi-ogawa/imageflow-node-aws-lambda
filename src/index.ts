import { app } from "./app";

async function main() {
  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port });
}

if (require.main === module) {
  main();
}
