export interface CommonResponse<T = any> {
  status: boolean;
  statusCode: number;
  message: string | string[];
  data: T | [];
  error: T | [];
}

/*
 **
 * @ignore
 */
export enum SortFields {
  ASE = 'asc',
  DEC = 'desc',
}

export type OnlyMessageResponse = Promise<CommonResponse>;

export interface CommonMailResponse {
  accepted?: string[];
  rejected?: [];
  messageTime?: number;
  messageSize?: number;
  response?: string;
}

export interface JwtTokenPayload {
  _id: string;
  email: string;
  userType: string;
}

export interface RequestWithPayload extends Request {
  user: JwtTokenPayload;
}

export interface FilterData {
  isDeleted?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface CommonMailResponse {
  accepted?: string[];
  rejected?: [];
  messageTime?: number;
  messageSize?: number;
  response?: string;
}

export interface ErrorDetail {
  msg?: string;
  message?: string;
  param?: string;
  location?: string;
}

export interface ErrorResponse {
  message?: string;
  code?: number;
  success?: boolean;
  errors?: ErrorDetail[];
}

export interface ApiResStatus {
  status?: string;
  responseCode?: string;
  responseReason?: string;
  responseDesc?: string;
  errors?: any[];
}
