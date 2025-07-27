import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Defaults } from '../../common/configs/default.config';
import { fieldInvalid, maximumLength, minimumLength, validationMessages } from '../../common/configs/messages.config';

export class CreateUserDto {
  @Transform(({ value }): string => (value as string).trim())
  @MinLength(2, { message: minimumLength(' Name', 2) })
  @MaxLength(100, { message: maximumLength(' Name', 100) })
  @Matches(/^[a-zA-Z ]+$/, { message: ` Name ${validationMessages.NAME_IS_ALPHA}` })
  @IsNotEmpty({ message: ` Name ${validationMessages.NOT_EMPTY}` })
  @IsString({ message: ` Name ${validationMessages.INVALID_STRING}` })
  name: string;

  @Transform(({ value }): string => (value as string).trim())
  @Matches(Defaults.PASSWORD_REGEX, {
    message: validationMessages.PASSWORD_IS_VALID,
  })
  @IsString()
  @IsNotEmpty({ message: `Password ${validationMessages.NOT_EMPTY}` })
  password: string;

  @Transform(({ value }): string => (value as string).trim().toLowerCase())
  @IsEmail({}, { message: fieldInvalid('Email') })
  @MaxLength(100, { message: maximumLength('Email', 100) })
  @IsNotEmpty({ message: `Email ${validationMessages.NOT_EMPTY}` })
  email: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}
