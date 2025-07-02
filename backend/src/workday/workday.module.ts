import { Module } from '@nestjs/common';
import { WorkdayController } from './workday.controller';
import { WorkdayService } from './workday.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PrismaModule, PassportModule],
  controllers: [WorkdayController],
  providers: [WorkdayService],
})
export class WorkdayModule {}
