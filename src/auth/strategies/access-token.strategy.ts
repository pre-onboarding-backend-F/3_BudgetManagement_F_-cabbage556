import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/global';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { AuthService } from '../auth.service';
import { JsonWebTokenError } from 'jsonwebtoken';
import { AuthException } from '../enums';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access') {
	constructor(
		@Inject(jwtConfiguration.KEY)
		private readonly config: ConfigType<typeof jwtConfiguration>,
		private readonly authService: AuthService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.access.secret,
		});
	}

	async validate(payload: TokenPayload) {
		// 1. 로그아웃 시 refreshToken을 null로 설정
		// 2. 로그아웃 시 사용한 액세스 토큰으로 재요청하면 refreshToken을 확인해 유효하지 않은 액세스 토큰으로 판단
		const { refreshToken } = await this.authService.checkAlreadyLogOut(payload.id);
		if (!refreshToken) {
			throw new JsonWebTokenError(AuthException.INVALID_ACCESS_TOKEN);
		}

		return payload;
	}
}
