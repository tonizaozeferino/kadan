import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { env } from "./env";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;

  const connectionString = env.DATABASE_URL;

  const client = postgres(connectionString, {
    ssl: "require",
    max: process.env.NODE_ENV === "production" ? 1 : 10, // Serverless optimization
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Disable prepared statements for serverless
  });

  _db = drizzle(client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
