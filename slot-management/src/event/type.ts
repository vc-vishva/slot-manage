import { Types } from 'mongoose';
import { CommonResponse } from '../common/types';

export interface SlotListData {
  _id: Types.ObjectId;
  startDate: string;
  startTime: string;
  endTime: string;
  endDate: string;
  createdBy: Types.ObjectId;
  createdAt: string;
}

export interface EventData {
  totalData: number;
  list: SlotListData[];
}
export interface FilterData {
  isDeleted?: boolean;
  isConformed?: boolean;
  startDate?: string;
  createdBy: Types.ObjectId;
  // startDate?: {
  //   $gte?: Date;
  //   $lte?: Date;
  // };
}

export interface EventExportType extends FilterData {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}
export type GetSlotDetailsModel = Promise<CommonResponse<EventData>>;
