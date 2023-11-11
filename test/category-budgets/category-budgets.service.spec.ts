import { Test, TestingModule } from '@nestjs/testing';
import { CategoryBudgetsService } from '../../src/category-budgets/category-budgets.service';

describe('CategoryBudgetsService', () => {
	let service: CategoryBudgetsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CategoryBudgetsService],
		}).compile();

		service = module.get<CategoryBudgetsService>(CategoryBudgetsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
