import { getToday } from 'src/global';
import { MonthlyBudget } from 'src/monthly-budgets';
import { setSeederFactory } from 'typeorm-extension';

export const MonthlyBudgetsFactory = setSeederFactory(MonthlyBudget, () => {
	const monthlyBudget = new MonthlyBudget();
	const { year, month } = getToday();
	monthlyBudget.year = year;
	monthlyBudget.month = month;
	return monthlyBudget;
});
