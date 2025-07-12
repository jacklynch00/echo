-- Drop existing policies for generated-audio bucket
DROP POLICY IF EXISTS "Users can upload generated audio for their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can view generated audio for their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can update generated audio for their conversations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete generated audio for their conversations" ON storage.objects;

-- Create simplified policies for 'generated-audio' bucket using user ID in folder structure
CREATE POLICY "Users can upload generated audio for their conversations"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view generated audio for their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'generated-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update generated audio for their conversations"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'generated-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete generated audio for their conversations"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generated-audio' AND
  auth.uid()::text = (storage.foldername(name))[1]
);