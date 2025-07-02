import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { WorkdayService } from 'src/workday/workday.service';

import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { CreateWorkdayDto } from 'src/workday/dto/workday.dto';

@Controller('workday')
export class WorkdayController {
  constructor(private workdayService: WorkdayService) {}

  @Post()
  async saveWorkDay(
    @Request() req: { user: AuthenticatedUser; body: CreateWorkdayDto },
  ) {
    console.log(
      'Saving workday for user:',
      req.user.id,
      'with data:',
      req.body,
    );
    return this.workdayService.saveWorkDay(req.user.id, req.body);
  }
}
