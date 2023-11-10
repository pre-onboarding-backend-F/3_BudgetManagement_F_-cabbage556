export enum AuthException {
	USER_NOT_EXISTS = '존재하지 않는 유저입니다.',
	PASSWORD_NOT_MATCHED = '비밀번호가 일치하지 않습니다.',
	CANNOT_LOGIN = '로그인할 수 없습니다.',
	INVALID_ACCESS_TOKEN = '유효하지 않은 액세스 토큰입니다.',
	INVALID_REFRESH_TOKEN = '유효하지 않은 리프레시 토큰입니다.',
}
