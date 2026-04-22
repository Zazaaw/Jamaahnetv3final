import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase/client';
import { TwitterStylePost } from './HomeScreen';
// Import TwitterStylePost kau di sini

export default function TimelineArchive({ category, session, onNavigate }: any) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchive = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('timeline_posts')
        .select('*, profiles(name, avatar_url)')
        .eq('category', category)
        .eq('is_approved', true) // Hanya yang sudah diapprove admin
        .order('created_at', { ascending: false }); // Tanpa limit, biar semua muncul

      if (data) setPosts(data);
      setLoading(false);
    };
    fetchArchive();
  }, [category]);

  if (loading) return <p className="text-center p-10">Memuat kabar...</p>;

  return (
    <div className="space-y-4">
      {posts.map((post: any) => (
        <TwitterStylePost key={post.id} post={post} session={session} onNavigate={onNavigate} />
      ))}
    </div>
  );
}