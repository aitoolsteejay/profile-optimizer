-- Drop existing auth-based policies
DROP POLICY IF EXISTS "Users can view own profile optimizations" ON public.profile_optimizations;
DROP POLICY IF EXISTS "Authenticated users can insert own data" ON public.profile_optimizations;
DROP POLICY IF EXISTS "Users can update own profile optimizations" ON public.profile_optimizations;
DROP POLICY IF EXISTS "Users can delete own profile optimizations" ON public.profile_optimizations;

-- Create policy: Allow anonymous inserts (for lead gen tool to work)
CREATE POLICY "Allow anonymous inserts" 
ON public.profile_optimizations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- No SELECT policy = no public reads (only service role can read)
-- No UPDATE policy = no public updates
-- No DELETE policy = no public deletes