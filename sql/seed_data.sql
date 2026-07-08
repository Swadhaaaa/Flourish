-- Seed data for Flourish local SQLite database

-- Insert mock employee
INSERT OR IGNORE INTO employees (id, name, role, email, weekly_hours_limit, current_workload, user_id)
VALUES (1, 'Ayushi Ranjan', 'Product Engineer', 'ayushi@example.com', 40, 15.5, '1');

-- Insert mock pending and scheduled tasks
INSERT OR IGNORE INTO tasks (id, title, description, priority, estimated_hours, deadline, assigned_to, status, user_id)
VALUES 
(1, 'Refactor Router Contexts', 'Modularize routes inside App.tsx for better route protection.', 'High', 4.5, '2026-07-15', 1, 'Scheduled', '1'),
(2, 'Tone Shield API integration', 'Hook Tone Shield up to Groq sentiment analyser endpoint.', 'Medium', 6.0, '2026-07-20', 1, 'Pending', '1'),
(3, 'Review Invisible Labor Chart', 'Validate recharts responsiveness on mobile viewports.', 'Low', 2.0, '2026-07-25', NULL, 'Pending', '1');

-- Insert mock schedules
INSERT OR IGNORE INTO schedules (id, employee_id, task_id, scheduled_day, start_time, end_time, user_id)
VALUES (1, 1, 1, 'Monday', '09:00', '13:30', '1');

-- Insert mock conversation sessions
INSERT OR IGNORE INTO conversation_sessions (id, title, user_id)
VALUES (1, 'Weekly Schedule Optimization', '1');

-- Insert mock conversation logs
INSERT OR IGNORE INTO conversation_logs (id, role, content, session_id, sentiment)
VALUES 
(1, 'user', 'Hi, can you help me schedule my pending refactoring task?', 1, 'neutral'),
(2, 'assistant', 'Sure! I have scheduled "Refactor Router Contexts" on Monday from 09:00 to 13:30.', 1, 'positive');
