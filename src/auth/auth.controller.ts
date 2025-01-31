import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userServices: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(@Body() loginReq: { userName: string; password: string }) {
    try {
      let user = await this.userServices.getUserByUserName(loginReq.userName);
      if (!user) {
        user = await this.userServices.getUserByEmail(loginReq.userName);
      }

      if (!user) {
        throw new NotFoundException('User not found by username or email');
      }
      const isValid = await this.userServices.validatePassword(
        user.password,
        loginReq.password,
      );
      if (!isValid) {
        throw new Error('UserName Or Password not match');
      }
      const token = await this.authService.signToken(user);
      return { status: true, token };
    } catch (error) {
      console.log('Login Fiald Error ', error);
      return { status: false, token: null, message: error.message };
    }
  }

  @Post('mail')
  async loginViaMail(@Body() loginReq: { token: string }) {
    try {
      const decode = await this.authService.validateToken(loginReq.token);

      if (!decode) {
        throw new UnauthorizedException('Token is not valid');
      }
      let user = await this.userServices.getUserByEmail(decode?.email);
      if (!user) {
        throw new NotFoundException('User Not found, Token Is not valid');
      }

      return { status: true, token: this.authService.signToken(user) };
    } catch (error) {
      console.log('Login Fiald Error ', error);
      return { status: false, token: null, message: error.message };
    }
  }
}
