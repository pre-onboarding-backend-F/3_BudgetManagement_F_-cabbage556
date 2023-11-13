import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CategoryName, getLowercaseCategoryNameEnumKey } from 'src/global';

@ValidatorConstraint({ name: 'valid-category-string', async: false })
export class IsValidCategoryString implements ValidatorConstraintInterface {
	validate(value: any): boolean {
		// CreateExpenseDto의 category 필드의 값으로부터 CategoryName enum 키를 가져올 수 없으면 유효하지 않은 값으로 판단
		const categoryEnumKey = getLowercaseCategoryNameEnumKey(value);
		return categoryEnumKey !== undefined;
	}

	defaultMessage(): string {
		return `$property 필드에 입력할 수 있는 값은 ${Object.values(CategoryName)}입니다.`;
	}
}
