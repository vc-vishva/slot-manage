/* eslint-disable no-console */
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from './user';

@Injectable()
export class SeedsService {
  /**
   * Seed Service Constructor
   * @param models stateAndCitiesModel, currencyModel, userNotificationModel, linkToPayAgentDataModel
   */

  constructor(private readonly userService: UserService) {}

  async seedUserAndAdmin(): Promise<string> {
    const userData = User;

    const existingUsers = await this.userService.getUserJson({});
    // Clone the first super admin object from array
    if (!existingUsers) {
      await this.userService.createManyUsers(userData);
      return ' data added successfully.';
    } else {
      console.log(' data already exists. Skipping the seed.');
      return 'data  already exists. Skipping the seed.';
    }
  }
}
