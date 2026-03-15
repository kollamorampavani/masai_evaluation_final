-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE Users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance NUMERIC DEFAULT 10000,
  created_at TIMESTAMP DEFAULT now()
);

-- Transactions Table
CREATE TABLE Transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES Users(id),
  receiver_id UUID REFERENCES Users(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Credit', 'Debit')),
  created_at TIMESTAMP DEFAULT now()
);
