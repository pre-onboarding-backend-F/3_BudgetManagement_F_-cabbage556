import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>, //
	) {}

	async isUserExist(where: FindOptionsWhere<User>): Promise<boolean> {
		return await this.usersRepository.exist({ where });
	}

	async createUser(createUserDto: CreateUserDto) {
		const { account, password: plainPassword } = createUserDto;
		const password = await bcrypt.hash(plainPassword, 10);

		await this.usersRepository.save({
			account,
			password,
		});
	}
}
