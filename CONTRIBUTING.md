# Contributing to Coptic Daily Companion

Thank you for being here. This app is a daily companion for Coptic Orthodox practice —
prayer, fasting, and the Word — and it is better when it is built by the community that
prays it.

**If this would be your first open-source contribution, you are exactly who this guide is
written for.** It assumes you have never forked a repository or opened a pull request, and
it walks through every step. Nothing here is too basic to ask about.

---

## 1. Before you start

You need four things:

| What | Why | Where |
|---|---|---|
| **Node.js 20 LTS** | Runs the project | [nodejs.org](https://nodejs.org) |
| **Git** | Downloads the code and sends your changes back | [git-scm.com](https://git-scm.com) |
| **A GitHub account** | Where the project lives | [github.com](https://github.com) |
| **Expo Go** (phone app) | Runs the app on your own phone | App Store / Google Play |

You do **not** need a Mac. You do **not** need Xcode. You do **not** need any API keys or
a paid Apple account. The app runs fully offline out of the box.

---

## 2. Get it running

**Step 1 — Fork.** Open [the repo](https://github.com/cguirgu/pharos) and click **Fork**
(top right). This makes your own copy under your account. You will always work in your copy.

**Step 2 — Clone your fork** (replace `YOUR-USERNAME`):

```bash
git clone https://github.com/YOUR-USERNAME/pharos.git
cd pharos
```

**Step 3 — Point at the original repo too.** This lets you pull in changes other people make:

```bash
git remote add upstream https://github.com/cguirgu/pharos.git
```

**Step 4 — Install and run:**

```bash
npm install
npm start
```

**Step 5 — Open it on your phone.** A QR code appears in your terminal. Open the Camera app
(iPhone) or Expo Go (Android) and scan it. The app loads over wifi — your phone and computer
must be on the same network — and reloads automatically every time you save a file.

No phone handy? `npm run web` opens a browser preview instead. It is not pixel-perfect, but
it works for logic and copy changes.

> On the **Today** screen in a development build there is a small `DEV` bar. It lets you jump
> to any date, which is how you check that fasts and feasts behave correctly year-round.

---

## 3. Find something to work on

- Browse [open issues](https://github.com/cguirgu/pharos/issues). Anything labeled
  **`good first issue`** is deliberately scoped for a newcomer.
- **Comment on the issue to claim it** ("I'd like to take this") before you start, so two
  people don't do the same work.
- Have an idea that isn't an issue yet? **Open an issue first** and wait for a 👍 before
  writing code. This protects your time — nobody should spend a weekend on a pull request
  that was never going to be merged.

---

## 4. Make your change

Create a branch off `main`. Name it for what it does:

```bash
git checkout -b fix/fasting-label-typo
```

Use `fix/…` for bug fixes, `feat/…` for new functionality, `docs/…` for documentation.

### The three house rules

These are the conventions that keep the app trustworthy. Each one exists for a reason.

**Rule 1 — `src/domain` is pure TypeScript.**
Files under `src/domain/` must not import from `react`, `react-native`, or `expo`, and must
never call `new Date()`. Today's date is injected (`src/domain/coptic/clock.ts`); the one real
system clock lives in `src/platform/`.
*Why:* the liturgical calendar and Rule engines have to be provable on any date with `npm test`
alone. Mixing UI into them makes correctness untestable. See
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

**Rule 2 — Never invent liturgical or scriptural content.**
Do not add scripture, Agpeya prayers, saints' lives, or translations from an unverified source.
The bundled Bible is the public-domain KJV; other text requires written permission and is tracked
in [`docs/CONTENT-SOURCES.md`](./docs/CONTENT-SOURCES.md) and
[`CONTENT-LICENSE.md`](./CONTENT-LICENSE.md).
If you are unsure whether a fast, feast, or reading rule is right, do **not** guess — add a
`TODO(verify-liturgical)` comment and a line in [`TESTING.md`](./TESTING.md) so it can be
verified with a priest or an authoritative source.
*Why:* people pray with this app. Wrong text is worse than missing text.

**Rule 3 — Design tokens only.**
Colors, type, and spacing come from `src/ui/theme.ts`. No inline hex values, no emoji, sharp
corners. User-facing strings live in `src/ui/copy.ts`.
*Why:* the app has one deliberate visual and verbal language — warm and literary, never
gamified or guilt-driven. See [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md).

### Commit messages

Write in the imperative, and say *why* in the body if it isn't obvious:

```
Fix Great Lent end date off by one day

The final Saturday was excluded because the range check used < instead of <=.
```

---

## 5. Check your work before you push

Run both of these. They are exactly what the automated checks run, so if they pass locally,
your pull request will pass too:

```bash
npm test        # Jest — all suites must be green
npm run typecheck   # TypeScript, strict — must report no errors
```

If you changed anything visual, take a screenshot on your phone — you'll attach it to the
pull request.

---

## 6. Open your pull request

```bash
git push -u origin fix/fasting-label-typo
```

Then go to your fork on GitHub. A green **"Compare & pull request"** banner appears — click it.

- **base repository:** `cguirgu/pharos`, **base:** `main`
- **head repository:** your fork, **compare:** your branch

Fill in the template that loads automatically. A good description says what changed, why, and
how you checked it. If it fixes an issue, write `Closes #123` — GitHub will link and close it
for you.

Then click **Create pull request**. That's it — you've contributed to open source.

---

## 7. What happens next

- **Automated checks run immediately.** If they go red, click "Details" to see what failed,
  fix it, and push again to the *same branch* — the pull request updates itself. You do not
  open a new one.
- **I review pull requests within a week, usually sooner.**
- **"Changes requested" is normal.** It is not rejection — nearly every pull request in every
  project gets feedback, including mine. Push new commits to address it, then re-request review.
- **When it's merged,** your commits get squashed into one tidy commit on `main`, and you are
  permanently in the contributor list of a shipped App Store app. Put it on your résumé.

---

## 8. What kinds of changes are welcome?

**Go ahead without asking:**
- Bug fixes
- Tests for existing behavior
- Documentation and typo fixes
- Accessibility improvements (labels, contrast, dynamic type)
- Small UI polish that uses existing design tokens

**Open an issue and discuss first:**
- New screens, tabs, or features
- Adding a dependency
- Database or data-model changes
- Anything touching authentication, in-app purchases, or the liturgical calendar rules

---

## 9. Questions

Ask early — a question costs a minute, a wrong assumption costs a weekend. Open an issue or a
[Discussion](https://github.com/cguirgu/pharos/discussions). For anything sensitive or
security-related, see [`SECURITY.md`](./SECURITY.md).

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

Peace to you — and thank you for tending this lamp with me.
