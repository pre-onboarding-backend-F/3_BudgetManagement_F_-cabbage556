import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User, UsersService } from 'src/users';
import * as bcrypt from 'bcryptjs';
import { ConfigType } from '@nestjs/config';
import jwtConfiguration from 'src/global/configs/jwt.configuration';
import { TokenPayload } from 'src/global';
import { JwtService } from '@nestjs/jwt';
import { AuthException } from './enums';

@Injectable()
export class AuthService {
	constructor(
		@Inject(jwtConfiguration.KEY)
		private readonly config: ConfigType<typeof jwtConfiguration>,
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
	) {}

	async checkPasswordMatches(plainPassword: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(plainPassword, hashedPassword);
	}

	async validateUser(account: string, password: string) {
		const user = await this.usersService.findOne({ account });
		if (!user) {
			throw new NotFoundException(AuthException.USER_NOT_EXISTS);
		}

		const isPasswordMatched = await this.checkPasswordMatches(password, user.password);
		if (!isPasswordMatched) {
			throw new BadRequestException(AuthException.PASSWORD_NOT_MATCHED);
		}
		return user;
	}

	async login(user: User) {
		const { id, account } = user;

		const accessToken = this.generateAccessToken({ id, account });
		const refreshToken = this.generateRefreshToken({ id, account });

		user.refreshToken = refreshToken;
		await this.usersService.updateOne({ id }, user);

		return {
			accessToken,
			refreshToken,
		};
	}

	generateAccessToken(payload: TokenPayload): string {
		return this.jwtService.sign(payload, {
			secret: this.config.access.secret,
			expiresIn: `${this.config.access.expiresIn}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload): string {
		return this.jwtService.sign(payload, {
			secret: this.config.refresh.secret,
			expiresIn: `${this.config.refresh.expiresIn}s`,
		});
	}
}
