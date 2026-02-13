import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');
    } catch (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
};

connectDB();

export const db = drizzle(client, { schema });
