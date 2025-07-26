import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

/**
 * Description - User Controller
 */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
