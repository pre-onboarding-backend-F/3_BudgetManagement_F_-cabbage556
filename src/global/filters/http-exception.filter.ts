import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const exceptionObj = exception.getResponse();

		response.status(status).json({
			success: false,
			statusCode: status,
			error: exceptionObj['error'],
			message: exceptionObj['message'],
			timestamp: new Date().toISOString(), // 2023-10-27T14:30:20.123Z
			path: request.url,
		});
	}
}
