import { CategoryExpense } from 'src/category-expenses';
import { getToday } from 'src/global';
import { setSeederFactory } from 'typeorm-extension';

export const CategoryExpensesFactory = setSeederFactory(CategoryExpense, (faker) => {
	const categoryExpense = new CategoryExpense();
	const { day } = getToday();

	categoryExpense.date = faker.number.int({ min: 1, max: day }); // 1일부터 오늘 날짜까지
	categoryExpense.memo = faker.word.noun(); // 랜덤 단어

	const amounts: number[] = Array(50)
		.fill(1000)
		.map((amount, i) => amount * (i + 1));
	categoryExpense.amount = faker.helpers.arrayElement(amounts); // 1000원부터 5만원까지 1000원 차이의 금액 중 랜덤 선택
	categoryExpense.excludingInTotal = faker.datatype.boolean(0.1); // true 선택 10%

	return categoryExpense;
});
