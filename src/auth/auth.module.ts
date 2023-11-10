import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy, LocalLoginStrategy, RefreshTokenStrategy } from './strategies';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users';

@Module({
	imports: [UsersModule, PassportModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, LocalLoginStrategy, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
