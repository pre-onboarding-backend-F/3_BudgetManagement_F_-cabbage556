import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { BaseEntity } from 'src/global';
import { User } from 'src/users';
import { MonthlyBudgetsFactory, MainSeeder, UsersFactory, CategoryBudgetsFactory } from 'src/database';
import { MonthlyBudget } from 'src/monthly-budgets';
import { CategoryBudget } from 'src/category-budgets';
import { Category } from 'src/categories';

config({
	path: '.development.env',
});
const configService = new ConfigService();

const options: DataSourceOptions & SeederOptions = {
	type: 'postgres',
	host: 'localhost',
	port: configService.getOrThrow<number>('POSTGRESQL_PORT'),
	username: configService.getOrThrow('POSTGRESQL_USER'),
	password: configService.getOrThrow('POSTGRESQL_PASSWORD'),
	database: configService.getOrThrow('POSTGRESQL_DATABASE'),
	synchronize: configService.getOrThrow<boolean>('POSTGRESQL_SYNCHRONIZE'),
	entities: [BaseEntity, User, MonthlyBudget, CategoryBudget, Category],
	factories: [UsersFactory, MonthlyBudgetsFactory, CategoryBudgetsFactory],
	seeds: [MainSeeder],
};
export const dataSource = new DataSource(options);
