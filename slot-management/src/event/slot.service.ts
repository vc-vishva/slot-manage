import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { CommonService } from '../common/common.service';
import { errorMessages, successMessages } from '../common/configs/messages.config';
import { OnlyMessageResponse } from '../common/types';
import { UserService } from '../user/user.service';
import { ResponseHandler } from '../utils/response-handler';
import { CreateSlotDto } from './dtos/create.slot.dto';
import { GetSlotDto } from './dtos/get-slot.dto';
import { Slot, SlotDocument } from './schemas/slot.schemas';
import { EventData, GetSlotDetailsModel } from './type';

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

  return [
    // Match slots for the specific user
    {
      $match: {
        createdBy: new Types.ObjectId(query.userId),
        // Add date filter if provided in query
        ...(query.date && {
          startDate: query.date
        })
      },
    },
    
    // Lookup user information
    {
      $lookup: {
        from: 'user',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'users',
      },
    },
    
    // Unwind users array
    {
      $unwind: {
        path: '$users',
        preserveNullAndEmptyArrays: true,
      },
    },
    
    // Add computed fields for time calculations
    {
      $addFields: {
        // Convert time strings to minutes for calculation
        startMinutes: {
          $add: [
            { $multiply: [{ $toInt: { $substr: ["$startTime", 0, { $indexOfCP: ["$startTime", ":"] }] } }, 60] },
            { $toInt: { $substr: ["$startTime", { $add: [{ $indexOfCP: ["$startTime", ":"] }, 1] }, 2] } }
          ]
        },
        endMinutes: {
          $add: [
            { $multiply: [{ $toInt: { $substr: ["$endTime", 0, { $indexOfCP: ["$endTime", ":"] }] } }, 60] },
            { $toInt: { $substr: ["$endTime", { $add: [{ $indexOfCP: ["$endTime", ":"] }, 1] }, 2] } }
          ]
        }
      }
    },
    
    // Calculate slot duration in minutes
    {
      $addFields: {
        durationMinutes: {
          $subtract: ["$endMinutes", "$startMinutes"]
        }
      }
    },
    
    // Filter out slots less than 30 minutes
    {
      $match: {
        durationMinutes: { $gte: 30 }
      }
    },
    
    // Lookup all slots on the same date to check for adjacent booked slots
    {
      $lookup: {
        from: 'slots', // Replace with your actual collection name
        let: { 
          currentDate: '$startDate',
          currentStart: '$startMinutes',
          currentEnd: '$endMinutes',
          currentId: '$_id'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$startDate', '$currentDate'] }, // Same date
                  { $ne: ['$_id', '$currentId'] }, // Exclude current slot
                  { $eq: ['$isConformed', true] } // Only booked slots
                ]
              }
            }
          },
          {
            $addFields: {
              bookedStartMinutes: {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$startTime", 0, { $indexOfCP: ["$startTime", ":"] }] } }, 60] },
                  { $toInt: { $substr: ["$startTime", { $add: [{ $indexOfCP: ["$startTime", ":"] }, 1] }, 2] } }
                ]
              },
              bookedEndMinutes: {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$endTime", 0, { $indexOfCP: ["$endTime", ":"] }] } }, 60] },
                  { $toInt: { $substr: ["$endTime", { $add: [{ $indexOfCP: ["$endTime", ":"] }, 1] }, 2] } }
                ]
              }
            }
          },
          {
            $match: {
              $expr: {
                $or: [
                  // Adjacent before: booked slot ends when current slot starts
                  { $eq: ['$bookedEndMinutes', '$currentStart'] },
                  // Adjacent after: booked slot starts when current slot ends
                  { $eq: ['$bookedStartMinutes', '$currentEnd'] }
                ]
              }
            }
          }
        ],
        as: 'adjacentBookedSlots'
      }
    },
    
    // Filter out slots that are booked or have adjacent booked slots
    {
      $match: {
        $and: [
          { isConformed: { $ne: true } }, // Slot itself is not booked
          { adjacentBookedSlots: { $size: 0 } } // No adjacent booked slots
        ]
      }
    },
    
    // Project the final structure
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
        durationMinutes: 1, // Include for debugging
      },
    },
    
    // Sort by date and time
    {
      $sort: {
        startDate: 1,
        startMinutes: 1
      }
    },
    
    // Group for pagination
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
    
    // Apply pagination
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
