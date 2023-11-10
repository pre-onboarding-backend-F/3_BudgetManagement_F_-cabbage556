import { Controller, Post, UseGuards } from '@nestjs/common';
import { LocalLoginAuthGuard } from './guards';
import { GetUser, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { AuthService } from './auth.service';
import { AuthResponse } from './enums';

@Controller('auth')
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
}
