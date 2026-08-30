import pg from "pg";
import { ENV } from "../config/env.js";

const isProduction = ENV.NODE_ENV === "production";

export const pool = new pg.Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
  if (err) {
    console.error(
      "Error acquiring client from database pool",
      err.stack
    );
  } else {
    console.log("Database connected successfully");
    release();
  }
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
  process.exit(-1);
});

export const query = (text, params) => {
  return pool.query(text, params);
};