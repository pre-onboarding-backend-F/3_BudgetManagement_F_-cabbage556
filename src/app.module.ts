import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './global/configs/validation.schema';
import { UsersModule } from './users/users.module';
import jwtConfiguration from './global/configs/jwt.configuration';
import { AuthModule } from './auth';
import { CategoriesModule } from './categories/categories.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [jwtConfiguration],
			envFilePath: `.${process.env.NODE_ENV}.env`,
			validationSchema,
		}),
		DatabaseModule,
		UsersModule,
		AuthModule,
		CategoriesModule,
	],
})
export class AppModule {}
