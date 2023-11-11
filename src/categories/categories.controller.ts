import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ResponseMessage } from 'src/global';
import { CategoryResponse } from './enum';
import { Category } from './entity';
import { AccessTokenGuard } from 'src/auth';

@Controller('categories')
@UseGuards(AccessTokenGuard)
export class CategoriesController {
	constructor(
		private readonly categoriesService: CategoriesService, //
	) {}

	@Get()
	@ResponseMessage(CategoryResponse.GET_ALL_CATEGORY_NAMES)
	async getAllCategoryNames(): Promise<Category[]> {
		return await this.categoriesService.findAll();
	}
}
