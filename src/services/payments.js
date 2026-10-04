import { CFG } from '../config';
import { loadScript } from '../lib/utils';

/* Payments: demo by default, Razorpay Checkout when a key is added */
export const Pay = {
  live: CFG.payments && CFG.payments.provider === 'razorpay' && !!CFG.payments.razorpayKeyId,
  charge: (o) => {
    /* o: { amount (rupees), title, email, phone } */
    if (!Pay.live)
      return new Promise((ok) => {
        setTimeout(() => {
          ok({ id: 'demo_' + Date.now().toString(36) });
        }, 1100);
      });
    return loadScript('https://checkout.razorpay.com/v1/checkout.js').catch(() => {
      throw new Error('Couldn’t open the payment window. Check your internet connection. You haven’t been charged.');
    }).then(
      () =>
        new Promise((ok, no) => {
          var rz = new window.Razorpay({
            key: CFG.payments.razorpayKeyId,
            amount: Math.round(o.amount * 100),
            currency: 'INR',
            name: 'gathr',
            description: o.title,
            prefill: { email: o.email || '', contact: o.phone ? '+91' + o.phone : '' },
            theme: { color: '#531aff' },
            handler: (r) => {
              ok({ id: r.razorpay_payment_id });
            },
            modal: {
              ondismiss: () => {
                no(new Error('Payment cancelled. You haven’t been charged.'));
              }
            }
          });
          rz.on('payment.failed', (r) => {
            no(new Error((r.error && r.error.description) || 'Payment failed. You haven’t been charged.'));
          });
          rz.open();
        })
    );
  }
};
