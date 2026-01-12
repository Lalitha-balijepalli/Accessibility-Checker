-- Create accessibility_reports table
CREATE TABLE public.accessibility_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  issues JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{"critical": 0, "moderate": 0, "minor": 0, "total": 0}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.accessibility_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (reports are public)
CREATE POLICY "Reports are publicly readable" 
ON public.accessibility_reports 
FOR SELECT 
USING (true);

-- Create policy for public insert (anyone can create a report)
CREATE POLICY "Anyone can create reports" 
ON public.accessibility_reports 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster URL lookups
CREATE INDEX idx_accessibility_reports_url ON public.accessibility_reports(url);

-- Create index for faster date sorting
CREATE INDEX idx_accessibility_reports_created_at ON public.accessibility_reports(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_accessibility_reports_updated_at
BEFORE UPDATE ON public.accessibility_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE public.accessibility_reports;