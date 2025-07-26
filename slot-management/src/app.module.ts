import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { winstonOptions } from './common/configs/logger.config';
import { errorMessages } from './common/configs/messages.config';
import { LogCleanerService } from './common/cron.service';
import { GlobalExceptionFilter } from './common/global-exception-filter';
import { ResponseInterceptorService } from './common/interceptors/response-interceptor.service';
import { SlotModule } from './event/slot.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { SeedsService } from './seed/seed.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    WinstonModule.forRootAsync({ useFactory: () => winstonOptions() }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: {
          expiresIn: configService.get<string>('TOKEN_EXPIRATION'),
        },
      }),
    }),
    AuthModule,
    UserModule,
    CommonModule,
    SlotModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptorService,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        exceptionFactory: (validationErrors: ValidationError[] = []): BadRequestException => {
          const errorKey = Object.keys(validationErrors[0].constraints)[0];
          return new BadRequestException(
            validationErrors[0].constraints[`${errorKey}`] || errorMessages.UNEXPECTED_ERROR,
          );
        },
      }),
    },
    LogCleanerService,
    SeedsService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
