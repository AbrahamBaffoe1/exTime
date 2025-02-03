-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First create a user if not exists
INSERT INTO users (id, username, email, password, "firstName", "lastName", "createdAt", "updatedAt")
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'kwame',
  'kwame@example.com',
  '$2a$10$xVB/FmKr8RYj.MDzPw8GeuHp5W.h/HC4SJvyXFG.SQBcZvZJnqHiG', -- hashed password for 'password123'
  'Kwame',
  'Baffoe',
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- December 2024 time entries
-- Week 1 (Dec 1-3)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-01 09:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-01 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-02 09:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-02 16:30:00', 'regular', 'Day end', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-03 08:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-03 17:30:00', 'regular', 'Day end', 34200, '{"location": "office"}', NOW(), NOW());

-- Week 2 (Dec 11-13, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-11 09:00:00', 'regular', 'Back from break', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-11 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-12 08:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-12 16:30:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-13 09:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-13 18:00:00', 'regular', 'Day end', 32400, '{"location": "office"}', NOW(), NOW());

-- Week 3 (Dec 21-23, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-21 09:00:00', 'regular', 'Back from break', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-21 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-22 08:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-22 16:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2024-12-23 09:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2024-12-23 17:30:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW());

-- January 2025 time entries
-- Week 1 (Jan 2-4, after holiday break)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-02 09:00:00', 'regular', 'Back from holidays', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-02 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-03 08:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-03 16:30:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-04 09:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-04 18:00:00', 'regular', 'Day end', 32400, '{"location": "office"}', NOW(), NOW());

-- Week 2 (Jan 12-14, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-12 09:00:00', 'regular', 'Back from break', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-12 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-13 08:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-13 16:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-14 09:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-14 17:30:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW());

-- Week 3 (Jan 22-24, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-22 09:00:00', 'regular', 'Back from break', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-22 17:00:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-23 08:30:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-23 16:30:00', 'regular', 'Day end', 28800, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'IN', '2025-01-24 09:00:00', 'regular', 'Morning start', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'OUT', '2025-01-24 18:00:00', 'regular', 'Day end', 32400, '{"location": "office"}', NOW(), NOW());
