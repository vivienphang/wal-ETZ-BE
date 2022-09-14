import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

client.on("connect", () => {
  console.log("redis connected");
});

client.on("error", () => {
  console.log("redis connection error");
});

export default client;
