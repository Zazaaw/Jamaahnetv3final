import { getSupabaseClient } from './supabase/client';

export interface NotificationItem {
  id: string;
  type: 'message' | 'post_approved' | 'post_rejected' | 'follow' | 'pending_user' | 'pending_event' | 'pending_campaign' | 'content_report';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export interface UnreadCounts {
  totalUnread: number;
  unreadMessages: number;
  unreadNotifications: number;
}

/**
 * Get unread message count for current user
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data: userChats } = await supabase
      .from('chats')
      .select('id')
      .contains('participants', [userId]);
    
    if (!userChats || userChats.length === 0) return 0;
    const chatIds = userChats.map(c => c.id);
    
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('chat_id', chatIds)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    return count || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }
}

/**
 * Get unread messages count per chat
 */
export async function getUnreadPerChat(userId: string): Promise<Record<string, number>> {
  try {
    const supabase = getSupabaseClient();
    const { data: userChats } = await supabase
      .from('chats')
      .select('id')
      .contains('participants', [userId]);
    
    if (!userChats || userChats.length === 0) return {};
    const chatIds = userChats.map(c => c.id);
    
    const { data: unreadMessages } = await supabase
      .from('messages')
      .select('chat_id')
      .in('chat_id', chatIds)
      .neq('sender_id', userId)
      .eq('is_read', false);
    
    if (!unreadMessages) return {};
    
    const unreadPerChat: Record<string, number> = {};
    unreadMessages.forEach(msg => {
      unreadPerChat[msg.chat_id] = (unreadPerChat[msg.chat_id] || 0) + 1;
    });
    
    return unreadPerChat;
  } catch (error) {
    console.error('Error getting unread per chat:', error);
    return {};
  }
}

/**
 * Get notifications for current user
 */
export async function getUserNotifications(userId: string, userRole: string = 'user'): Promise<NotificationItem[]> {
  try {
    const supabase = getSupabaseClient();
    const notifications: NotificationItem[] = [];
    
    // Get user's last_notifications_read_at timestamp
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_notifications_read_at')
      .eq('id', userId)
      .single();
    
    const lastReadAt = profile?.last_notifications_read_at ? new Date(profile.last_notifications_read_at) : new Date(0);
    
    // ====================
    // FOR ALL USERS: Follow Notifications
    // ====================
    const { data: follows } = await supabase
      .from('follows')
      .select('*, follower:profiles!follows_follower_id_fkey(id, name, avatar_url)')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (follows) {
      follows.forEach(follow => {
        const createdAt = new Date(follow.created_at);
        notifications.push({
          id: `follow_${follow.id}`,
          type: 'follow',
          title: 'Pengikut Baru',
          message: `${follow.follower?.name || 'Seseorang'} mulai mengikuti Anda`,
          data: { followerId: follow.follower_id, follower: follow.follower },
          read: createdAt <= lastReadAt,
          created_at: follow.created_at
        });
      });
    }
    
    // ====================
    // FOR ALL USERS: Recent Unread Messages
    // ====================
    const { data: userChats } = await supabase
      .from('chats')
      .select('id, name')
      .contains('participants', [userId]);
    
    if (userChats && userChats.length > 0) {
      const chatIds = userChats.map(c => c.id);
      
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, name, avatar_url), chat:chats!messages_chat_id_fkey(id, name)')
        .in('chat_id', chatIds)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (unreadMessages) {
        unreadMessages.forEach(msg => {
          const createdAt = new Date(msg.created_at);
          notifications.push({
            id: `message_${msg.id}`,
            type: 'message',
            title: 'Pesan Baru',
            message: `${msg.sender?.name || 'Seseorang'}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
            data: { messageId: msg.id, chatId: msg.chat_id, senderId: msg.sender_id },
            read: createdAt <= lastReadAt,
            created_at: msg.created_at
          });
        });
      }
    }
    
    // ====================
    // FOR REGULAR USERS: Post Approval/Rejection
    // ====================
    if (userRole !== 'Admin') {
      const { data: userPosts } = await supabase
        .from('timeline_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (userPosts) {
        userPosts.forEach(post => {
          const updatedAt = new Date(post.updated_at || post.created_at);
          
          if (post.is_approved) {
            notifications.push({
              id: `post_approved_${post.id}`,
              type: 'post_approved',
              title: 'Postingan Disetujui',
              message: `Postingan "${post.title || 'Tanpa Judul'}" telah disetujui oleh Admin`,
              data: { postId: post.id },
              read: updatedAt <= lastReadAt,
              created_at: post.updated_at || post.created_at
            });
          } else if (post.status === 'rejected' && post.rejection_reason) {
            notifications.push({
              id: `post_rejected_${post.id}`,
              type: 'post_rejected',
              title: 'Postingan Ditolak',
              message: `Postingan "${post.title || 'Tanpa Judul'}" ditolak: ${post.rejection_reason}`,
              data: { postId: post.id },
              read: updatedAt <= lastReadAt,
              created_at: post.updated_at || post.created_at
            });
          }
        });
      }
    }
    
    // ====================
    // FOR ADMIN: Pending Approvals
    // ====================
    if (userRole === 'Admin') {
      const { count: pendingUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .or('status.eq.Pending,status.eq.pending');
      
      if (pendingUsers && pendingUsers > 0) {
        notifications.push({
          id: 'pending_users',
          type: 'pending_user',
          title: 'Member Baru',
          message: `${pendingUsers} member baru menunggu persetujuan`,
          data: { count: pendingUsers },
          read: false, // Admin notifications always show
          created_at: new Date().toISOString()
        });
      }
      
      const { count: pendingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingEvents && pendingEvents > 0) {
        notifications.push({
          id: 'pending_events',
          type: 'pending_event',
          title: 'Event Baru',
          message: `${pendingEvents} pengajuan event menunggu persetujuan`,
          data: { count: pendingEvents },
          read: false,
          created_at: new Date().toISOString()
        });
      }
      
      const { count: pendingCampaigns } = await supabase
        .from('donation_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingCampaigns && pendingCampaigns > 0) {
        notifications.push({
          id: 'pending_campaigns',
          type: 'pending_campaign',
          title: 'Kampanye Donasi Baru',
          message: `${pendingCampaigns} kampanye donasi menunggu persetujuan`,
          data: { count: pendingCampaigns },
          read: false,
          created_at: new Date().toISOString()
        });
      }

      const { count: pendingPosts } = await supabase
        .from('timeline_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .neq('status', 'rejected');
      
      if (pendingPosts && pendingPosts > 0) {
        notifications.push({
          id: 'pending_posts',
          type: 'pending_event',
          title: 'Postingan Baru',
          message: `${pendingPosts} postingan menunggu persetujuan`,
          data: { count: pendingPosts },
          read: false,
          created_at: new Date().toISOString()
        });
      }
    }
    
    return notifications.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}

/**
 * Subscribe to real-time message updates
 */
export function subscribeToMessages(userId: string, onUpdate: () => void) {
  const supabase = getSupabaseClient();
  const existingChannel = supabase.getChannels().find(ch => ch.topic === 'realtime:messages_realtime');
  if (existingChannel) supabase.removeChannel(existingChannel);

  const channel = supabase.channel('messages_realtime');
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => onUpdate());
  channel.subscribe();
  
  return channel; // ChatListScreen pakai .unsubscribe()
}

/**
 * Subscribe to real-time notification updates
 */
export function subscribeToNotifications(userId: string, onUpdate: () => void) {
  const supabase = getSupabaseClient();
  const existingChannel = supabase.getChannels().find(ch => ch.topic === 'realtime:notifications_realtime');
  if (existingChannel) supabase.removeChannel(existingChannel);

  const channel = supabase.channel('notifications_realtime');
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_posts', filter: `user_id=eq.${userId}` }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'donation_campaigns' }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: `following_id=eq.${userId}` }, onUpdate)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onUpdate);

  channel.subscribe();
  
  // WAJIB PAKAI KURUNG SIKU [ ] biar .forEach() di NotificationDropdown nggak crash!
  return [channel]; 
}

/**
 * Mark all notifications as read by updating last_notifications_read_at timestamp
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .update({ last_notifications_read_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
}