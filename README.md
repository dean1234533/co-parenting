# Js-Grw-Up: a co-parenting app for separated parents

**A private space for separated parents to share a calendar, message safely, log incidents, track expenses, and export court-ready records, all in one place.**

[![Live site](https://img.shields.io/badge/live-js--grw--up.com-10b981?style=flat-square)](https://js-grw-up.com/)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

**Live:** [js-grw-up.com](https://js-grw-up.com/)

---

## Screenshots

<!-- Add images to docs/screenshots/ and uncomment. -->
<!--
| Dashboard | Shared calendar | Messages | Expenses |
|---|---|---|---|
| ![](docs/screenshots/dashboard.png) | ![](docs/screenshots/calendar.png) | ![](docs/screenshots/chat.png) | ![](docs/screenshots/finances.png) |
-->

_Screenshots coming soon. For now, see the [live site](https://js-grw-up.com/)._

---

## Features

- **Invite your co-parent** with a secure invite link to join a shared space
- **Shared calendar** for handovers and events, with Google Calendar integration
- **Safe messaging** with a profanity filter to keep conversations child-focused
- **Daily log and incident records** with timestamps
- **Expenses.** Track shared costs and see who owes what.
- **Requests and house rules** agreed between both parents
- **Progress and homework tracking** for each child
- **Court-ready PDF export** of logs, messages, and expenses
- **Notifications** and an installable PWA
- **Privacy by design.** Automatic data retention clean-up and self-service
  account deletion.
- Stripe subscriptions for premium features

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, shadcn/ui (Radix), React Hook Form, TanStack Query, Recharts |
| Backend | Firebase Auth, Firestore, and Storage, with security rules |
| Serverless API | `functions/api` for invites, notifications, Stripe checkout and webhooks, and account deletion |
| Payments | Stripe |
| Reports | jsPDF |

---

## Getting started

```bash
git clone https://github.com/dean1234533/co-parenting.git
cd co-parenting
npm install
npm run dev
```

Set up a Firebase project with Auth, Firestore, and Storage, add your web app
config to the environment, and deploy the rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

```bash
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # type checking
```

---

## Project structure

```
src/
  pages/        Dashboard, Calendar, Chat, DailyLog, Finances, Requests, Rules, Progress, ExportPDF, Settings …
  components/   UI components (shadcn/ui)
  lib/          Firebase, auth, invites, notifications, Google Calendar, PDF report, profanity filter, data retention
  api/          data access layer
functions/api/  serverless endpoints (invites, notify, Stripe, delete account)
firestore.rules, storage.rules
```

---

## Author

Built by **Dean Da Dev**, a UK full-stack developer building web apps, websites,
and AI tools.

🌐 [dean-da-dev.co.uk](https://www.dean-da-dev.co.uk/) · 💼 [More projects](https://www.dean-da-dev.co.uk/portfolio) · 🐙 [GitHub](https://github.com/dean1234533)
