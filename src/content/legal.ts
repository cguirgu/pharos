/**
 * Canonical legal copy for Coptic Daily Companion — the ONE source of truth.
 *
 * Rendered in-app by app/you/privacy.tsx and app/you/terms.tsx, and emitted as
 * public HTML by scripts/build-legal.mjs (web/legal/**) for the URLs required by
 * the App Store privacy field. Edit here, then re-run `node scripts/build-legal.mjs`
 * so the hosted pages stay in sync.
 */

export const LEGAL_META = {
  appName: 'Coptic Daily Companion',
  /** Shown to users + used in the App Store listing. */
  contactEmail: 'support@cgsoftwarestudio.com',
  /** Last substantive revision. Bump whenever the text below changes. */
  effectiveDate: 'July 16, 2026',
} as const;

export type LegalSection = {
  heading: string;
  /** Plain paragraphs. */
  body?: string[];
  /** Optional bulleted list rendered after the paragraphs. */
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  intro: string[];
  sections: LegalSection[];
};

const { appName, contactEmail } = LEGAL_META;

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  intro: [
    `${appName} is a personal Coptic Orthodox rule-of-life companion. It is built local-first: your practices, journal entries, highlights, reading progress, and prayer logs live on your device. This policy explains the limited data we handle when you choose to sign in and sync, and the choices you have.`,
    `We do not sell your data, show advertising, or use third-party analytics or tracking.`,
  ],
  sections: [
    {
      heading: 'Data stored only on your device',
      body: [
        `If you use ${appName} without signing in, your content never leaves your device. Reminders are scheduled locally; appearance, notification settings, and your session are kept in local storage only and are never uploaded.`,
      ],
    },
    {
      heading: 'Data we process when you sign in and sync',
      body: [
        `Signing in is optional and exists only to back up your rule and sync it across your devices. You can sign in with Sign in with Apple or with an email and password. When you sign in, we receive and store:`,
      ],
      bullets: [
        'Account identifiers: your email address and a unique account id, plus an optional display name.',
        'Your rule content: practices and practice logs, rest days, journal entries, highlights and notes, reading plans and progress, daily-office logs, and lesson results.',
        'A profile record: your chosen journey stage and whether onboarding is complete.',
      ],
    },
    {
      heading: 'How your data is used',
      body: [
        `We use the data above solely to authenticate you and to store and sync your own content back to you. We do not use it for advertising or profiling, and we do not share it with anyone except the infrastructure providers below who process it on our behalf.`,
      ],
    },
    {
      heading: 'Service providers and sign-in',
      body: [`We rely on the following to operate the app:`],
      bullets: [
        'Supabase — hosts the database and authentication that store and sync your content. Access is protected by per-account Row-Level Security so a row is only ever readable or writable by its owner.',
        'Sign in with Apple — if you choose it, Apple shares your name and email address (or a private-relay email that forwards to you) with us to create your account. Your use of Sign in with Apple is also subject to Apple’s Privacy Policy.',
      ],
    },
    {
      heading: 'Security',
      body: [
        `All synced data travels over encrypted HTTPS/TLS connections. On the server, Row-Level Security policies enforce that each account can access only its own rows. No method of storage or transmission is perfectly secure, but we work to protect your information.`,
      ],
    },
    {
      heading: 'Data retention and deletion',
      body: [
        `Synced data is kept while your account exists. You can delete content in the app at any time. To delete your account and all associated data, use “Delete account” in Settings (the You tab); this permanently removes your account and cascades to remove your practices, logs, journal, highlights, plans, learning progress, and profile. Content stored only on your device is also removed when you delete the app. You may still email ${contactEmail} for help.`,
      ],
    },
    {
      heading: 'Your rights',
      body: [
        `Depending on where you live, you may have rights to access, correct, export, or delete your personal data, and to withdraw consent. You can export your data and delete your account directly in Settings (the You tab); for anything else, email ${contactEmail} and we will respond within a reasonable time.`,
      ],
    },
    {
      heading: 'Children',
      body: [
        `${appName} is not directed to children under 13, and we do not knowingly collect personal data from them. If you believe a child has provided us data, contact us and we will delete it.`,
      ],
    },
    {
      heading: 'Changes to this policy',
      body: [
        `We may update this policy as the app evolves. Material changes will be reflected by a new effective date, and significant changes will be communicated in-app where appropriate.`,
      ],
    },
    {
      heading: 'Contact',
      body: [`Questions about this policy? Email ${contactEmail}.`],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: 'Terms of Service',
  intro: [
    `These terms govern your use of ${appName}. By downloading or using the app you agree to them. If you do not agree, please do not use the app.`,
  ],
  sections: [
    {
      heading: 'The service',
      body: [
        `${appName} is a personal devotional tool that helps you keep a Coptic Orthodox rule of life — tracking practices, prayer, reading, journaling, and reflection. It is provided for your personal, non-commercial use.`,
      ],
    },
    {
      heading: 'Not a substitute for the Church',
      body: [
        `${appName} is a companion, not a spiritual authority. Its content does not replace Holy Scripture, the sacraments, or the guidance of your priest or father of confession. Nothing in the app is medical, legal, psychological, or professional advice.`,
      ],
    },
    {
      heading: 'Your account',
      body: [
        `If you sign in, you are responsible for keeping your sign-in credentials — your Apple ID, or your email and password — secure, and for the activity under your ${appName} account. Notify us promptly of any unauthorized use.`,
      ],
    },
    {
      heading: 'Acceptable use',
      body: [`You agree not to:`],
      bullets: [
        'use the app for any unlawful purpose or in violation of these terms;',
        'attempt to access accounts or data that are not your own;',
        'interfere with, disrupt, probe, or reverse-engineer the service except as permitted by law.',
      ],
    },
    {
      heading: 'Content and intellectual property',
      body: [
        `Scripture is presented from the King James Version (public domain). Liturgical and devotional texts are drawn from the sources credited in the app’s About screen. The ${appName} name, design, original copy, and software are owned by us and protected by law. Content you create (journal entries, notes, highlights) remains yours; by syncing it you grant us only the limited permission needed to store and return it to you.`,
      ],
    },
    {
      heading: 'Disclaimers',
      body: [
        `The app is provided “as is” and “as available,” without warranties of any kind, whether express or implied, including fitness for a particular purpose and uninterrupted or error-free operation. You are responsible for keeping your own backups of important content.`,
      ],
    },
    {
      heading: 'Limitation of liability',
      body: [
        `To the fullest extent permitted by law, ${appName} and its makers will not be liable for any indirect, incidental, or consequential damages, or for any loss of data, arising from your use of or inability to use the app.`,
      ],
    },
    {
      heading: 'Termination',
      body: [
        `You may stop using the app at any time and request deletion of your account. We may suspend or end access if these terms are violated or to comply with the law.`,
      ],
    },
    {
      heading: 'Changes to these terms',
      body: [
        `We may update these terms as the app evolves. Continued use after an update means you accept the revised terms; the effective date below reflects the latest version.`,
      ],
    },
    {
      heading: 'Contact',
      body: [`Questions about these terms? Email ${contactEmail}.`],
    },
  ],
};
