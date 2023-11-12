import { CategoryName } from '../enums';

type LowercaseCategoryNameKeys = Lowercase<keyof typeof CategoryName>;

export type CategoriesAmount = {
	[key in LowercaseCategoryNameKeys]: number;
};
