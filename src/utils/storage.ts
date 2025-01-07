import { supabase } from '../lib/supabase';

export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  
  const { error: uploadError, data } = await supabase.storage
    .from('trip-updates')
    .upload(fileName, file);

  if (uploadError) throw uploadError;
  return fileName;
}

export function getPublicImageUrl(path: string): string {
  const { data } = supabase.storage
    .from('trip-updates')
    .getPublicUrl(path);
  
  return data.publicUrl;
}