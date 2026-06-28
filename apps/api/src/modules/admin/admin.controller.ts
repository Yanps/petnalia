import { Controller } from '@nestjs/common';

import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // TODO: GET /admin/veterinarians/pending (admin only)
  // TODO: POST /admin/veterinarians/:id/approve (admin only)
  // TODO: POST /admin/veterinarians/:id/reject (admin only)
  // TODO: GET /admin/appointments (admin only)
  // TODO: GET /admin/users (admin only)
}
