import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthException } from '../enums';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh') {
	handleRequest(err: any, user: any) {
		if (err || !user) {
			throw new JsonWebTokenError(AuthException.INVALID_REFRESH_TOKEN);
		}
		return user;
	}
}
