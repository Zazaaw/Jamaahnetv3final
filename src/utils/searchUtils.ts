import { getSupabaseClient } from './supabase/client';

/**
 * Search utility functions for keyword-based filtering across the app
 */

export interface SearchResult<T> {
  data: T[];
  error: any;
}

/**
 * Search timeline posts by title and content
 */
export async function searchTimelinePosts(
  keyword: string,
  userId?: string
): Promise<SearchResult<any>> {
  const supabase = getSupabaseClient();
  
  try {
    let query = supabase
      .from('timeline_posts')
      .select('*, profiles(name, avatar_url)')
      .order('created_at', { ascending: false });

    // Apply approval filter
    if (userId) {
      query = query.or(`is_approved.eq.true,and(is_approved.eq.false,user_id.eq.${userId})`);
    } else {
      query = query.eq('is_approved', true);
    }

    // Apply keyword search
    if (keyword.trim()) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Error searching timeline posts:', error);
    return { data: [], error };
  }
}

/**
 * Search user profiles by name or username
 */
export async function searchProfiles(keyword: string): Promise<SearchResult<any>> {
  const supabase = getSupabaseClient();
  
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    // Apply keyword search
    if (keyword.trim()) {
      query = query.or(`name.ilike.%${keyword}%,username.ilike.%${keyword}%,email.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Error searching profiles:', error);
    return { data: [], error };
  }
}

/**
 * Search products by name, description, and category
 */
export async function searchProducts(keyword: string): Promise<SearchResult<any>> {
  const supabase = getSupabaseClient();
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    // Apply keyword search
    if (keyword.trim()) {
      query = query.or(
        `name.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%,subcategory.ilike.%${keyword}%`
      );
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Error searching products:', error);
    return { data: [], error };
  }
}

/**
 * Search a specific user's posts
 */
export async function searchUserPosts(
  userId: string,
  keyword: string
): Promise<SearchResult<any>> {
  const supabase = getSupabaseClient();
  
  try {
    let query = supabase
      .from('timeline_posts')
      .select('*, profiles(id, name, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply keyword search
    if (keyword.trim()) {
      query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Error searching user posts:', error);
    return { data: [], error };
  }
}

/**
 * Search a specific user's products
 */
export async function searchUserProducts(
  userId: string,
  keyword: string
): Promise<SearchResult<any>> {
  const supabase = getSupabaseClient();
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply keyword search
    if (keyword.trim()) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    return { data: data || [], error };
  } catch (error) {
    console.error('Error searching user products:', error);
    return { data: [], error };
  }
}

/**
 * Debounce utility for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
