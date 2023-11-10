import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, TransformInterceptor } from './global';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const PORT = app.get(ConfigService).getOrThrow('SERVER_PORT');
	const reflector = new Reflector();

	app.useGlobalInterceptors(new TransformInterceptor(reflector));
	app.useGlobalFilters(new HttpExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	await app.listen(PORT);
}
bootstrap();
