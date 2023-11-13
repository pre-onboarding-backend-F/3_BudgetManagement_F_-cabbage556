import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';
import { ExpenseException } from '../enums';

export class InvalidParseUUIDPipe extends ParseUUIDPipe {
	async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
		try {
			return await super.transform(value, metadata);
		} catch {
			throw this.exceptionFactory(ExpenseException.INVALID_ID);
		}
	}
}
