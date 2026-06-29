import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreateReviewData {
  authorId: string;
  veterinarianId: string;
  appointmentId: string;
  rating: number;
  text?: string;
}

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByVet(veterinarianId: string, { page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where: { veterinarianId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { veterinarianId, publishedAt: { not: null } },
      }),
    ]);
    return { data, total };
  }

  async findByAppointment(appointmentId: string) {
    return this.prisma.review.findFirst({ where: { appointmentId } });
  }

  async findAppointmentForReview(appointmentId: string, tutorId: string) {
    return this.prisma.appointment.findFirst({
      where: { id: appointmentId, tutorId, deletedAt: null },
      select: { id: true, status: true, veterinarianId: true },
    });
  }

  async create(data: CreateReviewData) {
    return this.prisma.review.create({
      data: {
        appointmentId: data.appointmentId,
        authorId: data.authorId,
        veterinarianId: data.veterinarianId,
        rating: data.rating,
        text: data.text ?? null,
        publishedAt: new Date(),
      },
    });
  }
}
