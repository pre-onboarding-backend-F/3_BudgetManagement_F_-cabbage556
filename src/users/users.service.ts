import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { YearMonthDay } from 'src/global';

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

	async findRandomOneId(userId: string, { year, month }: Omit<YearMonthDay, 'day'>): Promise<Pick<User, 'id'>[]> {
		const randomOneId = await this.usersRepository.query(
			`SELECT
					id
			FROM
					"user"
			WHERE
				id != '${userId}'
				AND EXISTS (
					SELECT id
					FROM monthly_budget mb
					WHERE mb.year = ${year} AND mb.month = ${month}
				)
				AND EXISTS (
					SELECT id
					FROM monthly_expense me
					WHERE me.year = ${year} AND me.month = ${month}
				)
			ORDER BY RANDOM()
			LIMIT 1`,
		);
		return randomOneId;
	}

	async updateOne(where: FindOptionsWhere<User>, user: Partial<User>) {
		return await this.usersRepository.update(where, user);
	}
}
