-- Add user_id column to track ownership
ALTER TABLE public.profile_optimizations 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the existing public insert policy
DROP POLICY IF EXISTS "Allow public inserts for lead generation" ON public.profile_optimizations;

-- Create policy: Users can only view their own profile optimizations
CREATE POLICY "Users can view own profile optimizations" 
ON public.profile_optimizations 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Only authenticated users can insert their own data
CREATE POLICY "Authenticated users can insert own data" 
ON public.profile_optimizations 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own records
CREATE POLICY "Users can update own profile optimizations" 
ON public.profile_optimizations 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Users can delete their own records
CREATE POLICY "Users can delete own profile optimizations" 
ON public.profile_optimizations 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);