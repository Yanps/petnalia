import { Controller } from '@nestjs/common';

import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // TODO: POST /appointments
  // TODO: GET /appointments
  // TODO: GET /appointments/:id
  // TODO: POST /appointments/:id/confirm (vet)
  // TODO: POST /appointments/:id/cancel
  // TODO: POST /appointments/:id/complete (vet)
}
