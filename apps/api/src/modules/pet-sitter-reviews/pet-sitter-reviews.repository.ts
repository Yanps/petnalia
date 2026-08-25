import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../shared/prisma/prisma.service';

interface CreatePetSitterReviewData {
  authorId: string;
  petSitterId: string;
  bookingId: string;
  rating: number;
  text?: string;
}

@Injectable()
export class PetSitterReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySitter(petSitterId: string, { page, limit }: { page: number; limit: number }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.petSitterReview.findMany({
        where: { petSitterId, publishedAt: { not: null } },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.petSitterReview.count({
        where: { petSitterId, publishedAt: { not: null } },
      }),
    ]);
    return { data, total };
  }

  async findByBooking(bookingId: string) {
    return this.prisma.petSitterReview.findFirst({ where: { bookingId } });
  }

  async findBookingForReview(bookingId: string, tutorId: string) {
    return this.prisma.petSitterBooking.findFirst({
      where: { id: bookingId, tutorId, deletedAt: null },
      select: { id: true, status: true, petSitterId: true },
    });
  }

  async create(data: CreatePetSitterReviewData) {
    return this.prisma.petSitterReview.create({
      data: {
        bookingId: data.bookingId,
        authorId: data.authorId,
        petSitterId: data.petSitterId,
        rating: data.rating,
        text: data.text ?? null,
        publishedAt: new Date(),
      },
    });
  }
}
