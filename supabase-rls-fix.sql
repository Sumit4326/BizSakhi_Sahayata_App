-- Temporary RLS policy fix for testing
-- Run this in your Supabase SQL editor

-- Option 1: Temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE income DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- Option 2: Create more permissive policies for testing
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own chat_history" ON chat_history;
DROP POLICY IF EXISTS "Users can view their own chat_history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert their own income" ON income;
DROP POLICY IF EXISTS "Users can view their own income" ON income;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can view their own inventory" ON inventory;

-- Create new policies that allow anon access for testing
-- Chat History Policies
CREATE POLICY "Allow anon insert chat_history" ON chat_history
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select chat_history" ON chat_history
    FOR SELECT USING (true);

CREATE POLICY "Allow anon delete chat_history" ON chat_history
    FOR DELETE USING (true);

-- Income Policies
CREATE POLICY "Allow anon insert income" ON income
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select income" ON income
    FOR SELECT USING (true);

CREATE POLICY "Allow anon delete income" ON income
    FOR DELETE USING (true);

-- Expenses Policies
CREATE POLICY "Allow anon insert expenses" ON expenses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select expenses" ON expenses
    FOR SELECT USING (true);

CREATE POLICY "Allow anon delete expenses" ON expenses
    FOR DELETE USING (true);

-- Inventory Policies
CREATE POLICY "Allow anon insert inventory" ON inventory
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select inventory" ON inventory
    FOR SELECT USING (true);

CREATE POLICY "Allow anon delete inventory" ON inventory
    FOR DELETE USING (true);

-- Profiles Policies (if needed)
CREATE POLICY "Allow anon insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select profiles" ON profiles
    FOR SELECT USING (true);

-- Note: These policies are for testing only!
-- In production, you should use proper user-based policies like:
-- CREATE POLICY "Users can insert their own data" ON table_name
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can view their own data" ON table_name
--     FOR SELECT USING (auth.uid() = user_id);
