import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { User } from 'src/users';
import { MonthlyBudgetsFactory, MainSeeder, UsersFactory, CategoryBudgetsFactory } from 'src/database';
import { MonthlyBudget } from 'src/monthly-budgets';
import { CategoryBudget } from 'src/category-budgets';
import { Category } from 'src/categories';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({
	path: '.development.env',
});

const options: DataSourceOptions & SeederOptions = {
	type: 'postgres',
	host: 'localhost',
	port: Number(process.env.POSTGRESQL_PORT),
	username: process.env.POSTGRESQL_USER,
	password: process.env.POSTGRESQL_PASSWORD,
	database: process.env.POSTGRESQL_DATABASE,
	entities: [User, MonthlyBudget, CategoryBudget, Category],
	namingStrategy: new SnakeNamingStrategy(),
	factories: [UsersFactory, MonthlyBudgetsFactory, CategoryBudgetsFactory],
	seeds: [MainSeeder],
};
export const dataSource = new DataSource(options);
