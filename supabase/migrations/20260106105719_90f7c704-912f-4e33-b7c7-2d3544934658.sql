-- Add new columns for LinkedIn URL scraping and quoted feedback
ALTER TABLE public.profile_optimizations
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS scraped_headline TEXT,
ADD COLUMN IF NOT EXISTS scraped_about TEXT,
ADD COLUMN IF NOT EXISTS data_source TEXT CHECK (data_source IN ('scraper', 'manual_fallback')),
ADD COLUMN IF NOT EXISTS quoted_issues JSONB DEFAULT '[]'::jsonb;

-- Add index for data source tracking
CREATE INDEX IF NOT EXISTS idx_profile_optimizations_data_source ON public.profile_optimizations(data_source);

-- Add comment for clarity
COMMENT ON COLUMN public.profile_optimizations.quoted_issues IS 'Array of objects with issue_type, quoted_text, and explanation';