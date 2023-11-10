import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.getOrThrow('POSTGRESQL_HOST'),
				port: configService.getOrThrow('POSTGRESQL_PORT'),
				username: configService.getOrThrow('POSTGRESQL_USER'),
				password: configService.getOrThrow('POSTGRESQL_PASSWORD'),
				database: configService.getOrThrow('POSTGRESQL_DATABASE'),
				entities: [__dirname + '/../**/*.entity.*'],
				synchronize: configService.getOrThrow('POSTGRESQL_SYNCHRONIZE'),
				logging: configService.getOrThrow('POSTGRESQL_LOGGING'),
				namingStrategy: new SnakeNamingStrategy(),
			}),
		}),
	],
})
export class DatabaseModule {}
