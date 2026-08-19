import dotenv from "dotenv";
import path from "node:path";

dotenv.config({
  path: path.resolve(process.cwd(), "../.env"),
});

const port = Number(process.env.PORT) || 5000;

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:3000";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export const env = {
  port,
  clientUrl,
  databaseUrl,
};
