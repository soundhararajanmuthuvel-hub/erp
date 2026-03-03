# NaturalFlow ERP - Natural Products Manufacturing ERP

A production-ready ERP system built with React, Node.js, and MongoDB.

## Features
- **FIFO Stock Management**: Automatically deducts raw materials based on purchase dates.
- **Production Tracking**: Lot management with yield and wastage tracking.
- **GST Billing**: Automated GST calculation for Retail, Wholesale, and Private Label.
- **Financial Reports**: Real-time Profit & Loss and GST HSN summaries.
- **PWA Ready**: Installable on mobile devices for offline access.

## Setup Instructions

### 1. MongoDB Atlas Setup
- Create a Cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get your connection string and replace `<username>` and `<password>`.
- **CRITICAL: IP Whitelisting**
  - Go to **Network Access** in Atlas.
  - Click **Add IP Address**.
  - Select **Allow Access From Anywhere** (`0.0.0.0/0`). This is required because the preview environment uses dynamic IPs.
  - Click **Confirm**.

### 2. Environment Variables
- Create a `.env` file based on `.env.example`.
- Set `MONGODB_URI` and `JWT_SECRET`.

### 3. Initial Seeding
Run the following command to create the initial admin user:
```bash
npm run seed
```
**Default Credentials:**
- Email: `admin@naturalflow.com`
- Password: `admin123` (or whatever you set in `.env`)

### 4. Deployment to Vercel
- **Frontend**: Connect your repo to Vercel. It will auto-detect Vite.
- **Backend**: The `server.ts` is structured to work with Express. For Vercel Serverless, you might need a `vercel.json` to route `/api/*` to the server file.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, Recharts.
- **Backend**: Node.js, Express, Mongoose, JWT, Helmet.
- **Database**: MongoDB Atlas.
