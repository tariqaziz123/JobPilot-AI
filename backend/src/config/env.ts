import "dotenv/config";

const port = Number(process.env.PORT) || 5000;

const clientUrl =
  process.env.CLIENT_URL || "http://localhost:3000";

export const env = {
  port,
  clientUrl,
};