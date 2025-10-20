import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/user.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false, // Important: false for production
  logging: true,
  entities: [User],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
