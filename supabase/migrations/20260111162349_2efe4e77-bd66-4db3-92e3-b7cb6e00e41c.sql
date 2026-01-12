-- Add user_id column to accessibility_reports
ALTER TABLE public.accessibility_reports 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Reports are publicly readable" ON public.accessibility_reports;
DROP POLICY IF EXISTS "Anyone can create reports" ON public.accessibility_reports;

-- Create secure RLS policies (user-scoped)
CREATE POLICY "Users can view their own reports" 
ON public.accessibility_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.accessibility_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.accessibility_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.accessibility_reports 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_accessibility_reports_user_id 
ON public.accessibility_reports(user_id);