-- Simplified appointments table
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
    diagnostic_id UUID NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    appointment_date TIMESTAMPTZ,
    appointment_time TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_diagnostic_id ON appointments(diagnostic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Insert sample data for testing
INSERT INTO appointments (user_id, diagnostic_id, appointment_date, appointment_time) 
VALUES 
    ('user_2mG3AXm6Db2cVBdviw1hgdQhCr3', 
     (SELECT id FROM diagnostics LIMIT 1), 
     NOW() + INTERVAL '3 days', 
     '2:00 PM'),
    ('user_2mG3AXm6Db2cVBdviw1hgdQhCr3', 
     (SELECT id FROM diagnostics LIMIT 1 OFFSET 1), 
     NOW() + INTERVAL '5 days', 
     '11:30 AM');