import { CategoryName } from '../enums';

type LowercaseCategoryNameKeys = Lowercase<keyof typeof CategoryName>;
type CategoriesAmount = {
	[key in LowercaseCategoryNameKeys]: number;
};

export function getTotalAmount(categoriesAmount: CategoriesAmount): number {
	let totalAmount = 0;
	for (const key in categoriesAmount) {
		totalAmount += categoriesAmount[key];
	}
	return totalAmount;
}
