import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import knexDB from 'src/db/knex.db';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY') || '');
  }

  async getOne(id: any) {
    try {
      const paid = await knexDB('paids').where({ id }).first();

      return paid;
    } catch (error) {
      console.log('Paid One Error ', error);
      return null;
    }
  }

  async getAll() {
    try {
      const paids = await knexDB('paids')
        .select(
          'paids.id',
          'paids.amount',
          'paids.description',
          'paids.method_type as methodType',
          'paids.status',
          'paids.transaction_Id as transactionId',
          'users.id as userId',
          'users.name as userName',
          'users.email as email',
        )
        .leftJoin('users', 'paids.user', '=', 'users.id');
      return paids;
    } catch (error) {
      console.log('Paids Error ', error);
      return null;
    }
  }

  async addPaid(paid: any) {
    let paymentResult = null;

    try {
      const [payment] = await knexDB('paids')
        .insert({
          transaction_Id: paid?.transactionId,
          amount: paid?.amount,
          transaction_time: paid?.createIn,
          description: paid.description,
          method_type: paid?.methodType,
          status: paid.status,
          user: paid.user,
        })
        .returning('*');
      paymentResult = payment;
    } catch (error) {
      console.log('payment AddOne Error, ', error);
    } finally {
      return paymentResult;
    }
  }

  async paidUpdate(paid: any) {
    let paymentResult = null;

    try {
      const [payment] = await knexDB('paids')
        .where({ id: paid.id })
        .insert({
          transaction_Id: paid?.id,
          amount: paid?.amount,
          transaction_time: paid?.transactionTime,
          description: paid.description,
          method_type: paid?.methodType,
          status: paid.status,
          user: paid.user,
        })
        .returning('*');
      paymentResult = payment;
    } catch (error) {
      console.log('payment Update Error, ', error);
    } finally {
      return paymentResult;
    }
  }

  async createIntent(body: { currency: string; amount: number }) {
    let paymentInf = { message: '', key: '' };

    try {
      const { client_secret } = await this.stripe.paymentIntents.create({
        amount: body.amount,
        currency: body.currency ? body.currency : 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      paymentInf.key = client_secret ?? '';
    } catch (error) {
      paymentInf.message = error.message?.substring(0, 60);
    } finally {
      return paymentInf;
    }
  }
}
