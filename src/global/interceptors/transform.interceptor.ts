import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseMessageKey } from '../decorators/response-key.decorator';
import { Reflector } from '@nestjs/core';

export interface Info {
	success: true;
	statusCode: number;
	message: string;
}

export type Response<T> = Info & {
	result: T;
};

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<Text, Response<T>> {
	constructor(private reflector: Reflector) {}

	intercept(ctx: ExecutionContext, next: CallHandler): Observable<Response<T>> {
		const status = ctx.switchToHttp().getResponse().statusCode;
		const message = this.reflector.get<string>(ResponseMessageKey, ctx.getHandler()) ?? '';

		return next.handle().pipe(
			map((data) => ({
				success: true,
				statusCode: status,
				message,
				result: data,
			})),
		);
	}
}
