# Start here: putting the gathr design system into your app

This zip has two things:
- `gathr-design/`: a copy of your live design system (release 18): tokens, components, guides, fonts, logos and gradients, plus `rules.md` (the brand book's rules in one page) and `CHANGES-release-18.md` (what the app is missing).
- `CLAUDE.md`: a note Claude Code reads by itself every time it starts, telling it where the design system is and how to work.

## Step 1: Unzip into your app's main folder
Open your app's folder (the one with `package.json` in it). Unzip so that `gathr-design/` and `CLAUDE.md` sit right next to `package.json`.

**Why:** Claude Code only sees files inside the project folder. Putting them at the top means every path in `CLAUDE.md` works.

**If your app already has a `CLAUDE.md`:** don't replace it. Keep yours, put this one in as `CLAUDE-gathr.md`, and in Step 3 ask Claude Code to "merge CLAUDE-gathr.md into CLAUDE.md, then delete CLAUDE-gathr.md".

## Step 2: Restart Claude Code in VS Code
Close the Claude Code chat and open a new one.

**Why:** it reads `CLAUDE.md` when a session starts, so a new session picks up the instructions.

## Step 3: Let it look before it changes anything
Paste this:

> Read CLAUDE.md, gathr-design/rules.md and gathr-design/CHANGES-release-18.md. Then look at the app and tell me, in plain words, which of the changes are already done and which aren't. Don't change any code yet.

**Why:** some changes may already be in. A report first means you decide what gets touched, and nothing is rebuilt for no reason.

## Step 4: Update one piece at a time
Go through these one by one. After each, check the app in your browser before sending the next.

1. > Set the app up to use gathr-design/tokens.css and the fonts in gathr-design/fonts. Replace any hard-coded colours with tokens. Tell me what you changed.
2. > Update the crowd meter to "Booked so far" as described in CHANGES-release-18.md section 1. Give each sample venue a booked number and a cap.
3. > Rebuild the venue screen to match VenueHero option A (section 2), with TonightSoFar and "The room" below it.
4. > Update the event cards and venue cards (section 4).
5. > Go through every screen with gathr-design/guides/07-checklist.md and list anything that breaks a rule. Fix them after I've seen the list.

**Why one at a time:** if something looks wrong, you know exactly which change caused it, and it's easy to undo.

## When the design system changes again
Ask me (in the gathr Seeker project on claude.ai) for a fresh package and replace the `gathr-design/` folder. Keep `CLAUDE.md` as it is.
