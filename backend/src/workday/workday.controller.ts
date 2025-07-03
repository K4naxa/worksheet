import { Controller, Post, Request } from '@nestjs/common';
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
      req.user.id,
      'with data:',
      req.body,
    );
    return this.workdayService.saveWorkDay(req.user.id, req.body);
  }
}
