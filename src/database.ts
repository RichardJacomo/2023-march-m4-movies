import { Client } from "pg";

const client: Client = new Client({
  user: "richard",
  password: "102030",
  host: "localhost",
  database: "entrega_s2_m4",
  port: 5432,
});

const startDatabase = async (): Promise<void> => {
  await client.connect();
  console.log("Database connected!");
};

export { client, startDatabase };
