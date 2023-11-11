import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyBudgetsService } from 'src/monthly-budgets';

describe('MonthlyBudgetsService', () => {
	let service: MonthlyBudgetsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MonthlyBudgetsService],
		}).compile();

		service = module.get<MonthlyBudgetsService>(MonthlyBudgetsService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
