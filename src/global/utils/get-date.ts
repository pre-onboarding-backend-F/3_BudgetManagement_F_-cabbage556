import { YearMonthDay } from '../interfaces';

export function getDate(yyyyMM: string): YearMonthDay {
	const date = new Date(yyyyMM);
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	return {
		year,
		month,
		day,
	};
}
