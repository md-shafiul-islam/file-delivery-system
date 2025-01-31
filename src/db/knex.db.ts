import { config } from 'dotenv';
config({ path: '.env' });
import { ConfigService } from '@nestjs/config';
import { knex as Knex } from 'knex';

const configService = new ConfigService();
const password = configService.get('DB_PASS')?.toString() ?? 'passsword';

const knexDB = Knex({
  client: 'pg',
  connection: {
    host: configService.get('DB_HOST'),
    user: configService.get('DB_USER'),
    password: password,
    database: configService.get('DB_NAME'),
    port: Number(configService.get('DB_PORT')) || 5432,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/migrations',
  },
});

export default knexDB;
