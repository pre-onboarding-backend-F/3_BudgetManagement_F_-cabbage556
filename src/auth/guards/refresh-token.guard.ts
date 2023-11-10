import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { AuthException } from '../enums';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh') {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		return super.canActivate(context);
	}

	handleRequest(err: any, user: any) {
		if (err || !user) {
			throw new JsonWebTokenError(AuthException.INVALID_REFRESH_TOKEN);
		}
		return user;
	}
}
