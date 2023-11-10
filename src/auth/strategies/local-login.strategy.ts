import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthException } from '../enums';

@Injectable()
export class LocalLoginStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService, //
	) {
		super();
	}

	async validate(username: string, password: string) {
		const user = await this.authService.validateUser(username, password);
		if (!user) {
			throw new UnauthorizedException(AuthException.CANNOT_LOGIN);
		}
		return user;
	}
}
