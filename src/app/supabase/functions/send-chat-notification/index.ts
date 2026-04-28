import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { JWT } from 'https://esm.sh/google-auth-library@9.0.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log("Ada paket masuk dari Webhook wak!");

  try {
    const payload = await req.json();
    const message = payload.record;

    const rawAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!rawAccount) throw new Error("Secret FIREBASE_SERVICE_ACCOUNT nggak ketemu wak!");
    
    const FIREBASE_SERVICE_ACCOUNT = JSON.parse(rawAccount);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: recipient } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', message.recipient_id)
      .single();

    if (!recipient?.push_token) {
      console.log("Penerima nggak punya token, skip dulu!");
      return new Response(JSON.stringify({ ok: true, msg: "No token" }));
    }

    const client = new JWT({
      email: FIREBASE_SERVICE_ACCOUNT.client_email,
      key: FIREBASE_SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
        
    const { token: accessToken } = await client.getAccessToken();

    const fcmResponse = await fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_SERVICE_ACCOUNT.project_id}/messages:send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: recipient.push_token,
          notification: { 
            title: "Pesan Baru", 
            // FIX: Hapus ekstra kurung & tambah fallback kalau kirim gambar doang
            body: (message.text || 'Mengirim lampiran/gambar').substring(0, 100) 
          },
          data: { chatId: message.chat_id || '', type: 'message' }
        }
      }),
    });

    const result = await fcmResponse.json();
    console.log("Hasil Tembakan FCM:", result);
    return new Response(JSON.stringify(result), { status: 200 });

  } catch (error: any) {
    console.error("ERROR NYA INI WAK:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});