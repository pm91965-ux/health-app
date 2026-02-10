const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_ZKzYb1xu7Qwf@ep-sparkling-bonus-agl8cem2-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function runSchema() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to PostgreSQL.');

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await client.query(schemaSql);
        console.log('Schema executed successfully.');
    } catch (err) {
        console.error('Error executing schema:', err);
        process.exit(1);
    } finally {
        await client.end();
        console.log('Disconnected from PostgreSQL.');
    }
}

runSchema();