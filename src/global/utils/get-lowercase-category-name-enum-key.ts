import { CategoryName } from '../enums';

export function getLowercaseCategoryNameEnumKey(categoryName: string): string {
	const categoryNameValues = Object.values(CategoryName);
	const categoryNameKeys = Object.keys(CategoryName);
	const index = categoryNameValues.indexOf(
		categoryName as unknown as CategoryName, //
	);
	return categoryNameKeys[index].toLowerCase();
}
