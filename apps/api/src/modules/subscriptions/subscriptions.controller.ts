import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Request } from 'express';

import { CreateCheckoutSessionInputSchema } from '@petnalia/types';

import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Roles } from '../../shared/decorators/roles.decorator';


@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @Roles('veterinarian')
  async getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @Post('checkout')
  @Roles('veterinarian')
  async createCheckoutSession(
    @CurrentUser() user: User,
    @Body() body: unknown,
  ) {
    const { plan } = CreateCheckoutSessionInputSchema.parse(body);
    return this.subscriptionsService.createCheckoutSession(user.id, plan);
  }

  @Delete('cancel')
  @Roles('veterinarian')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelSubscription(@CurrentUser() user: User) {
    await this.subscriptionsService.cancelSubscription(user.id);
  }

  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.subscriptionsService.handleWebhook(req.rawBody!, signature);
    return { received: true };
  }
}
