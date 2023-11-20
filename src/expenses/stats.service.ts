import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
	async getExpensesStats() {
		return StatsService.name;
	}
}
