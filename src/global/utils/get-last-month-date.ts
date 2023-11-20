import { YearMonthDay } from '../interfaces';

export function getLastMonthDate({ year, month }: Omit<YearMonthDay, 'day'>): Omit<YearMonthDay, 'day'> {
	return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}
