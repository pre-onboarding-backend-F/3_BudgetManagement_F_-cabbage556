import { getToday } from 'src/global';
import { MonthlyExpense } from 'src/monthly-expenses';
import { setSeederFactory } from 'typeorm-extension';

export const MonthlyExpensesFactory = setSeederFactory(MonthlyExpense, () => {
	const monthlyExpense = new MonthlyExpense();
	const { year } = getToday();
	monthlyExpense.year = year; // 올해
	return monthlyExpense;
});
