import { supabase } from './supabase';

export async function uploadFile(
  bucket: string,
  file: File,
  userId: string
): Promise<{ path: string; publicUrl: string } | null> {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Upload error:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { path: filePath, publicUrl: urlData.publicUrl };
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return !error;
}
