# AI-Powered RFP Management System - Implementation Plan

## Overview

This document outlines the complete implementation strategy for building an AI-powered RFP (Request for Proposal) management system. The system will streamline the entire procurement workflow from RFP creation through vendor selection, leveraging AI for natural language processing, data extraction, and intelligent recommendations.

## Technology Stack

### Frontend
- **Framework**: React.js (with Vite for build tooling)
- **UI Library**: Material-UI (MUI) for professional, enterprise-grade components
- **State Management**: React Context API + useState/useReducer
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: CSS Modules + MUI theming

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL (with pg library)
- **ORM**: Raw SQL queries with prepared statements for security
- **Email Service**: Gmail API + Nodemailer for SMTP
- **AI Integration**: Google Gemini 2.5 Flash Lite API
- **Email Parsing**: IMAP (imap-simple) for receiving emails
- **File Processing**: PDF parsing (pdf-parse), DOCX parsing (mammoth)

### Infrastructure
- **Database**: PostgreSQL 14+
- **Email**: Gmail with App Password / OAuth2
- **Environment Management**: dotenv
- **Process Management**: PM2 (for production)

---

## Database Schema Design

### Tables

#### 1. `rfps` Table
```sql
CREATE TABLE rfps (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  delivery_deadline DATE,
  payment_terms VARCHAR(255),
  warranty_requirements TEXT,
  items JSONB NOT NULL, -- Array of items with specifications
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `vendors` Table
```sql
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  address TEXT,
  specialization TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `rfp_vendors` Table (Many-to-Many relationship)
```sql
CREATE TABLE rfp_vendors (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  sent_at TIMESTAMP,
  email_message_id VARCHAR(255), -- Gmail message ID
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, responded
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rfp_id, vendor_id)
);
```

#### 4. `proposals` Table
```sql
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  email_message_id VARCHAR(255),
  raw_email_body TEXT,
  parsed_data JSONB, -- Structured data extracted by AI
  total_price DECIMAL(15, 2),
  delivery_time_days INTEGER,
  payment_terms VARCHAR(255),
  warranty_offered TEXT,
  additional_terms TEXT,
  ai_score DECIMAL(5, 2), -- AI-generated score (0-100)
  ai_summary TEXT, -- AI-generated summary
  completeness_score DECIMAL(5, 2), -- How complete is the response
  received_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `email_logs` Table
```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
  direction VARCHAR(10), -- 'outbound' or 'inbound'
  subject VARCHAR(500),
  body TEXT,
  message_id VARCHAR(255),
  status VARCHAR(50), -- sent, received, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## System Architecture

### Frontend Architecture

```
/frontend
├── /src
│   ├── /components
│   │   ├── /common
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── /rfp
│   │   │   ├── RFPCreationChat.jsx
│   │   │   ├── RFPList.jsx
│   │   │   ├── RFPDetails.jsx
│   │   │   └── RFPStructuredView.jsx
│   │   ├── /vendor
│   │   │   ├── VendorList.jsx
│   │   │   ├── VendorForm.jsx
│   │   │   ├── VendorSelection.jsx
│   │   │   └── VendorCard.jsx
│   │   ├── /proposal
│   │   │   ├── ProposalComparison.jsx
│   │   │   ├── ProposalCard.jsx
│   │   │   ├── ProposalDetails.jsx
│   │   │   └── AIRecommendation.jsx
│   │   └── /email
│   │       ├── EmailPreview.jsx
│   │       └── EmailStatus.jsx
│   ├── /pages
│   │   ├── Dashboard.jsx
│   │   ├── CreateRFP.jsx
│   │   ├── RFPManagement.jsx
│   │   ├── VendorManagement.jsx
│   │   ├── ProposalComparison.jsx
│   │   └── EmailInbox.jsx
│   ├── /services
│   │   ├── api.js
│   │   ├── rfpService.js
│   │   ├── vendorService.js
│   │   └── proposalService.js
│   ├── /context
│   │   └── AppContext.jsx
│   ├── /utils
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   └── main.jsx
```

### Backend Architecture

```
/backend
├── /src
│   ├── /config
│   │   ├── database.js
│   │   ├── email.js
│   │   └── gemini.js
│   ├── /controllers
│   │   ├── rfpController.js
│   │   ├── vendorController.js
│   │   ├── proposalController.js
│   │   └── emailController.js
│   ├── /services
│   │   ├── aiService.js
│   │   ├── emailService.js
│   │   ├── rfpService.js
│   │   ├── vendorService.js
│   │   └── proposalService.js
│   ├── /routes
│   │   ├── rfpRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── proposalRoutes.js
│   │   └── emailRoutes.js
│   ├── /middleware
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── /utils
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── /workers
│   │   └── emailPoller.js
│   └── server.js
```

---

## Core Features Implementation

### Feature 1: AI-Powered RFP Creation

#### User Flow
1. User navigates to "Create RFP" page
2. User enters natural language description in a chat-like interface
3. AI (Gemini) processes the input and extracts structured data
4. System displays structured RFP for review
5. User can edit or confirm the RFP
6. RFP is saved to database

#### AI Integration
- **Prompt Engineering**: Design a comprehensive prompt that instructs Gemini to extract:
  - RFP title
  - Budget and currency
  - Delivery deadline
  - Items with quantities and specifications
  - Payment terms
  - Warranty requirements
  - Any additional requirements

- **Response Format**: JSON schema with validation
  
```javascript
{
  "title": "Office Equipment Procurement",
  "budget": 50000,
  "currency": "USD",
  "delivery_deadline": "2026-02-20",
  "payment_terms": "Net 30",
  "warranty_requirements": "At least 1 year warranty",
  "items": [
    {
      "name": "Laptops",
      "quantity": 20,
      "specifications": "16GB RAM, SSD storage"
    },
    {
      "name": "Monitors",
      "quantity": 15,
      "specifications": "27-inch display"
    }
  ]
}
```

#### API Endpoint
- **POST** `/api/rfps/create-from-text`
  - Request: `{ "naturalLanguageInput": "..." }`
  - Response: Structured RFP object

---

### Feature 2: Vendor Management

#### Functionality
- CRUD operations for vendors
- Search and filter vendors
- View vendor history (past RFPs, proposals)

#### API Endpoints
- **GET** `/api/vendors` - List all vendors
- **POST** `/api/vendors` - Create new vendor
- **GET** `/api/vendors/:id` - Get vendor details
- **PUT** `/api/vendors/:id` - Update vendor
- **DELETE** `/api/vendors/:id` - Delete vendor

---

### Feature 3: Email Integration - Sending RFPs

#### Gmail Setup
1. Enable Gmail API in Google Cloud Console
2. Create OAuth2 credentials OR use App Password
3. Configure Nodemailer with Gmail SMTP

#### Implementation
- **Email Template**: Professional HTML email template with RFP details
- **Attachment Support**: Optionally attach PDF version of RFP
- **Tracking**: Store email message ID for tracking responses

#### Email Service Functions
```javascript
async function sendRFPToVendors(rfpId, vendorIds) {
  // 1. Fetch RFP details
  // 2. Fetch vendor emails
  // 3. Generate email content with RFP details
  // 4. Send email via Nodemailer
  // 5. Log email in email_logs table
  // 6. Update rfp_vendors table with sent status
}
```

#### API Endpoint
- **POST** `/api/rfps/:id/send`
  - Request: `{ "vendorIds": [1, 2, 3] }`
  - Response: `{ "sent": 3, "failed": 0 }`

---

### Feature 4: Email Integration - Receiving Proposals

#### IMAP Polling Service
- Background worker that polls Gmail inbox every 2-5 minutes
- Filters emails based on subject line patterns (e.g., "Re: RFP")
- Extracts email body and attachments
- Passes to AI service for parsing

#### Email Parsing with AI
- **Gemini Prompt**: Extract proposal details from email
  - Pricing information
  - Delivery timeline
  - Payment terms
  - Warranty details
  - Additional terms/conditions
  
- **Attachment Processing**: If email contains PDF/DOCX attachments:
  - Extract text from attachments
  - Combine with email body
  - Send to Gemini for comprehensive parsing

#### Proposal Storage
- Store raw email body
- Store AI-parsed structured data
- Link to RFP and vendor
- Calculate initial scores

#### Worker Implementation
```javascript
// emailPoller.js
setInterval(async () => {
  const emails = await fetchNewEmails();
  for (const email of emails) {
    const rfp = await matchEmailToRFP(email);
    const vendor = await matchEmailToVendor(email);
    if (rfp && vendor) {
      const parsedProposal = await parseProposalWithAI(email);
      await saveProposal(rfp.id, vendor.id, parsedProposal);
    }
  }
}, 120000); // Poll every 2 minutes
```

---

### Feature 5: Proposal Comparison & AI Recommendations

#### Comparison View
- Side-by-side comparison table
- Key metrics: Price, delivery time, warranty, payment terms
- Completeness indicators
- AI-generated scores

#### AI Scoring & Recommendation
- **Multi-factor Analysis**:
  - Price competitiveness (weighted score)
  - Delivery timeline alignment
  - Payment terms favorability
  - Warranty coverage
  - Completeness of response
  
- **Gemini Prompt**: Generate recommendation
  - Input: All proposals for an RFP
  - Output: 
    - Individual scores (0-100)
    - Comparative summary
    - Recommendation with reasoning
    - Risk factors or concerns

#### API Endpoints
- **GET** `/api/rfps/:id/proposals` - Get all proposals for an RFP
- **GET** `/api/rfps/:id/comparison` - Get AI-powered comparison
- **GET** `/api/proposals/:id` - Get proposal details

---

## AI Service Architecture

### Gemini Integration Strategy

#### 1. RFP Creation Prompt
```javascript
const RFP_CREATION_PROMPT = `
You are an expert procurement assistant. Extract structured RFP information from the following natural language description.

User Input: {userInput}

Extract and return a JSON object with the following structure:
{
  "title": "Brief descriptive title for the RFP",
  "description": "Full description of what is being procured",
  "budget": numeric value only,
  "currency": "USD/EUR/etc",
  "delivery_deadline": "YYYY-MM-DD format",
  "payment_terms": "extracted payment terms",
  "warranty_requirements": "warranty details",
  "items": [
    {
      "name": "item name",
      "quantity": numeric,
      "specifications": "detailed specs"
    }
  ],
  "additional_requirements": "any other requirements"
}

Be precise and extract all relevant details. If information is missing, use null.
`;
```

#### 2. Proposal Parsing Prompt
```javascript
const PROPOSAL_PARSING_PROMPT = `
You are an expert at analyzing vendor proposals. Extract structured information from this vendor response.

RFP Details: {rfpDetails}
Vendor Email: {emailBody}

Extract and return JSON:
{
  "total_price": numeric,
  "currency": "USD/EUR/etc",
  "delivery_time_days": numeric,
  "payment_terms": "extracted terms",
  "warranty_offered": "warranty details",
  "items_quoted": [
    {
      "name": "item",
      "quantity": numeric,
      "unit_price": numeric,
      "specifications": "specs offered"
    }
  ],
  "additional_terms": "other conditions",
  "completeness_score": 0-100 (how complete is this response)
}
`;
```

#### 3. Comparison & Recommendation Prompt
```javascript
const COMPARISON_PROMPT = `
You are a procurement expert evaluating vendor proposals.

RFP Requirements: {rfpDetails}

Vendor Proposals:
{proposalsArray}

Analyze and provide:
1. Individual scores (0-100) for each vendor based on:
   - Price competitiveness (30%)
   - Delivery timeline (25%)
   - Payment terms (15%)
   - Warranty coverage (15%)
   - Completeness (15%)

2. A comparative summary highlighting strengths/weaknesses

3. A clear recommendation with reasoning

4. Any red flags or concerns

Return JSON:
{
  "vendor_scores": [
    {
      "vendor_id": 1,
      "vendor_name": "...",
      "overall_score": 85,
      "price_score": 90,
      "delivery_score": 80,
      "terms_score": 85,
      "warranty_score": 90,
      "completeness_score": 85
    }
  ],
  "summary": "comparative analysis",
  "recommendation": {
    "recommended_vendor_id": 1,
    "reasoning": "detailed explanation"
  },
  "concerns": ["list of concerns if any"]
}
`;
```

---

## Email Service Implementation Details

### Sending Emails (Nodemailer + Gmail)

```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // App-specific password
  }
});

// services/emailService.js
async function sendRFPEmail(vendorEmail, rfpDetails) {
  const htmlContent = generateRFPEmailHTML(rfpDetails);
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: vendorEmail,
    subject: `RFP: ${rfpDetails.title}`,
    html: htmlContent,
    headers: {
      'X-RFP-ID': rfpDetails.id.toString()
    }
  };
  
  const info = await transporter.sendMail(mailOptions);
  return info.messageId;
}
```

### Receiving Emails (IMAP)

```javascript
// workers/emailPoller.js
const Imap = require('imap-simple');

const imapConfig = {
  imap: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  }
};

async function pollEmails() {
  const connection = await Imap.connect(imapConfig);
  await connection.openBox('INBOX');
  
  const searchCriteria = ['UNSEEN', ['SUBJECT', 'RFP']];
  const fetchOptions = {
    bodies: ['HEADER', 'TEXT'],
    markSeen: true
  };
  
  const messages = await connection.search(searchCriteria, fetchOptions);
  
  for (const message of messages) {
    await processIncomingEmail(message);
  }
  
  connection.end();
}

// Run every 2 minutes
setInterval(pollEmails, 120000);
```

---

## Frontend Implementation Details

### RFP Creation Interface

#### Chat-like Interface
- Input textarea for natural language
- "Generate RFP" button
- Loading state while AI processes
- Display structured result in editable form
- Confirm and save

#### Component Structure
```jsx
// RFPCreationChat.jsx
function RFPCreationChat() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [structuredRFP, setStructuredRFP] = useState(null);
  
  const handleGenerate = async () => {
    setLoading(true);
    const response = await api.post('/rfps/create-from-text', { 
      naturalLanguageInput: input 
    });
    setStructuredRFP(response.data);
    setLoading(false);
  };
  
  return (
    // Chat interface with input and structured view
  );
}
```

### Proposal Comparison Dashboard

#### Features
- Table view with all proposals
- Sortable columns
- AI score badges
- Expandable details
- AI recommendation panel
- Visual indicators (best price, fastest delivery, etc.)

---

## Environment Variables

### Backend (.env)
```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rfp_management
DB_USER=postgres
DB_PASSWORD=your_password

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email Polling
EMAIL_POLL_INTERVAL=120000
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## API Documentation

### RFP Endpoints

#### Create RFP from Natural Language
- **POST** `/api/rfps/create-from-text`
- **Request Body**:
  ```json
  {
    "naturalLanguageInput": "I need to procure laptops..."
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "title": "Office Equipment Procurement",
    "budget": 50000,
    "items": [...],
    ...
  }
  ```

#### Get All RFPs
- **GET** `/api/rfps`
- **Response**: Array of RFP objects

#### Get RFP Details
- **GET** `/api/rfps/:id`
- **Response**: Single RFP object with related vendors and proposals

#### Send RFP to Vendors
- **POST** `/api/rfps/:id/send`
- **Request Body**:
  ```json
  {
    "vendorIds": [1, 2, 3]
  }
  ```
- **Response**:
  ```json
  {
    "sent": 3,
    "failed": 0,
    "details": [...]
  }
  ```

### Vendor Endpoints

#### Create Vendor
- **POST** `/api/vendors`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@vendor.com",
    "company_name": "Tech Supplies Inc",
    "phone": "+1234567890",
    "specialization": "IT Equipment"
  }
  ```

#### Get All Vendors
- **GET** `/api/vendors`

#### Update Vendor
- **PUT** `/api/vendors/:id`

#### Delete Vendor
- **DELETE** `/api/vendors/:id`

### Proposal Endpoints

#### Get Proposals for RFP
- **GET** `/api/rfps/:id/proposals`
- **Response**: Array of proposal objects

#### Get AI Comparison
- **GET** `/api/rfps/:id/comparison`
- **Response**:
  ```json
  {
    "proposals": [...],
    "ai_analysis": {
      "vendor_scores": [...],
      "summary": "...",
      "recommendation": {...}
    }
  }
  ```

#### Get Proposal Details
- **GET** `/api/proposals/:id`

---

## Implementation Phases

### Phase 1: Project Setup & Database (Days 1-2)
- [ ] Initialize frontend (React + Vite)
- [ ] Initialize backend (Node.js + Express)
- [ ] Set up PostgreSQL database
- [ ] Create database schema and tables
- [ ] Set up environment variables
- [ ] Configure Gemini API
- [ ] Configure Gmail API/SMTP

### Phase 2: RFP Creation (Days 3-4)
- [ ] Build RFP creation UI (chat interface)
- [ ] Implement AI service for RFP parsing
- [ ] Create RFP controller and routes
- [ ] Implement RFP storage in database
- [ ] Build RFP list and detail views
- [ ] Test end-to-end RFP creation

### Phase 3: Vendor Management (Day 5)
- [ ] Build vendor management UI
- [ ] Implement vendor CRUD operations
- [ ] Create vendor selection interface
- [ ] Test vendor management features

### Phase 4: Email Sending (Days 6-7)
- [ ] Implement email service with Nodemailer
- [ ] Create email templates
- [ ] Build vendor selection and send UI
- [ ] Implement email logging
- [ ] Test email sending functionality

### Phase 5: Email Receiving & Parsing (Days 8-10)
- [ ] Set up IMAP connection
- [ ] Implement email polling worker
- [ ] Create email-to-RFP matching logic
- [ ] Implement AI proposal parsing
- [ ] Build proposal storage logic
- [ ] Test email receiving and parsing

### Phase 6: Proposal Comparison (Days 11-12)
- [ ] Build proposal comparison UI
- [ ] Implement AI scoring service
- [ ] Create comparison API endpoints
- [ ] Build AI recommendation display
- [ ] Test comparison features

### Phase 7: Polish & Testing (Days 13-14)
- [ ] UI/UX improvements
- [ ] Error handling and validation
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Demo video preparation

---

## Key Design Decisions

### 1. Database Choice: PostgreSQL
- **Reasoning**: Robust relational database with excellent JSONB support for storing semi-structured data (RFP items, parsed proposals)
- **Benefits**: ACID compliance, complex queries, data integrity

### 2. AI Model: Gemini 2.5 Flash Lite
- **Reasoning**: Fast, cost-effective, good for structured data extraction
- **Use Cases**: RFP parsing, proposal extraction, scoring, recommendations

### 3. Email Strategy: Gmail with IMAP Polling
- **Reasoning**: Simple setup, reliable, widely used
- **Polling Interval**: 2 minutes (balance between responsiveness and API limits)

### 4. Frontend: React with Material-UI
- **Reasoning**: Professional components, responsive design, enterprise-grade appearance
- **Benefits**: Faster development, consistent UI, accessibility

### 5. No Authentication (Single User)
- **Reasoning**: Assignment scope specifies single-user application
- **Future**: Easy to add authentication layer later

---

## Assumptions

1. **Email Format**: Vendors will reply to RFP emails (not create new threads)
2. **Proposal Format**: Vendors will send proposals as email body text or PDF/DOCX attachments
3. **Email Matching**: Subject line or email headers will help match responses to RFPs
4. **Single Currency**: All pricing in USD (can be extended)
5. **Gmail Access**: User has Gmail account with IMAP enabled
6. **Network**: Backend has continuous internet access for email polling
7. **Data Volume**: Moderate scale (hundreds of RFPs, not millions)
8. **Attachments**: Focus on PDF and DOCX formats for proposal attachments

---

## Risk Mitigation

### Email Delivery Issues
- **Risk**: Emails might go to spam
- **Mitigation**: Use proper email headers, SPF/DKIM configuration guidance in README

### AI Parsing Errors
- **Risk**: AI might misparse proposals
- **Mitigation**: Store raw email body, allow manual editing of parsed data

### Email Polling Delays
- **Risk**: 2-minute polling might miss time-sensitive responses
- **Mitigation**: Configurable polling interval, email webhook option for future

### Gmail API Limits
- **Risk**: Gmail has rate limits
- **Mitigation**: Implement exponential backoff, queue system for high volume

---

## Future Enhancements (Out of Scope)

1. Multi-user support with authentication
2. Real-time notifications (WebSocket)
3. Advanced analytics and reporting
4. Email webhooks (instead of polling)
5. Support for more file formats
6. Automated RFP templates
7. Vendor rating system
8. Contract management
9. Integration with procurement systems
10. Mobile application

---

## Testing Strategy

### Unit Tests
- AI service functions
- Email parsing logic
- Database queries
- Utility functions

### Integration Tests
- API endpoints
- Email sending/receiving flow
- Database operations

### End-to-End Tests
- Complete RFP creation workflow
- Vendor management
- Email sending
- Proposal comparison

### Manual Testing
- UI/UX flows
- Email integration
- AI accuracy
- Error scenarios

---

## Success Criteria

1. ✅ User can create RFP from natural language
2. ✅ System generates structured RFP data
3. ✅ User can manage vendors (CRUD)
4. ✅ System sends RFP emails to selected vendors
5. ✅ System receives and parses vendor responses automatically
6. ✅ User can view side-by-side proposal comparison
7. ✅ AI provides scoring and recommendations
8. ✅ All data persists in PostgreSQL
9. ✅ Professional, intuitive UI
10. ✅ Complete documentation and demo video
