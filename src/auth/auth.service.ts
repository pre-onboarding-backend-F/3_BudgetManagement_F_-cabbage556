import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService, //
	) {}
}
