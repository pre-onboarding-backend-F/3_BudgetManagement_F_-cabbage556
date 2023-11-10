import * as Joi from 'joi';

export const validationSchema = Joi.object({
	// SERVER
	SERVER_PORT: Joi.number().required(),

	// POSTGRESQL
	POSTGRESQL_USER: Joi.string().required(),
	POSTGRESQL_PASSWORD: Joi.string().required(),
	POSTGRESQL_HOST: Joi.string().required(),
	POSTGRESQL_PORT: Joi.number().required(),
	POSTGRESQL_DATABASE: Joi.string().required(),
	POSTGRESQL_SYNCHRONIZE: Joi.boolean().required(),
	POSTGRESQL_LOGGING: Joi.boolean().required(),

	// JWT
	JWT_ACCESS_SECRET: Joi.string().required(),
	JWT_ACCESS_EXPIRES_IN: Joi.number().required(),
	JWT_REFRESH_SECRET: Joi.string().required(),
	JWT_REFRESH_EXPIRES_IN: Joi.number().required(),
});
