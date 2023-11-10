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
		const { username, password: plainPassword } = createUserDto;
		const password = await bcrypt.hash(plainPassword, 10);

		await this.usersRepository.save({
			username,
			password,
		});
	}

	async findOne(where: FindOptionsWhere<User>): Promise<User> {
		return await this.usersRepository.findOne({ where });
	}

	async updateOne(where: FindOptionsWhere<User>, user: Partial<User>) {
		return await this.usersRepository.update(where, user);
	}
}
