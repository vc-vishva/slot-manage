import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model, PipelineStage, Types } from 'mongoose';
import { CommonService } from '../common/common.service';
import { errorMessages, successMessages } from '../common/configs/messages.config';
import { OnlyMessageResponse } from '../common/types';
import { UserService } from '../user/user.service';
import { ResponseHandler } from '../utils/response-handler';
import { CreateSlotDto } from './dtos/create.slot.dto';
import { GetSlotDto } from './dtos/get-slot.dto';
import { Slot, SlotDocument } from './schemas/slot.schemas';
import { EventData, FilterData, GetSlotDetailsModel } from './type';

@Injectable()
export class SlotService {
  constructor(
    @InjectModel(Slot.name) private slotModel: Model<SlotDocument>,
    private commonService: CommonService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async createSlot(userId: Types.ObjectId, createSlotDto: CreateSlotDto): OnlyMessageResponse {
    const eventDetails = {
      ...createSlotDto,
      createdBy: userId,
    };

    await this.slotModel.create(eventDetails);
    return ResponseHandler.success([], `slot ${successMessages.SUCCESSFULLY_CREATED}`, HttpStatus.OK);
  }
  async bookSlot(userId: Types.ObjectId, slotId: Types.ObjectId): OnlyMessageResponse {
    const event = await this.slotModel.findOne({
      _id: slotId,
    });

    if (!event) {
      throw new NotFoundException(`Event ${errorMessages.NOT_FOUND}`);
    }
    await event.updateOne({ isConformed: true });
    return ResponseHandler.success([], `Slot ${successMessages.SUCCESSFULLY_BOOKED}`, HttpStatus.OK);
  }

  async getSlotList(query: GetSlotDto): GetSlotDetailsModel {
    const pipeline = this.getPipeline(query);
    const getEventListData = await this.slotModel
      .aggregate<EventData>(pipeline)
      .collation({ locale: 'en', caseLevel: true })
      .exec();
    const totalData = getEventListData[0]?.totalData ?? 0;
    const list = getEventListData[0]?.list ?? [];
    return ResponseHandler.success(
      {
        totalData,
        list,
      },
      `Data ${successMessages.SUCCESSFULLY_GET_LIST}`,
      HttpStatus.OK,
    );
  }

  getPipeline(query: GetSlotDto): PipelineStage[] {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const startIndex = (page - 1) * limit;
    const startOfDay = moment(query.startDate).startOf('day').toDate();
    const endOfDay = moment(query.startDate).endOf('day').toDate();

    const filter: FilterData = {
      createdBy: new Types.ObjectId(query.userId),
      isDeleted: false,
    };

    if (query.isConformed !== undefined) {
      filter.isConformed = query.isConformed;
    }

    // if (query.startDate) {
    //   filter.startDate = {};
    //   filter.startDate = {
    //     $gte: startOfDay,
    //     $lte: endOfDay,
    //   };
    // }

    if (query.startDate) {
      const formattedDate = moment(query.startDate).format('MM/DD/YYYY');
      filter.startDate = formattedDate;
    }
    return [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'user',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: {
          path: '$users',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          startDate: 1,
          startTime: 1,
          endTime: 1,
          endDate: 1,
          createdBy: 1,
          createdAt: 1,
          isConformed: 1,
          userName: '$users.name',
        },
      },
      {
        $group: {
          _id: null,
          totalData: {
            $sum: 1,
          },
          list: {
            $push: '$$ROOT',
          },
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
}
