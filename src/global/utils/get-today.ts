import { YearMonthDay } from '../interfaces';
import { getDate } from './get-date';

export function getToday(): YearMonthDay {
	const now = new Date();
	const krTimeDiff = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 표현
	const today = new Date(now.getTime() + krTimeDiff);
	return getDate(today.toISOString());
}
