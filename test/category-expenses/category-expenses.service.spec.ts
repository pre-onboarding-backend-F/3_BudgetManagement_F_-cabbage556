import { Test, TestingModule } from '@nestjs/testing';
import { CategoryExpensesService } from '../../src/category-expenses/category-expenses.service';

describe('CategoryExpensesService', () => {
	let service: CategoryExpensesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CategoryExpensesService],
		}).compile();

		service = module.get<CategoryExpensesService>(CategoryExpensesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
