# gathr

Pune after dark: a React + Vite web app, wrapped into iOS and Android apps with Capacitor.

## Everyday commands

Run these in this folder (you need [Node.js](https://nodejs.org) 20.19+ or 22+):

| Command | What it does |
|---|---|
| `npm install` | Downloads everything the app needs (once, or after pulling changes) |
| `npm run dev` | Opens a live preview at http://localhost:5173 that updates as you edit |
| `npm run build` | Makes the finished web app in `dist/` |
| `npm run cap:sync` | Builds, then copies it into the `ios/` and `android/` app shells (if you have them locally) |

Add `?review` to the preview address to get the panel that jumps to every screen.

## Where things are

```
index.html            the page shell
src/main.jsx          starts the app and scales it to the screen
src/App.jsx           app state and navigation between screens
src/screens/          one file per screen (Welcome, Tonight = "This week", Map, Event, Pass, …)
                      Org* = organiser tools, Host* = hosting mode (Door, Guests, Profile)
src/cards/            one file per card used inside screens
src/sheets/           the bottom sheets (booking, age check, who gets in, …)
src/components/       shared pieces (sign-in form, switch, review panel, …)
src/design-system/    gathr's building blocks: Button, Chip, Sheet, EventCard, … (+ their styles)
src/data/             listings, dates, sample data, organisers' nights and text formatting
src/lib/passQr.js     what's inside a pass QR code, and how the door checks it
src/services/         sign-in, payments, SMS, sharing
src/config.js         switch real services (Supabase, Razorpay, SMS) on
src/styles/           fonts, colour tokens and app styles
src/assets/           fonts, 3D icons and welcome photos
```

## Builds

`codemagic.yaml` has two workflows: **gathr iOS to TestFlight** and **gathr Android APK (test)**.
Both install with `npm ci`, run `npm run build`, then let Capacitor copy `dist/` into the native app.

## App icon

The icon lives in `assets/`. Every build makes all the iOS and Android sizes from it.

- `icon-only.png`: the icon (1024 × 1024 PNG, no transparency, square corners).
- `icon-foreground.png` and `icon-background.png`: the two layers Android phones use to cut
  the icon into their own shape. Here the foreground is the same image and the background is its gradient.

To change the icon, replace `icon-only.png` and `icon-foreground.png` with the new image
(and `icon-background.png` with its background colour or gradient), then run a new build.
