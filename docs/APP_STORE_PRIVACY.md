# App Store Connect — App Privacy answers (Pharos)

Use this when filling **App Store Connect → your app → App Privacy**. It reflects
what the app actually does: local-first, with optional Google sign-in + Supabase
sync. If a user never signs in, nothing is collected — but because sign-in is
available, Apple requires you to declare the synced data below as "collected."

> None of the data below is used for **tracking** (no cross-app/website tracking,
> no ad networks, no third-party analytics). So you will answer **"No"** to
> "Do you or your third-party partners use data for tracking?" → **no ATT prompt
> needed**, and "Data used to track you" = **none**.

## "Do you collect data from this app?" → **Yes**

For every type below: **Linked to the user's identity = Yes** (it's tied to their
account), **Used for tracking = No**, **Purpose = App Functionality** (and
"Account Management" / "Authentication" where offered).

### Contact Info
- **Email Address** — collected via Google sign-in to create/identify the account. Linked. App Functionality. Not tracking.
- **Name** — optional display name on the profile. Linked. App Functionality. Not tracking.

### Identifiers
- **User ID** — the account id from Google sign-in / Supabase Auth, used to associate synced rows with the account. Linked. App Functionality. Not tracking.

### User Content
- **Other User Content** — the user's own rule data synced for backup: practices & logs, rest days, journal entries, highlights & notes, reading plans/progress, daily-office logs, lesson results. Linked. App Functionality. Not tracking.

## Data types you are NOT collecting (answer "No" / leave unchecked)
Health & Fitness, Financial Info, Location, Sensitive Info, Contacts, Browsing
History, Search History, Purchases, Usage Data, Diagnostics/Crash Data,
Advertising Data / Device Advertising ID, Audio/Photos/Videos, Gameplay content.

> Note: there is no analytics or crash-reporting SDK in the binary. If you later
> add Sentry, PostHog, Firebase, etc., come back and declare **Diagnostics** and/or
> **Usage Data**.

## Other required fields
- **Privacy Policy URL** (required): your hosted `/legal/privacy/` URL.
- **Account deletion**: the app supports it — users email the contact address and
  their account + synced data is deleted (cascades from `auth.users`). Make sure an
  in-app or documented path to request deletion exists (App Review checks this).
- **Data retention**: synced data kept while the account exists; on-device data
  removed when the app is deleted.

## Google OAuth consent screen ("branding") fields
- **App name**: Pharos
- **User support email**: support@cgsoftwarestudio.com
- **App logo**: `assets/icon.png` (1024×1024)
- **Application home page**: optional (a marketing/landing URL if you have one)
- **Privacy policy URL**: your hosted `/legal/privacy/` URL
- **Terms of service URL**: your hosted `/legal/terms/` URL
- **Authorized domains**: the bare domain of the URLs above (e.g. `vercel.app` is
  not allowed as an authorized domain — use a custom domain, or a project domain
  Google accepts; see hosting notes).
