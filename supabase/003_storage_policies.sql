-- Storage policies for RLS on buckets
-- This allows users to upload and access their own files

-- Create storage buckets if they don't exist (you may have already created these in the UI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-audio', 'generated-audio', true);

-- Policies for 'uploads' bucket (user uploaded files like voice samples)
CREATE POLICY "Users can upload their own files to uploads bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own files in uploads bucket"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own files in uploads bucket"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own files in uploads bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policies for 'generated-audio' bucket (AI-generated voice responses)
-- Simplified approach: use user ID in folder structure for easier RLS
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

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;