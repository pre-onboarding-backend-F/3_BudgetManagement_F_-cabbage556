import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';

@Catch(JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
	catch(exception: JsonWebTokenError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = HttpStatus.BAD_REQUEST;

		response.status(status).json({
			success: false,
			statusCode: status,
			error: exception.name,
			message: exception.message,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
