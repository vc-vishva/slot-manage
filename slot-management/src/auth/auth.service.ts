import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { errorMessages, successMessages } from '../common/configs/messages.config';
import { LoginResponse } from '../user/types';
import { UserService } from '../user/user.service';
import { ResponseHandler } from '../utils/response-handler';
import { UserLoginDto } from './dtos/login.dto';

/**
 * Description - Auth Service
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * Description - Admin login service
   * @param userLoginDto UserLoginDto
   * @returns Admin Details with access token
   */
  async login(loginDto: UserLoginDto): LoginResponse {
    const admin = await this.userService.getUser({ userType: 'Admin', email: loginDto.email }, true);

    if (!admin) throw new NotFoundException(errorMessages.INCORRECT_DETAILS);
    const passwordCheck = await admin.validatePassword(loginDto.password);

    if (!passwordCheck) {
      throw new UnauthorizedException(errorMessages.INCORRECT_DETAILS);
    }

    const payload = {
      _id: admin._id,
      email: admin.email,
      userType: admin.userType,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return ResponseHandler.success(
      {
        _id: admin._id,
        phoneNumber: admin.phoneNumber,
        email: admin.email,
        accessToken,
      },
      successMessages.ADMIN_LOGGED_IN,
      HttpStatus.OK,
    );
  }

  /**
   * Description - User login service
   * @param userLoginDto UserLoginDto
   * @returns User Details with access token
   */
  async userLogin(loginDto: UserLoginDto): LoginResponse {
    const user = await this.userService.getUser({ email: loginDto.email }, true);
    if (!user) throw new NotFoundException(errorMessages.INCORRECT_DETAILS);

    const passwordCheck = await user.validatePassword(loginDto.password);
    if (!passwordCheck) {
      throw new UnauthorizedException(errorMessages.INCORRECT_DETAILS);
    }
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return ResponseHandler.success(
      {
        _id: user._id,
        email: user.email,
        firstName: user.name,
        accessToken,
      },
      successMessages.USER_LOGGED_IN,
      HttpStatus.OK,
    );
  }
}
