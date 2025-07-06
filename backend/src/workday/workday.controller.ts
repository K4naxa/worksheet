import { Controller, Delete, Post, Request } from '@nestjs/common';
import { WorkdayService } from 'src/workday/workday.service';

import { CreateWorkdayDto } from 'src/workday/dto/workday.dto';
import { KeycloakProfile } from 'src/types/keycloack.types';

@Controller('workday')
export class WorkdayController {
  constructor(private workdayService: WorkdayService) {}

  @Post()
  async saveWorkDay(
    @Request() req: { user: KeycloakProfile; body: CreateWorkdayDto },
  ) {
    console.log(
      'Saving workday for user:',
      req.user.email,
      'with data:',
      req.body,
    );
    return this.workdayService.saveWorkday(req.user.sub, req.body);
  }

  @Delete()
  async deleteWorkDay(
    @Request() req: { user: KeycloakProfile; body: { date: string } },
  ) {
    return this.workdayService.deleteWorkday(req.user.sub, req.body.date);
  }
}
