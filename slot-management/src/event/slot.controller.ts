import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { RequestUser } from '../common/decorators/request-user.decorator';
import { Roles } from '../common/decorators/role.decorator';
import { RequestVerify } from '../common/guards/request-verify.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { OnlyMessageResponse } from '../common/types';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RoleEnum } from '../user/types';
import { CreateSlotDto } from './dtos/create.slot.dto';
import { GetSlotDto } from './dtos/get-slot.dto';
import { SlotService } from './slot.service';
import { GetSlotDetailsModel } from './type';

@Controller('slot')
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @Post()
  @UseGuards(RequestVerify, RoleGuard)
  @Roles(RoleEnum.USER)
  async createSlot(@RequestUser() user: UserDocument, @Body() createSlotDto: CreateSlotDto): OnlyMessageResponse {
    return this.slotService.createSlot(user._id, createSlotDto);
  }

  @Put('/:id')
  @UseGuards(RequestVerify, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  async bookSlot(@RequestUser() user: UserDocument, @Param('id') eventId: Types.ObjectId): OnlyMessageResponse {
    return this.slotService.bookSlot(user._id, eventId);
  }

  @Get()
  @UseGuards(RequestVerify, RoleGuard)
  @Roles(RoleEnum.ADMIN)
  async getDonationsList(@RequestUser() user: User, @Query() query: GetSlotDto): GetSlotDetailsModel {
    return this.slotService.getSlotList(query);
  }
}
