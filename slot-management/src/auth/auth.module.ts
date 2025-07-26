import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerify, emailVerifySchema } from './schemas/email-verify.schema';
import { ForgotPassword, forgotPasswordSchema } from './schemas/forgot-password.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailVerify.name, schema: emailVerifySchema },
      { name: ForgotPassword.name, schema: forgotPasswordSchema },
    ]),
    HttpModule.register({
      timeout: 50000,
      maxRedirects: 5,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
