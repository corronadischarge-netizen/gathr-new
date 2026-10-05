# Notifications (Firebase)

gathr sends phone notifications through Firebase Cloud Messaging, which is free. It's set up once:

1. **Firebase project.** At https://console.firebase.google.com click **Create a project**, call it `gathr`, and
   leave Google Analytics off.
2. **Android app.** In the project, click the Android icon to add an app. Package name: `com.gathr.app`. Download
   **google-services.json** and put it in this folder as `firebase/google-services.json`. It isn't secret (it only
   identifies the app), so it's fine in the code.
3. **Sending key (secret).** In Firebase: **Project settings → Service accounts → Generate new private key**. It
   downloads a `.json` file. Don't put it in the code or send it to anyone.
   In Supabase: **Edge Functions → Secrets → Add new secret**, name `FCM_SERVICE_ACCOUNT`, and paste the whole
   contents of that file as the value.
4. **Sending function.** In Supabase: **Edge Functions → Deploy a new function → Via Editor**, name it `push`, paste
   the contents of `supabase/functions/push/index.ts`, and click **Deploy**.
5. **Database.** Run `supabase/migrations/20261007100000_notifications.sql` in the SQL Editor.
6. **Build.** The next Codemagic Android build sees `firebase/google-services.json` and switches notifications on.

Builds without `google-services.json` keep notifications off (the app works the same; Updates still shows
everything). iPhone notifications need an Apple push key as well and come later.
