# AI-Powered RFP Management System

A modern, AI-powered Request for Proposal (RFP) management system built with React, Node.js, and Google Gemini AI.

![Dashboard Preview](docs/dashboard-preview.png)

## ✨ Features

### 🤖 AI-Powered RFP Creation
- **Natural Language Input**: Describe your procurement needs in plain English
- **Auto-structured RFPs**: AI extracts items, quantities, specifications, budget, and deadlines
- **Smart Date Parsing**: Converts "30 days from today" to actual dates

### 📧 Automated Vendor Communication
- **One-Click Email**: Send professional RFPs to multiple vendors simultaneously
- **Gmail Integration**: Uses your Gmail account for sending
- **Email Tracking**: Logs all outgoing and incoming emails

### 📥 Proposal Receiving & Parsing
- **IMAP Polling**: Automatically monitors inbox for vendor responses
- **AI Extraction**: Parses pricing, delivery terms, and warranty from email replies
- **Proposal Storage**: Saves structured proposal data for comparison

### 📊 AI Proposal Comparison
- **Smart Scoring**: Compares proposals on price, delivery time, terms, and warranty
- **Recommendations**: AI-generated vendor recommendations with reasoning
- **Visual Dashboard**: Side-by-side comparison view

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail account with App Password
- Google Gemini API Key

### 1. Clone & Install

```bash
git clone <repository-url>
cd aerchain

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE rfp_management;"

# Run schema
psql -U postgres -d rfp_management -f backend/src/config/database.sql
```

### 3. Environment Configuration

Create `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=postgres
DB_PASSWORD=your_password

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Gmail (use App Password, not regular password)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Server
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail" → "Windows Computer"
5. Copy the 16-character password to `.env`

### 5. Enable Gmail IMAP

1. Open Gmail → Settings → See all settings
2. Go to "Forwarding and POP/IMAP" tab
3. Enable IMAP
4. Save Changes

### 6. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## 📖 Usage Guide

### Creating an RFP

1. Click **"Create New RFP"**
2. Describe your needs naturally:
   > "I need 50 Dell laptops with i7 processors, 16GB RAM, 512GB SSD. Also need 50 24-inch monitors. Budget is $75,000. Delivery needed in 30 days. Payment terms: 50% advance, 50% on delivery. Require 2-year warranty."
3. Click **"Generate RFP"**
4. Review the AI-parsed structure
5. Edit if needed
6. Click **"Save RFP"**

### Sending to Vendors

1. Go to **RFPs** → Click on an RFP
2. Click **"Send to Vendors"**
3. Select vendors from the list
4. Click **"Send RFP"**
5. Vendors receive professional email

### Viewing Proposals

1. When vendors reply, the system auto-processes responses
2. Go to RFP → Click **"View Proposals"**
3. See all vendor proposals with parsed data
4. Click **"Get AI Recommendation"** for comparison

## 🏗️ Architecture

```
aerchain/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── config/       # Database, Email, Gemini configs
│   │   ├── controllers/  # HTTP request handlers
│   │   ├── services/     # Business logic
│   │   │   ├── aiService.js           # Gemini AI integration
│   │   │   ├── emailService.js        # SMTP sending
│   │   │   ├── emailReceiverService.js # IMAP receiving
│   │   │   ├── rfpService.js          # RFP operations
│   │   │   └── vendorService.js       # Vendor operations
│   │   └── routes/       # API endpoints
│   └── package.json
│
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── utils/        # Helper functions
│   └── package.json
│
└── README.md
```

## 🛠️ API Endpoints

### RFPs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rfps` | List all RFPs |
| GET | `/api/rfps/:id` | Get RFP by ID |
| POST | `/api/rfps` | Create RFP |
| POST | `/api/rfps/create-from-text` | Create RFP from natural language |
| PUT | `/api/rfps/:id` | Update RFP |
| DELETE | `/api/rfps/:id` | Delete RFP |
| POST | `/api/rfps/:id/send` | Send RFP to vendors |
| GET | `/api/rfps/:id/proposals` | Get proposals for RFP |
| GET | `/api/rfps/:id/comparison` | Get AI comparison |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vendors` | List all vendors |
| GET | `/api/vendors/:id` | Get vendor by ID |
| POST | `/api/vendors` | Create vendor |
| PUT | `/api/vendors/:id` | Update vendor |
| DELETE | `/api/vendors/:id` | Delete vendor |

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emails/check` | Manually check for new emails |

## 🧪 Testing

### Manual Email Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/emails/check" -Method POST
```

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

## 📝 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **AI**: Google Gemini 2.5 Flash
- **Email**: Nodemailer (SMTP), imap-simple (IMAP)

## 🔒 Security Notes

- Never commit `.env` files
- Use Gmail App Passwords, not regular passwords
- CORS is configured for localhost only
- Consider adding authentication for production

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
