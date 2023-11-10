import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfiguration', () => ({
	access: {
		secret: process.env.JWT_ACCESS_SECRET_KEY,
		expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
	},

	refresh: {
		secret: process.env.JWT_REFRESH_SECRET_KEY,
		expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
	},
}));
