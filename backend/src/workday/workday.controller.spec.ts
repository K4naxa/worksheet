import { Test, TestingModule } from '@nestjs/testing';
import { WorkdayController } from './workday.controller';

describe('WorkdayController', () => {
  let controller: WorkdayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkdayController],
    }).compile();

    controller = module.get<WorkdayController>(WorkdayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
