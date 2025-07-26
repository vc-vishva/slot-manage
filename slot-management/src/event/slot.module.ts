import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Slot, SlotSchema } from './schemas/slot.schemas';
import { SlotController } from './slot.controller';
import { SlotService } from './slot.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Slot.name, schema: SlotSchema }])],
  controllers: [SlotController],
  providers: [SlotService],
})
export class SlotModule {}
