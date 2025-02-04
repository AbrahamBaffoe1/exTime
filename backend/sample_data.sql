-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First create a user if not exists
INSERT INTO users (id, username, email, password, "firstName", "lastName", "createdAt", "updatedAt")
VALUES (
  'ed6b490b-c22b-4d8e-b35c-104826f0a546',
  'kwame',
  'kwame@example.com',
  '$2a$10$xVB/FmKr8RYj.MDzPw8GeuHp5W.h/HC4SJvyXFG.SQBcZvZJnqHiG', -- hashed password for 'password123'
  'Kwame',
  'Baffoe',
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Current Week (February 2025)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-02-02 09:00:00', 'regular', 'Morning coding session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-02-02 16:00:00', 'regular', 'Completed feature implementation', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-02-03 09:30:00', 'regular', 'Quick bug fix session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-02-03 10:19:00', 'regular', 'Fixed critical bug', 2940, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-02-04 08:00:00', 'regular', 'Code review session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-02-04 12:30:00', 'regular', 'Completed code reviews', 16200, '{"location": "office"}', NOW(), NOW());

-- December 2024 time entries
-- Week 1 (Dec 1-3)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-01 09:00:00', 'regular', 'Morning coding session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-01 16:00:00', 'regular', 'Completed feature implementation', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-02 09:30:00', 'regular', 'Quick bug fix session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-02 10:19:00', 'regular', 'Fixed critical bug', 2940, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-03 08:00:00', 'regular', 'Code review session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-03 12:30:00', 'regular', 'Completed code reviews', 16200, '{"location": "office"}', NOW(), NOW());

-- Week 2 (Dec 11-13, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-11 09:00:00', 'regular', 'New feature development', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-11 15:30:00', 'regular', 'Feature prototype complete', 23400, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-12 08:30:00', 'regular', 'Quick testing session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-12 09:30:00', 'regular', 'Unit tests written', 3600, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-13 09:00:00', 'regular', 'Documentation work', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-13 10:00:00', 'regular', 'Updated documentation', 3600, '{"location": "office"}', NOW(), NOW());

-- Week 3 (Dec 21-23, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-21 09:00:00', 'regular', 'API development', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-21 16:00:00', 'regular', 'API endpoints complete', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-22 08:00:00', 'regular', 'Frontend updates', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-22 09:00:00', 'regular', 'UI improvements done', 3600, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2024-12-23 09:30:00', 'regular', 'Quick bug fixes', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2024-12-23 10:19:00', 'regular', 'Fixed reported issues', 2940, '{"location": "office"}', NOW(), NOW());

-- January 2025 time entries
-- Week 1 (Jan 2-4, after holiday break)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-02 09:00:00', 'regular', 'New year planning', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-02 16:00:00', 'regular', 'Sprint planning complete', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-03 08:30:00', 'regular', 'Feature development', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-03 15:00:00', 'regular', 'Core features implemented', 23400, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-04 09:00:00', 'regular', 'Quick testing', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-04 09:49:00', 'regular', 'Integration tests complete', 2940, '{"location": "office"}', NOW(), NOW());

-- Week 2 (Jan 12-14, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-12 09:00:00', 'regular', 'Code optimization', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-12 15:30:00', 'regular', 'Performance improvements done', 23400, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-13 08:00:00', 'regular', 'Quick documentation update', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-13 08:49:00', 'regular', 'API docs updated', 2940, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-14 09:30:00', 'regular', 'Bug fixing session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-14 16:30:00', 'regular', 'Critical fixes deployed', 25200, '{"location": "office"}', NOW(), NOW());

-- Week 3 (Jan 22-24, after a week off)
INSERT INTO time_entries (id, "userId", action, timestamp, category, notes, duration, metadata, "createdAt", "updatedAt")
VALUES
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-22 09:00:00', 'regular', 'Feature development', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-22 16:00:00', 'regular', 'New features complete', 25200, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-23 08:30:00', 'regular', 'Quick code review', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-23 09:19:00', 'regular', 'Reviews completed', 2940, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'IN', '2025-01-24 09:00:00', 'regular', 'Testing session', NULL, '{"location": "office"}', NOW(), NOW()),
  (uuid_generate_v4(), 'ed6b490b-c22b-4d8e-b35c-104826f0a546', 'OUT', '2025-01-24 15:00:00', 'regular', 'QA testing complete', 21600, '{"location": "office"}', NOW(), NOW());
