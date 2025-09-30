-- Insert sample students
INSERT INTO students (name_student, phone_number, academic_year, paid_amount, remaining_amount, current_sessions, deducted_sessions)
VALUES 
  ('Ahmed Hassan', '+20-1234567890', '2024-2025', 5000.00, 1000.00, 24, 4),
  ('Fatima Ali', '+20-1234567891', '2024-2025', 4500.00, 500.00, 20, 2),
  ('Mohamed Ibrahim', '+20-1234567892', '2023-2024', 6000.00, 0.00, 30, 8),
  ('Sara Mahmoud', '+20-1234567893', '2024-2025', 3500.00, 1500.00, 16, 1),
  ('Omar Khalil', '+20-1234567894', '2024-2025', 5500.00, 500.00, 28, 5);

-- Insert sample subscriptions for the students
INSERT INTO subscriptions (student_id, total_sessions, remaining_sessions, start_date, end_date, status)
SELECT 
  id,
  CASE 
    WHEN name_student = 'Ahmed Hassan' THEN 24
    WHEN name_student = 'Fatima Ali' THEN 20
    WHEN name_student = 'Mohamed Ibrahim' THEN 30
    WHEN name_student = 'Sara Mahmoud' THEN 16
    WHEN name_student = 'Omar Khalil' THEN 28
  END as total_sessions,
  CASE 
    WHEN name_student = 'Ahmed Hassan' THEN 20
    WHEN name_student = 'Fatima Ali' THEN 18
    WHEN name_student = 'Mohamed Ibrahim' THEN 22
    WHEN name_student = 'Sara Mahmoud' THEN 15
    WHEN name_student = 'Omar Khalil' THEN 23
  END as remaining_sessions,
  CASE 
    WHEN name_student = 'Ahmed Hassan' THEN '2024-09-01'::DATE
    WHEN name_student = 'Fatima Ali' THEN '2024-09-15'::DATE
    WHEN name_student = 'Mohamed Ibrahim' THEN '2023-09-01'::DATE
    WHEN name_student = 'Sara Mahmoud' THEN '2024-10-01'::DATE
    WHEN name_student = 'Omar Khalil' THEN '2024-08-20'::DATE
  END as start_date,
  CASE 
    WHEN name_student = 'Ahmed Hassan' THEN '2025-06-30'::DATE
    WHEN name_student = 'Fatima Ali' THEN '2025-06-30'::DATE
    WHEN name_student = 'Mohamed Ibrahim' THEN '2024-06-30'::DATE
    WHEN name_student = 'Sara Mahmoud' THEN '2025-06-30'::DATE
    WHEN name_student = 'Omar Khalil' THEN '2025-06-30'::DATE
  END as end_date,
  'active'::subscription_status as status
FROM students
WHERE name_student IN ('Ahmed Hassan', 'Fatima Ali', 'Mohamed Ibrahim', 'Sara Mahmoud', 'Omar Khalil');
