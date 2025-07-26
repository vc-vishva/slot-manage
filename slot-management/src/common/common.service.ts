import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, genSalt, hash } from 'bcrypt';
import * as crypto from 'crypto';
import { randomBytes } from 'crypto';
import { PipelineStage } from 'mongoose';
import { Defaults } from './configs/default.config';
import { FilterDto } from './dtos/filter.dto';
import { PaginationDto } from './dtos/pagination.dto';
import { FilterData } from './types';

@Injectable()
export class CommonService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * Description - Generate random string common function
   * @param length number
   * @returns random string
   */
  public generateToken(length: number): string {
    const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charLength = char.length;

    const randomBytesFromCrypto = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytesFromCrypto[i] % charLength;
      result += char.charAt(randomIndex);
    }

    return result;
  }

  /**
   * Description - Convert plain text to hash common function
   * @param plainText string
   * @returns Hash Password
   */
  public async hashPassword(plainText: string): Promise<string> {
    const salt = await genSalt(Defaults.SALT_ROUND);
    return hash(plainText, salt);
  }

  /**
   * Description - Compare password common function
   * @param password string
   * @param userPassword string
   * @returns True | False
   */
  public async comparePassword(password: string, userPassword: string): Promise<boolean> {
    return compare(userPassword, password);
  }

  /**
   * Description - Get Pagination common stage
   * @param query PaginationDto
   * @returns Common pagination pipeline stage
   */
  public getPaginationStages(query: PaginationDto): PipelineStage[] {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;

    return [
      {
        $group: {
          _id: null,
          totalData: { $sum: 1 },
          list: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          _id: 0,
          totalData: 1,
          list: {
            $slice: ['$list', startIndex, limit],
          },
        },
      },
    ];
  }

  public getSearchSortFilterStages(
    query: FilterDto,
    customSearchFields: string[],
    filter?: FilterData,
  ): PipelineStage[] {
    // const filter: FilterData = {};
    const filterOption = filter ?? {};

    let searchQuery = {};
    if (query.search) {
      searchQuery = {
        $or: customSearchFields.map((field) => ({
          [field]: { $regex: new RegExp(query.search, 'i') },
        })),
      };
    }

    let sortValue: 1 | -1; // Explicitly define type
    const sortKey = query?.sortKey?.trim() || 'positionalIndex';
    if (sortKey === 'positionalIndex') {
      sortValue = 1; // Always ascending for positionalIndex
    } else {
      sortValue = query?.sortValue === 'asc' ? 1 : -1;
    }

    return [
      {
        $match: {
          $and: [filterOption, searchQuery],
        },
      },
      {
        $sort: {
          [sortKey]: sortValue,
        },
      },
    ];
  }
  public encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.configService.get<string>('CRYPTO_SECRET_KEY'), 'utf-8');

    // Use a secure mode (GCM) and ensure authenticated encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    // Ensure the use of the default padding scheme is not necessary with GCM mode

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    // Get the authentication tag
    const tag = cipher.getAuthTag();

    // Return IV, authentication tag, and encrypted text
    return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
  }

  public decrypt(encryptedText: string): string {
    // Split the encrypted text into IV, encrypted data, and authentication tag
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');

    const key = Buffer.from(this.configService.get<string>('CRYPTO_SECRET_KEY'), 'utf-8');

    // Create a decipher object with the same parameters used for encryption
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the data
    let decrypted = decipher.update(encryptedData, null, 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }
}
