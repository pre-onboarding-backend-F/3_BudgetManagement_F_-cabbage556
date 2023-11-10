import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';
import { CheckAccountPipe } from './pipes';
import { ResponseMessage } from 'src/global';
import { UserResponse } from './enums';

@Controller('users')
export class UsersController {
	constructor(
		private readonly usersService: UsersService, //
	) {}

	@Post()
	@ResponseMessage(UserResponse.CREATE_USER)
	async createUser(
		@Body(CheckAccountPipe) createUserDto: CreateUserDto, //
	) {
		return await this.usersService.createUser(createUserDto);
	}
}
