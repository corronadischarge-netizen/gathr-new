/* SERVICES
   One place to switch real services on. Leave a value empty and that service runs in demo mode.
   - supabase: the gathr database and sign-in (email code, Google). Setup steps: supabase/README.md.
   - sms: paid (about Rs 6 per SMS on Firebase). Off by default; phone numbers are saved unverified.
   - payments: 'demo' takes no money. Add a Razorpay key ID to open real Razorpay Checkout.
   - contactEmail: where "Ask the venue" and promotion enquiries go.
   A page can also set window.GATHR_CONFIG before the app loads to override any of these. */
export const CFG = Object.assign(
  {
    /* The gathr Supabase project. The anon key is meant to be public: the database's access rules protect the data. */
    supabase: {
      url: 'https://unonmrglfewyapzbxacq.supabase.co',
      anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVub25tcmdsZmV3eWFwemJ4YWNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NTM0NzcsImV4cCI6MjEwNjQyOTQ3N30.miIUy2yBS5_TbxpDR-iZ3hM7RFv5w4pRdlColBZx7cY'
    },
    sms: { provider: 'off', firebase: null },
    payments: { provider: 'demo', razorpayKeyId: '' },
    contactEmail: 'hello@gathr.app',
    /* Where the gathr web app is hosted, e.g. 'https://gathr.web.app/'. Links people share (promoter invites)
       point here. Empty until it's hosted: invites are then shared as a code to type into the app. */
    publicUrl: ''
  },
  window.GATHR_CONFIG || {}
);

export const APP_URL = location.origin + location.pathname;

export const REVIEW = /[?&]review\b/.test(location.search);
