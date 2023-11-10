import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from 'src/global';
import jwtConfiguration from 'src/global/configs/jwt.configuration';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(
		@Inject(jwtConfiguration.KEY)
		private readonly config: ConfigType<typeof jwtConfiguration>,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.refresh.secret,
		});
	}

	validate(payload: TokenPayload) {
		return payload;
	}
}
