import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentServices: PaymentsService) {}

  @Get()
  async getAll() {
    try {
      const payments = await this.paymentServices.getAll();

      if (!Array(payments)) {
        throw new NotFoundException('Payments not found');
      }

      return {
        response: payments,
        message: `${payments?.length} Payments found`,
        status: true,
      };
    } catch (error) {
      console.log('Get All paid error');
      return {
        response: null,
        message: `Payments not found`,
        status: false,
      };
    }
  }

  @Get(':id')
  async getOne(@Param('id') id) {
    try {
      const payment = await this.paymentServices.getOne(id);
      if (!payment) {
        throw new NotFoundException('payments not found');
      }
      return {
        response: payment,
        message: 'payment found by ID',
        status: true,
      };
    } catch (error) {
      return {
        response: null,
        message: 'payments not found',
        status: false,
      };
    }
  }

  @Post('create-intent')
  async paymentIntent(@Body() body: any) {
    try {
      const paymentInt = await this.paymentServices.createIntent(body);

      if (!paymentInt) {
        throw new NotFoundException(
          'Payment Intent Not found, Please try again later',
        );
      }

      return {
        response: paymentInt,
        status: true,
        message: 'Payment Intent created successfully',
      };
    } catch (error) {
      return { status: false, message: error.message, response: null };
    }
  }

  @Post()
  async paid(@Body() body: any) {
    try {
      const paid = await this.paymentServices.addPaid(body);

      if (!paid) {
        throw new Error('paid failed');
      }
      return { status: true, message: 'Paid successfully', response: paid };
    } catch (error) {
      console.log('paid Error, ', error);
      return { status: false, message: 'Paid failed', response: null };
    }
  }

  @Put()
  async paidUpdate(@Body() body: any) {
    try {
      const paid = await this.paymentServices.paidUpdate(body);

      if (!paid) {
        throw new Error('Paid update failed');
      }
      return {
        status: true,
        message: 'Paid update successfully',
        response: paid,
      };
    } catch (error) {
      console.log('paid update Error, ', error);
      return { status: false, message: 'Paid update failed ', response: null };
    }
  }
}
