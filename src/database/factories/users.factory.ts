import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users';

export const UsersFactory = setSeederFactory(User, async (faker) => {
	const user = new User();
	user.username = faker.internet.userName();
	user.password = await bcrypt.hash('12345aa!@', 10);
	return user;
});
