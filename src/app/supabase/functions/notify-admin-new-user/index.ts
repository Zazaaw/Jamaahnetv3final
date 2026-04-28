import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { JWT } from 'https://esm.sh/google-auth-library@9.0.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log("Memeriksa pendaftar baru dari Webhook...");

  try {
    const payload = await req.json();
    const newProfile = payload.record;

    // 1. FILTER: Cuma proses kalau ini INSERT data baru dan statusnya 'Pending'
    if (payload.type !== 'INSERT' || (newProfile.status !== 'Pending' && newProfile.status !== 'pending')) {
      console.log("Bukan user baru atau status bukan pending. Skip!");
      return new Response(JSON.stringify({ ok: true, msg: "Ignored" }), { status: 200 });
    }

    // 2. Siapkan Koneksi Supabase & Secret Firebase
    const rawAccount = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!rawAccount) throw new Error("Secret FIREBASE_SERVICE_ACCOUNT nggak ketemu!");
    
    const FIREBASE_SERVICE_ACCOUNT = JSON.parse(rawAccount);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Cari Semua Admin yang Punya Push Token
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('role', 'Admin')
      .not('push_token', 'is', null);

    if (error || !admins || admins.length === 0) {
      console.log("Nggak ada Admin yang punya push_token buat dikabarin.");
      return new Response(JSON.stringify({ ok: true, msg: "No admin tokens" }), { status: 200 });
    }

    // 4. Generate Token FCM v1 pakai JWT (Sama kyk fungsi chat-mu)
    const client = new JWT({
      email: FIREBASE_SERVICE_ACCOUNT.client_email,
      key: FIREBASE_SERVICE_ACCOUNT.private_key.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
        
    const { token: accessToken } = await client.getAccessToken();
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${FIREBASE_SERVICE_ACCOUNT.project_id}/messages:send`;

    // 5. Tembak Notif ke Setiap Admin
    const sendPromises = admins.map(admin => {
      return fetch(fcmUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: admin.push_token,
            notification: { 
              title: "🚨 Pendaftar Jamaah Baru!", 
              body: `Ada member baru daftar a/n ${newProfile.name || newProfile.full_name || newProfile.email}. Segera approve di Dashboard!` 
            },
            data: { 
              type: 'admin_alert', 
              userId: newProfile.id 
            }
          }
        }),
      });
    });

    // Tunggu semua tembakan selesai
    await Promise.all(sendPromises);

    console.log(`Berhasil ngirim notif ke ${admins.length} Admin!`);
    return new Response(JSON.stringify({ success: true, notifiedCount: admins.length }), { status: 200 });

  } catch (error: any) {
    console.error("ERROR NYA INI WAK:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});