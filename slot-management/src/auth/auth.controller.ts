import { Body, Controller, Post } from '@nestjs/common';
import { LoginResponse } from '../user/types';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Description - Admin login API
   * @param userLoginDto UserLoginDto
   * @returns Admin Details with access token
   */
  @Post('login')
  async login(@Body() loginDto: UserLoginDto): LoginResponse {
    return this.authService.login(loginDto);
  }

  /**
   * Description - User login API
   * @param userLoginDto UserLoginDto
   * @returns User Details with access token
   */
  @Post('user/login')
  async userLogin(@Body() loginDto: UserLoginDto): LoginResponse {
    return this.authService.userLogin(loginDto);
  }
}
