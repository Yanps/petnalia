import { Injectable } from '@nestjs/common';

import { AppointmentsRepository } from './appointments.repository';

@Injectable()
export class AppointmentsService {
  constructor(private readonly appointmentsRepository: AppointmentsRepository) {}

  // TODO: bookAppointment(tutorId, dto) — idempotent, slot hold → confirm
  // TODO: confirmAppointment(appointmentId, vetId)
  // TODO: cancelAppointment(appointmentId, actorId, dto)
  // TODO: completeAppointment(appointmentId, vetId)
  // TODO: listTutorAppointments(tutorId, query)
  // TODO: listVetAppointments(vetId, query)
}
