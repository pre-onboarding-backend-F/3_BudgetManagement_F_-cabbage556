import { YearMonthDay } from '../interfaces';

export function getLastWeekDate({ year, month, day }: YearMonthDay): YearMonthDay {
	const lastWeekDate = day - 7;
	const isMonthJanuary = month === 1;

	if (lastWeekDate < 0 && isMonthJanuary) {
		const lastWeek = new Date(year - 1, 12, lastWeekDate);
		return {
			year: lastWeek.getFullYear(),
			month: lastWeek.getMonth() + 1,
			day: lastWeek.getDate(),
		};
	}

	if (lastWeekDate < 0) {
		const lastWeek = new Date(year, month - 1, lastWeekDate);
		return {
			year: lastWeek.getFullYear(),
			month: lastWeek.getMonth() + 1,
			day: lastWeek.getDate(),
		};
	}

	const lastWeek = new Date(year, month - 1, lastWeekDate);
	return {
		year: lastWeek.getFullYear(),
		month: lastWeek.getMonth() + 1,
		day: lastWeek.getDate(),
	};
}
