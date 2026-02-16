
import pg from 'pg';

const config = {
    user: 'postgres',
    password: process.env.DB_PASSWORD || '749283886',
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default DB first
};

async function createDatabase() {
    const client = new pg.Client(config);
    try {
        await client.connect();
        console.log("Connected to 'postgres' database.");

        // Check if DB exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'habit_tracker'");
        if (res.rowCount === 0) {
            console.log("Creating database 'habit_tracker'...");
            await client.query('CREATE DATABASE habit_tracker');
            console.log("✅ Database created successfully!");
        } else {
            console.log("Database 'habit_tracker' already exists.");
        }
    } catch (err) {
        console.error("❌ Error creating database:", err);
    } finally {
        await client.end();
    }
}

createDatabase();
