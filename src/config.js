/* SERVICES
   One place to switch real services on. Leave a value empty and that service runs in demo mode.
   - supabase: free. Turns on the email code and Google sign-in. See the audit doc for setup.
   - sms: paid (about Rs 6 per SMS on Firebase). Off by default; phone numbers are saved unverified.
   - payments: 'demo' takes no money. Add a Razorpay key ID to open real Razorpay Checkout.
   - contactEmail: where "Ask the venue" and promotion enquiries go.
   A page can also set window.GATHR_CONFIG before the app loads to override any of these. */
export const CFG = Object.assign(
  {
    supabase: { url: '', anonKey: '' },
    sms: { provider: 'off', firebase: null },
    payments: { provider: 'demo', razorpayKeyId: '' },
    contactEmail: 'hello@gathr.app'
  },
  window.GATHR_CONFIG || {}
);

export const APP_URL = location.origin + location.pathname;

export const REVIEW = /[?&]review\b/.test(location.search);
