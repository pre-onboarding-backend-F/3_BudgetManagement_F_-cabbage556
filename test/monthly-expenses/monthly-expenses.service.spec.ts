import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyExpensesService } from '../../src/monthly-expenses/monthly-expenses.service';

describe('MonthlyExpensesService', () => {
	let service: MonthlyExpensesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [MonthlyExpensesService],
		}).compile();

		service = module.get<MonthlyExpensesService>(MonthlyExpensesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
