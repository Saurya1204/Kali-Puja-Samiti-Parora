# Kali Puja Samiti Parora – Official Website & Complete Management System

> **श्री श्री 108 काली पूजा समिति परोरा (पूर्णिया, बिहार)**  
> Govt Registration No: `BR-PUR-2012/KP-042` | Established: `1984`  
> Annual Celebration: **9th & 10th November** (Configurable annually, immediately following Deepavali)

---

## 1. Project Overview

A production-ready digital platform built for **Kali Puja Samiti Parora**, featuring two unified modules powered by a centralized database:
1. **Culturally Rich Public Festival Website**: Designed to engage villagers, devotees, visitors, students, participants, sponsors, and patrons.
2. **Secure Admin Dashboard & Samiti Management System**: Complete financial governance, bill tracking, budget controls, vendor management, live kabaddi tournament scoring, student achievement verification, and audit logs.

---

## 2. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server Actions, API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with traditional Indian festive palette (Deep red, maroon, festive gold, amber)
- **Animations**: Diya flame animations, celebratory confetti (`canvas-confetti`), glassmorphic cards
- **Icons**: Lucide React
- **Analytics & Graphs**: Recharts
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Exporting**: Excel (`xlsx`) and formatted printable PDF view (`@media print`)
- **Authentication & Security**: Role-Based Access Control (RBAC), bcrypt password hashing, secure session management, immutable audit logging

---

## 3. Key Modules & Features

### A. Public Festival Website
- **Festive Homepage**: Cultural hero banner, animated sacred greetings, live announcement ticker, highlights, sponsors, achievers, and Diya animations.
- **Dynamic Festival Countdown**: Days, hours, minutes, and seconds countdown to festival start, with "Festival-in-Progress" and "Completed" states.
- **Event Timeline & Calendar**: Categories include Religious Ceremonies, Kabaddi Tournament, Cultural Programs, Dance & Singing, Student Recognition, Sports, and Community Bhandara.
- **Kabaddi Tournament Arena**: Live score updates, stage fixtures (Group Stage, Semis, Finals), points table, and AKFI rulebook.
- **Pratibha Samman (Wall of Achievers)**: Public recognition wall for Class 10, Class 12, Graduation, Competitive Exams (JEE/NEET/BPSC), Government Jobs, and Sports. Includes an online student application form.
- **Universal Registration**: Instant registration for Kabaddi teams, individual competitions, cultural performances, and volunteers with unique registration numbers (e.g., `KPS-REG-2026-XXXX`) and printable confirmation slips.
- **Donations & Devotee Chanda**: Dynamic UPI QR code (`samitiparora@sbi`), official SBI bank details, online donation submission, instant digital donation receipt generator with official seal, and an opt-in public donor gratitude wall.
- **Photo & Video Gallery**: Year-wise archives (2026, 2025, 2024), category filter, and interactive image lightbox.
- **Interactive Engagement**: Parora Heritage & Festival Quiz with digital certificate of honor, public Audience Choice voting with anti-cheat protection, and 1-click WhatsApp sharing.
- **Bilingual Experience**: Instant toggle between Hindi (हिंदी) and English (EN).

---

### B. Admin Dashboard & Samiti Management System
- **Executive Overview**: Real-time KPI cards (Total Donations, Total Expenses, Available Balance, Vendor Dues, Registrations count, Pending bills) and Recharts financial breakdown graphs.
- **Switchable Annual Festival Management**: Switch between 2026, 2025, and 2024. All records (events, expenses, donations, awardees) remain preserved independently for long-term scalability.
- **Expense & Bill Management (Most Important Module)**:
  - All 19 standard expense categories:
    1. Tent and Pandal Expenses
    2. Decoration and Lighting
    3. Sound System and DJ
    4. Stage Construction
    5. Electrical Arrangements
    6. Kali Puja Religious Arrangements
    7. Prasad and Food Arrangements
    8. Kabaddi Tournament
    9. Sports Equipment
    10. Cultural Programs
    11. Dance and Music Performances
    12. Prize Distribution Ceremony
    13. Student Awards and Trophies
    14. Printing and Banners
    15. Transportation
    16. Water and Refreshments
    17. Security Arrangements
    18. Cleaning and Maintenance
    19. Miscellaneous Expenses
  - Bill invoice numbers, dates, payment methods (Cash, UPI, Bank Transfer, Cheque), partial payment tracking, advance payments, and outstanding balances.
  - Filter by category, vendor, payment status, and date.
  - 1-click Excel export (`.xlsx`) and printable PDF expense statements.
- **Annual Budget Control**: Set category budgets, monitor actual expenses, remaining balances, utilization percentage, and visual over-budget warnings.
- **Donation & Income Management**: Record offline/online contributions, toggle public display consent, and generate downloadable/printable official donation receipts.
- **Centralized Financial Ledger & Balance Sheet**:
  - Formula: `Opening Balance + Total Income - Total Expenses = Closing Balance`
  - Separate Cash Ledger and Bank/UPI Ledger to prevent double-counting.
- **Vendor Directory**: Track suppliers (Tent, Light, Sound, Catering, Printing, Sports) with total billed, total paid, and outstanding balances.
- **Kabaddi Live Score Console**: Update live raid and tackle points (+1, +2, All-Out), post real-time commentary, and declare winners (automatically recalculates points table).
- **Student Achievement Verification**: Review applications, inspect certificates, assign prizes (medals, scholarships), and publish approved achievers.
- **Reports Section**: 6 report types with instant Excel export and clean printable views.
- **Portal Settings**: Configure annual festival dates, countdown timers, UPI VPA, Bank account details, and committee phone numbers.
- **Audit Trail**: Immutable logs capturing who created, modified, or deleted financial or administrative records.

---

## 4. Administrative Demo Credentials

You can log in at `/login` using the quick-fill buttons or the credentials below:

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@kalipujaparora.org` | `admin123` | Full system access, settings, user management |
| **President** | `president@kalipujaparora.org` | `president123` | View overall management, approve transactions |
| **Secretary** | `secretary@kalipujaparora.org` | `secretary123` | Events, registrations, notices, committee |
| **Treasurer** | `treasurer@kalipujaparora.org` | `treasurer123` | Expenses, bills, donations, ledger, vendors |
| **Event Manager** | `events@kalipujaparora.org` | `events123` | Event schedules, live kabaddi score console |
| **Volunteer** | `volunteer@kalipujaparora.org` | `volunteer123` | Registrations view & volunteer task duty roster |

---

## 5. Local Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Demo Data
```bash
npx prisma db push
node prisma/seed.js
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Switching to Production PostgreSQL (Neon, Supabase, Hostinger VPS)

The Prisma schema is fully normalized and compatible with PostgreSQL:

1. Update `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-something.neon.tech/kalipuja?sslmode=require"
   ```
2. In `prisma/schema.prisma`, change datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run Prisma deployment commands:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```
4. Build the production bundle:
   ```bash
   npm run build
   npm run start
   ```

---

## 7. Folder Structure

```
├── prisma/
│   ├── schema.prisma       # Relational models (Events, Expenses, Donations, Ledger, Vendors, etc.)
│   └── seed.js             # Realistic demo data for 2026, 2025, and 2024
├── src/
│   ├── app/
│   │   ├── (public)/       # Public festival website
│   │   │   ├── page.tsx    # Homepage (Hero, Countdown, Live Score, Highlights, Sponsors)
│   │   │   ├── events/     # Timeline & category filter
│   │   │   ├── kabaddi/    # Live scoreboard & points table
│   │   │   ├── achievers/  # Wall of Achievers & student registration
│   │   │   ├── register/   # Universal registration with digital slip
│   │   │   ├── donations/  # UPI QR, bank details & donation receipt generator
│   │   │   ├── gallery/    # Year-wise photo/video lightbox
│   │   │   ├── notices/    # Circulars & announcements
│   │   │   ├── about/      # Samiti history & committee directory
│   │   │   ├── quiz/       # Interactive cultural quiz with certificate
│   │   │   ├── vote/       # Audience choice voting
│   │   │   └── login/      # Secure login portal with 1-click demo accounts
│   │   ├── admin/          # Secure management system
│   │   │   ├── page.tsx    # Executive dashboard & Recharts graphs
│   │   │   ├── expenses/   # 19 expense categories, bills, partial payments, Excel
│   │   │   ├── budget/     # Annual budget control & utilization
│   │   │   ├── donations/  # Income ledger & printable receipts
│   │   │   ├── ledger/     # Dual cash & bank/UPI ledger, balance sheet
│   │   │   ├── vendors/    # Vendor directory & outstanding balances
│   │   │   ├── events/     # Add/edit events
│   │   │   ├── kabaddi/    # Live score console & points table updater
│   │   │   ├── students/   # Student verification & prize assignment
│   │   │   ├── registrations/ # Review registrations & Excel export
│   │   │   ├── notices/    # Announcements & ticker publisher
│   │   │   ├── gallery/    # Album manager & photo uploader
│   │   │   ├── committee/  # Committee directory & volunteer roster
│   │   │   ├── reports/    # 6 audited reports with Excel/Print export
│   │   │   ├── settings/   # Festival year config & bank settings
│   │   │   └── audit-logs/ # System activity & audit trail
│   │   └── api/            # Server actions & REST endpoints
│   ├── components/
│   │   ├── public/         # Navbar, Footer, Countdown, Diya, WhatsApp share
│   │   └── admin/          # Sidebar, YearSelector, DashboardCharts
│   └── lib/
│       ├── prisma.ts       # Prisma client singleton
│       ├── auth.ts         # Session authentication & RBAC helpers
│       ├── utils.ts        # INR currency formatting, date helpers
│       └── exportUtils.ts  # Excel (.xlsx) export utility
```

---
*Dedicated to the prosperity, culture, and sportsmanship of Parora village.*
