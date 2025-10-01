-- Create groups table
CREATE TABLE groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    level TEXT NOT NULL,
    max_students INT DEFAULT 20 CHECK (max_students > 0),
    session_price DECIMAL(10,2) NOT NULL CHECK (session_price > 0),
    schedule_days TEXT[] NOT NULL,
    schedule_time TIME NOT NULL,
    duration_minutes INT DEFAULT 60 CHECK (duration_minutes > 0),
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_subject ON groups(subject);
CREATE INDEX idx_groups_level ON groups(level);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert groups" ON groups
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own groups" ON groups
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own groups" ON groups
    FOR DELETE USING (created_by = auth.uid());