
import pg from 'pg';

const username = process.env.USER || 'endaradi';
const configs = [
    { user: 'user', password: 'password', database: 'habit_tracker' },
    { user: 'postgres', password: 'password', database: 'postgres' },
    { user: 'postgres', password: 'postgres', database: 'postgres' },
    { user: 'postgres', password: '', database: 'postgres' },
    { user: username, password: '', database: 'postgres' },
    { user: username, password: '', database: username },
];

async function testConnection() {
    console.log('Testing database connections...');

    for (const config of configs) {
        const { user, password, database } = config;
        const connectionString = `postgres://${user}:${password}@localhost:5432/${database}`;
        console.log(`Trying: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

        const client = new pg.Client({
            connectionString,
        });

        try {
            await client.connect();
            console.log(`✅ SUCCESS! Connected with user: ${user}, db: ${database}`);
            console.log(`Suggested DATABASE_URL: ${connectionString}`);
            await client.end();
            return; // Exit on first success
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }

    console.log('All attempts failed.');
}

testConnection();
