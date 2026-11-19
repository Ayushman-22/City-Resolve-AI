import { supabase } from './supabase';

export async function uploadIssueImage(file: File, userId: string): Promise<string | null> {
  if (!supabase) return null;
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('issue-images')
    .upload(path, file, { contentType: 'image/jpeg' });
  if (error) {
    console.error('Image upload failed:', error.message);
    return null;
  }
  return supabase.storage.from('issue-images').getPublicUrl(path).data.publicUrl;
}