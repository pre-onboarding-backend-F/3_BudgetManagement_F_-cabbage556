import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CategoryName } from 'src/global';

@Injectable()
export class CategoriesService implements OnModuleInit {
	constructor(
		@InjectRepository(Category)
		private readonly categoriesRepository: Repository<Category>, //
	) {}

	async onModuleInit(): Promise<void> {
		const categoryNames = Object.values(CategoryName).map((name) => {
			return { name };
		});
		await this.categoriesRepository.upsert(categoryNames, {
			conflictPaths: ['name'],
			skipUpdateIfNoValuesChanged: true,
		});
	}

	async findAll(): Promise<Category[]> {
		return await this.categoriesRepository.find();
	}

	async findOne(where: FindOptionsWhere<Category>): Promise<Category> {
		return await this.categoriesRepository.findOne({ where });
	}
}
