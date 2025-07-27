import { FilterQuery, Types } from 'mongoose';
import { CommonResponse } from '../common/types';
import { UserDocument } from './schemas/user.schema';

export interface LoginData {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  accessToken: string;
}

export enum RoleEnum {
  ADMIN = 'Admin',
  USER = 'User',
}

export type LoginResponse = Promise<CommonResponse<LoginData>>;
export type UserQueryObject = Partial<FilterQuery<UserDocument>>;
