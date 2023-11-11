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

	async validateUser(username: string, password: string) {
		const user = await this.usersService.findOne({ username });
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
		const { id, username } = user;

		const accessToken = this.generateAccessToken({ id, username });
		const refreshToken = this.generateRefreshToken({ id, username });

		user.refreshToken = refreshToken;
		await this.usersService.updateOne({ id }, user);

		return {
			accessToken,
			refreshToken,
		};
	}

	async logout(user: User) {
		await this.usersService.updateOne({ id: user.id }, { refreshToken: null });
	}

	refresh(user: User) {
		return {
			accessToken: this.generateAccessToken({ id: user.id, username: user.username }),
		};
	}

	async checkAlreadyLogOut(id: string): Promise<User | null> {
		return await this.usersService.findOne({ id });
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
