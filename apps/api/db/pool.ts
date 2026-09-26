import { Pool } from "pg";
import { databaseConfig } from "../config/dbconfig.js";

export const pool = new Pool(databaseConfig);

/*
this is how we handle transactions in nodejs with pg m=odule
const client = await pool.connect();

try {
    await client.query('BEGIN');

    await client.query(
        'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
        [100, from]
    );

    await client.query(
        'UPDATE accounts SET balance = balance + $1 WHERE id = $2',
        [100, to]
    );

    await client.query('COMMIT');
} catch (err) {
    await client.query('ROLLBACK');
    throw err;
} finally {
    client.release();
}*/