import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from '../auth/dtos/create.user.dto';
import { CommonService } from '../common/common.service';
import { User, UserDocument } from './schemas/user.schema';
import { UserQueryObject } from './types';

/**
 * Description - User service
 */
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private configService: ConfigService,
    private commonService: CommonService,
  ) {}
  /**
   * Description - Create multiple users
   * @param usersData Array of CreateUserDto
   * @returns Created Users
   */
  async createManyUsers(usersData: Partial<CreateUserDto>[]): Promise<Partial<UserDocument>[]> {
    const preparedUsers = await Promise.all(
      usersData.map(async (userData) => {
        const password = await this.commonService.hashPassword(userData.password);

        return {
          ...userData,
          password,
        };
      }),
    );

    return this.userModel.insertMany(preparedUsers);
  }

  /**
   * Description - Get user common function
   * @param query UserQueryObject
   * @returns User
   */
  async getUserAndUpdate(query: UserQueryObject, update: object = {}): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(query, update);
  }

  /**
   * Description - Get user common function
   * @param query UserQueryObject
   * @returns User
   */
  async getUser(query: UserQueryObject, shouldGetPassword = false): Promise<UserDocument> {
    const queryBuilder = this.userModel.findOne(query);
    return shouldGetPassword ? queryBuilder.select('+password') : queryBuilder.exec();
  }

  /**
   * Description - Get user json common function
   * @param query UserQueryObject
   * @returns User
   */
  async getUserJson(query: UserQueryObject, select: object = {}): Promise<UserDocument> {
    return this.userModel.findOne(query, select).lean();
  }
}
