import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter, JwtExceptionFilter, TransformInterceptor } from './global';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const PORT = app.get(ConfigService).getOrThrow('SERVER_PORT');
	const reflector = new Reflector();

	app.useGlobalInterceptors(new TransformInterceptor(reflector), new ClassSerializerInterceptor(reflector));
	app.useGlobalFilters(new HttpExceptionFilter(), new JwtExceptionFilter());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
		}),
	);

	await app.listen(PORT);
}
bootstrap();
