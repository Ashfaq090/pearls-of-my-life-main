import { SubscriptionService } from './subsription.service';
import { PaymentsService } from './payment.service';
import { Payment } from '../../entities/payment.entity';
import { User } from '../../entities/user.entity';
import { getMetadataArgsStorage } from 'typeorm';

describe('Promo checkout', () => {
  it('reads the existing BIT promo flag as false for zero and true for one', () => {
    const column = getMetadataArgsStorage().columns.find(
      (column) => column.target === User && column.propertyName === 'is_promo_availed',
    );
    const transformer = column.options.transformer as any;
    expect(column.options.type).toBe('bit');
    expect(transformer.from(Buffer.from([0]))).toBe(false);
    expect(transformer.from(Buffer.from([1]))).toBe(true);
    expect(transformer.to(false)).toBe(0);
    expect(transformer.to(true)).toBe(1);
    expect(transformer.from(null)).toBeNull();
  });
  const quoteService = () => {
    const service = Object.create(SubscriptionService.prototype) as any;
    service.usersService = { findOneByPromo: jest.fn().mockResolvedValue({ is_promo_availed: false }) };
    service.getPlanById = jest.fn().mockResolvedValue({ isActive: true });
    service.computeEffectiveYearlyCharge = jest.fn().mockResolvedValue(84);
    service.userSubscriptionRepository = { save: jest.fn() };
    return service;
  };

  it('quotes half the server-calculated charge without activating a subscription', async () => {
    const service = quoteService();
    await expect(service.subscribeViaPromo('user', 'plan', 'PROMO')).resolves.toEqual({
      originalAmount: 84, amount: 42, discountPercent: 50, currency: 'USD',
    });
    expect(service.userSubscriptionRepository.save).not.toHaveBeenCalled();
  });

  it('rejects an already consumed promo', async () => {
    const service = quoteService();
    service.usersService.findOneByPromo.mockResolvedValue({ is_promo_availed: true });
    await expect(service.subscribeViaPromo('user', 'plan', 'PROMO')).rejects.toThrow('Promo not found');
  });

  it('rejects empty promo input before querying users', async () => {
    const service = quoteService();
    await expect(service.subscribeViaPromo('user', 'plan', '')).rejects.toThrow('required');
    expect(service.usersService.findOneByPromo).not.toHaveBeenCalled();
  });

  const captureService = (record: any) => {
    const service = Object.create(PaymentsService.prototype) as any;
    const repository = { findOne: jest.fn().mockResolvedValue(record) };
    service.paymentRepository = { manager: { transaction: (run: any) => run({ getRepository: () => repository }) } };
    service.client = { execute: jest.fn() };
    return service;
  };

  it('rejects a different user or plan before contacting PayPal', async () => {
    const service = captureService({ user_id: 'owner', notes: JSON.stringify({ type: 'promo', planId: 'plan' }) });
    const activate = jest.fn();
    await expect(service.capturePromoOrder('order', 'other', 'plan', activate)).rejects.toThrow('does not belong');
    await expect(service.capturePromoOrder('order', 'owner', 'other-plan', activate)).rejects.toThrow('does not belong');
    expect(service.client.execute).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
  });

  it('returns the saved capture on retry without activating again', async () => {
    const service = captureService({
      user_id: 'owner', notes: JSON.stringify({ type: 'promo', planId: 'plan' }),
      status: 'completed', transaction_data: JSON.stringify({ status: 'COMPLETED' }),
    });
    const activate = jest.fn();
    await expect(service.capturePromoOrder('order', 'owner', 'plan', activate)).resolves.toEqual({ status: 'COMPLETED' });
    expect(activate).not.toHaveBeenCalled();
    expect(service.client.execute).not.toHaveBeenCalled();
  });

  it.each(['pending', 'wrong-amount', 'completed'])('handles %s payment before applying the plan', async (scenario) => {
    const record = {
      user_id: 'owner', notes: JSON.stringify({ type: 'promo', planId: 'plan', promoCode: 'PROMO' }),
      status: 'pending', amount: 42, currency: 'USD',
    };
    const user = { id: 'owner', promo_code: 'PROMO', promo_plan_id: 'plan', is_promo_availed: false };
    const payments = { findOne: jest.fn().mockResolvedValue(record), save: jest.fn() };
    const users = { findOne: jest.fn().mockResolvedValue(user), save: jest.fn() };
    const subscriptions = { update: jest.fn() };
    const manager = { getRepository: (entity: any) => entity === Payment ? payments : entity === User ? users : subscriptions };
    const service = Object.create(PaymentsService.prototype) as any;
    service.paymentRepository = { manager: { transaction: (run: any) => run(manager) } };
    service.client = { execute: jest.fn().mockResolvedValue({ result: { status: 'APPROVED' } }) };
    service.capturePayment = jest.fn().mockResolvedValue({
      status: scenario === 'pending' ? 'PENDING' : 'COMPLETED',
      purchase_units: [{ payments: { captures: [{ status: 'COMPLETED', amount: { currency_code: 'USD', value: scenario === 'wrong-amount' ? '1.00' : '42.00' } }] } }],
    });
    const activate = jest.fn();
    const result = service.capturePromoOrder('order', 'owner', 'plan', activate);
    if (scenario === 'wrong-amount') {
      await expect(result).rejects.toThrow('does not match');
    } else {
      await expect(result).resolves.toHaveProperty('status', scenario === 'pending' ? 'PENDING' : 'COMPLETED');
    }
    if (scenario === 'completed') {
      expect(activate).toHaveBeenCalledWith(manager);
      expect(user.is_promo_availed).toBe(true);
      expect(payments.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed', amount: 42 }));
    } else {
      expect(activate).not.toHaveBeenCalled();
      expect(users.save).not.toHaveBeenCalled();
      expect(subscriptions.update).not.toHaveBeenCalled();
    }
  });
});
