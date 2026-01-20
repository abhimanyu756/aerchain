-- AI-Powered RFP Management System - Database Schema
-- PostgreSQL Database Schema

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS rfp_vendors CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS rfps CASCADE;

-- Create RFPs table
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
  additional_requirements TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Vendors table
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

-- Create RFP-Vendors junction table (many-to-many relationship)
CREATE TABLE rfp_vendors (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
  sent_at TIMESTAMP,
  email_message_id VARCHAR(255), -- Gmail message ID for tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, responded
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rfp_id, vendor_id)
);

-- Create Proposals table
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
  completeness_score DECIMAL(5, 2), -- How complete is the response (0-100)
  received_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Email Logs table
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  rfp_id INTEGER REFERENCES rfps(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
  direction VARCHAR(10) NOT NULL, -- 'outbound' or 'inbound'
  subject VARCHAR(500),
  body TEXT,
  message_id VARCHAR(255),
  status VARCHAR(50) NOT NULL, -- sent, received, failed
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_rfps_status ON rfps(status);
CREATE INDEX idx_rfps_created_at ON rfps(created_at DESC);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_rfp_vendors_rfp_id ON rfp_vendors(rfp_id);
CREATE INDEX idx_rfp_vendors_vendor_id ON rfp_vendors(vendor_id);
CREATE INDEX idx_proposals_rfp_id ON proposals(rfp_id);
CREATE INDEX idx_proposals_vendor_id ON proposals(vendor_id);
CREATE INDEX idx_email_logs_rfp_id ON email_logs(rfp_id);
CREATE INDEX idx_email_logs_direction ON email_logs(direction);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_rfps_updated_at BEFORE UPDATE ON rfps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample vendors for testing
INSERT INTO vendors (name, email, company_name, phone, specialization, notes) VALUES
('John Smith', 'john.smith@techsupplies.com', 'Tech Supplies Inc', '+1-555-0101', 'IT Equipment & Electronics', 'Reliable vendor for laptops and monitors'),
('Sarah Johnson', 'sarah.j@officeworld.com', 'Office World Ltd', '+1-555-0102', 'Office Equipment & Furniture', 'Good pricing on bulk orders'),
('Mike Chen', 'mike.chen@globaltech.com', 'Global Tech Solutions', '+1-555-0103', 'Technology & Hardware', 'Fast delivery, premium products');

-- Success message
SELECT 'Database schema created successfully!' as message;
