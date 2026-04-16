// Supabase Edge Function for sending chat notifications
// Triggered when a new message is inserted into the 'messages' table

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FIREBASE_SERVER_KEY = Deno.env.get('FIREBASE_SERVER_KEY')!;

interface MessageRecord {
  id: string;
  chat_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: MessageRecord;
  schema: string;
  old_record: null | MessageRecord;
}

serve(async (req) => {
  try {
    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    
    console.log('Received webhook payload:', payload);

    // Only process INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(
        JSON.stringify({ message: 'Not an INSERT event, skipping' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = payload.record;
    const { sender_id, recipient_id, content, chat_id } = message;

    // Initialize Supabase client with service role for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch sender's profile (for name)
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', sender_id)
      .single();

    if (senderError) {
      console.error('Error fetching sender profile:', senderError);
      throw new Error('Failed to fetch sender profile');
    }

    const senderName = senderProfile?.name || 'Seseorang';

    // Fetch recipient's profile (for push token)
    const { data: recipientProfile, error: recipientError } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', recipient_id)
      .single();

    if (recipientError) {
      console.error('Error fetching recipient profile:', recipientError);
      throw new Error('Failed to fetch recipient profile');
    }

    const pushToken = recipientProfile?.push_token;

    // If recipient doesn't have a push token, skip notification
    if (!pushToken) {
      console.log(`Recipient ${recipient_id} has no push token, skipping notification`);
      return new Response(
        JSON.stringify({ message: 'Recipient has no push token' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare message preview (first 100 characters)
    const messagePreview = content.length > 100 
      ? content.substring(0, 100) + '...' 
      : content;

    // Send FCM notification using Firebase Cloud Messaging HTTP v1 API
    const fcmPayload = {
      message: {
        token: pushToken,
        notification: {
          title: `Pesan Baru dari ${senderName}`,
          body: messagePreview,
        },
        data: {
          chatId: chat_id,
          senderId: sender_id,
          type: 'message',
          messageId: message.id,
        },
        webpush: {
          fcm_options: {
            link: `https://jamaah.net/chat/${chat_id}`,
          },
        },
      },
    };

    // Get Firebase access token for FCM v1 API
    // Note: For production, use service account authentication
    // For now, we'll use the legacy FCM API
    const legacyFCMPayload = {
      to: pushToken,
      notification: {
        title: `Pesan Baru dari ${senderName}`,
        body: messagePreview,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        click_action: `https://jamaah.net/chat/${chat_id}`,
      },
      data: {
        chatId: chat_id,
        senderId: sender_id,
        type: 'message',
        messageId: message.id,
      },
    };

    // Send notification using FCM Legacy API
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify(legacyFCMPayload),
    });

    const fcmResult = await fcmResponse.json();

    if (!fcmResponse.ok) {
      console.error('FCM Error:', fcmResult);
      throw new Error(`FCM request failed: ${JSON.stringify(fcmResult)}`);
    }

    console.log('Notification sent successfully:', fcmResult);

    // Optional: Log notification to database for tracking
    // await supabase.from('notification_logs').insert({
    //   user_id: recipient_id,
    //   type: 'message',
    //   title: `Pesan Baru dari ${senderName}`,
    //   body: messagePreview,
    //   data: { chatId: chat_id, senderId: sender_id },
    //   sent_at: new Date().toISOString(),
    //   status: 'sent'
    // });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        fcmResult 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-chat-notification function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
