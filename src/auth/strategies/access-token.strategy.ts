import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/global';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { AuthService } from '../auth.service';

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
		// 1. 로그아웃 시 refreshToken을 null로 설정하여 로그아웃 상태임을 저장
		// 2. 로그아웃 시 사용했지만 아직 만료시간이 되지 않아 여전히 유효한 액세스 토큰으로 재요청하면 DB에 저장된 refreshToken을 확인
		// 3. refreshToken이 null이라면 유효하지 않은 액세스 토큰으로 판단
		const { refreshToken } = await this.authService.checkAlreadyLogOut(payload.id);
		if (!refreshToken) {
			return false;
		}

		return payload;
	}
}
