import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { RejectVetInputSchema } from '@petnalia/types';

import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('veterinarians/pending')
  async listPendingVets(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.adminService.listPendingVets(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(50, parseInt(limit, 10) || 20),
    );
  }

  @Post('veterinarians/:id/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveVet(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.adminService.approveVet(id);
  }

  @Post('veterinarians/:id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectVet(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ): Promise<void> {
    const dto = RejectVetInputSchema.parse(body);
    await this.adminService.rejectVet(id, dto.reason);
  }
}
