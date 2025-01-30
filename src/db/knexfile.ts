import { config } from 'dotenv';
config({ path: '.env' });

import { knex as Knex } from 'knex';

const password = process.env.DB_PASS?.toString() ?? 'passsword';

const knex = Knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: password,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 5432,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/migrations',
  },
});

export default knex;
