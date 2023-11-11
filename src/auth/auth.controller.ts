import { Controller, HttpCode, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AccessTokenGuard, LocalLoginAuthGuard, RefreshTokenGuard } from './guards';
import { GetUser, JwtExceptionFilter, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { AuthService } from './auth.service';
import { AuthResponse } from './enums';

@Controller('auth')
@UseFilters(JwtExceptionFilter)
export class AuthController {
	constructor(
		private readonly authService: AuthService, //
	) {}

	@Post('login')
	@UseGuards(LocalLoginAuthGuard)
	@ResponseMessage(AuthResponse.LOGIN)
	async login(
		@GetUser() user: User, //
	) {
		return await this.authService.login(user);
	}

	@Post('logout')
	@UseGuards(AccessTokenGuard)
	@ResponseMessage(AuthResponse.LOGOUT)
	@HttpCode(200)
	async logout(
		@GetUser() user: User, //
	) {
		return await this.authService.logout(user);
	}

	@Post('refresh')
	@UseGuards(RefreshTokenGuard)
	@ResponseMessage(AuthResponse.REFRESH)
	@HttpCode(200)
	refresh(
		@GetUser() user: User, //
	) {
		return this.authService.refresh(user);
	}
}
