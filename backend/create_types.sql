-- Create enum types for time entries
CREATE TYPE enum_time_entries_action AS ENUM ('CLOCK_IN', 'CLOCK_OUT');
CREATE TYPE enum_time_entries_category AS ENUM ('regular');

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entries (
    id uuid PRIMARY KEY,
    "userId" uuid NOT NULL REFERENCES users(id) ON UPDATE CASCADE,
    action enum_time_entries_action NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    category enum_time_entries_category DEFAULT 'regular',
    notes TEXT,
    duration INTEGER,
    metadata JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);
