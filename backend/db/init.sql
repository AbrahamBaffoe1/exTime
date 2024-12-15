-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS timeclock_db;

-- Connect to the database
\c timeclock_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "lastLogin" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create enum types for time entries
DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('IN', 'OUT', 'BREAK_START', 'BREAK_END');
    CREATE TYPE category_type AS ENUM ('regular', 'overtime', 'remote', 'training');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create time entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    action action_type NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category category_type DEFAULT 'regular',
    notes TEXT,
    duration INTEGER, -- Duration in seconds
    metadata JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create settings table for user preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    "timeFormat" VARCHAR(2) DEFAULT '24',
    "breakReminders" BOOLEAN DEFAULT true,
    "overtimeAlerts" BOOLEAN DEFAULT true,
    "breakReminderInterval" INTEGER DEFAULT 60, -- minutes
    "overtimeThreshold" INTEGER DEFAULT 8, -- hours
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries("userId");
CREATE INDEX IF NOT EXISTS idx_time_entries_timestamp ON time_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_time_entries_action ON time_entries(action);
CREATE INDEX IF NOT EXISTS idx_time_entries_category ON time_entries(category);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
