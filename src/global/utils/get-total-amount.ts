import { CategoriesAmount } from '../types';

export function getTotalAmount(categoriesAmount: CategoriesAmount): number {
	let totalAmount = 0;
	for (const key in categoriesAmount) {
		totalAmount += categoriesAmount[key];
	}
	return totalAmount;
}
