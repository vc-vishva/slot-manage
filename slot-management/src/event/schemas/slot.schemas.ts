import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

@Schema({ timestamps: true, collection: 'slot' })
export class Slot {
  _id: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, required: true })
  startDate: string;

  @Prop({ type: SchemaTypes.String, required: true })
  startTime: string;

  @Prop({ type: SchemaTypes.String, required: true })
  endTime: string;

  @Prop({ type: SchemaTypes.String })
  endDate: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: Types.ObjectId;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isDeleted: boolean;

  @Prop({
    type: SchemaTypes.Boolean,
    default: false,
  })
  isConformed: boolean;
}
/**
 * @ignore
 */
export const SlotSchema = SchemaFactory.createForClass(Slot);
export type SlotDocument = HydratedDocument<Slot>;
