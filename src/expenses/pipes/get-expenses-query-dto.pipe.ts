import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { GetExpensesQueryDto } from '../dto';
import { ExpenseException } from '../enums';

@Injectable()
export class GetExpensesQueryDtoPipe implements PipeTransform {
	transform(dto: GetExpensesQueryDto) {
		const { startDate, endDate, minAmount, maxAmount } = dto;

		const isBefore = this.isStartDateBeforeEndDate(startDate, endDate);
		if (!isBefore) {
			throw new BadRequestException(ExpenseException.INVALID_START_DATE);
		}

		if (minAmount && maxAmount) {
			if (minAmount > maxAmount) {
				throw new BadRequestException(ExpenseException.INVALID_MIN_AMOUNT);
			}
		}

		return dto;
	}

	isStartDateBeforeEndDate(startDate: string, endDate: string): boolean {
		const startTime = new Date(startDate).getTime();
		const endTime = new Date(endDate).getTime();

		return startTime <= endTime;
	}
}
