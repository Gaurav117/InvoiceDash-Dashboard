# InvoiceDash

InvoiceDash is a premium web application for bulk invoice management, automated data extraction, and GST analytics. Designed with a clean, modern aesthetic inspired by high-end financial dashboards.

## Features
- **Bulk Upload**: Drag & drop multiple PDF invoices for automated processing.
- **Automated Extraction**: Uses `pdf-parse` and heuristic logic to extract amounts, GST details, dates, and client info.
- **GST Analytics**: Interactive dashboard showing Revenue Trends, GST breakdown (CGST/SGST/IGST), and pending amounts.
- **Invoice Management**: Filterable table with side-drawer detail views.
- **Client Profiles**: Track revenue and tax history per customer.
- **Export**: One-click CSV export of filtered invoice data.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4.
- **UI Components**: shadcn/ui.
- **Database**: SQLite with Prisma ORM.
- **Charts**: Recharts.

## Getting Started

### 1. Installation
The project includes a portable Node.js environment. To install dependencies from scratch (if not already done):
```bash
npm install
```

### 2. Database Setup
Initialize the SQLite database and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

### 3. Seed Demo Data
Populate the dashboard with sample data:
```bash
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Storage
Uploaded PDFs are stored locally in the `/uploads` directory with unique names to prevent collisions.

## Manual Review
If an invoice is flagged with "NEEDS_REVIEW", it means some critical data (like invoice number or total) was ambiguous during parsing. You can view these in the Invoices tab and correct them (Manual Edit UI forthcoming in v1.1).
