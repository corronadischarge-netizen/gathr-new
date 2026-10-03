import { CFG } from '../config';

/* The shared connection to the gathr database (Supabase).
   It only loads when the Supabase keys are set in config.js; without them the app runs in demo mode. */
export const supabaseOn = !!(CFG.supabase && CFG.supabase.url && CFG.supabase.anonKey);

var client = null;
export function supabase() {
  if (client) return Promise.resolve(client);
  return import('@supabase/supabase-js').then((m) => {
    client =
      client ||
      m.createClient(CFG.supabase.url, CFG.supabase.anonKey, {
        auth: { persistSession: true, detectSessionInUrl: true, flowType: 'implicit' }
      });
    return client;
  });
}
