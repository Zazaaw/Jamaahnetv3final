export default async function handler(req, res) {
  // Cegah orang nembak selain pakai metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan wak!' });
  }

  try {
    const { bmcData, kpiData } = req.body;

    // Prompt rahasia buat ngeracik wejangan bisnis
    const systemPrompt = `Kamu adalah Konsultan Bisnis Ahli dari Jamaah.net.
Tugasmu adalah menganalisis Business Model Canvas (BMC) dan KPI dari bisnis berikut, lalu berikan 3 rekomendasi strategi pertumbuhan (growth) yang praktis, aplikatif, dan spesifik.
Gunakan bahasa Indonesia yang profesional namun asik dan memotivasi. Gunakan format markdown yang rapi (bullet points/bold). Jangan terlalu panjang.

Data Bisnis:
Nama: ${bmcData?.business_name || 'Bisnis Baru'} (${bmcData?.sector || 'Umum'})
Revenue Bulanan: Rp ${kpiData?.revenue_monthly || 0}
Customer Baru: ${kpiData?.customer_count || 0}
Target Pasar/Segmen: ${bmcData?.customer_segments?.[0]?.segment_name || 'Umum'}`;

    // Kita pakai process.env biasa karena ini udah jalan di Server Vercel
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Tolong berikan rekomendasi strategi untuk bisnisku berdasarkan data tersebut." }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return res.status(200).json({ result: data.choices[0].message.content });
    } else {
      throw new Error("AI gagal membalas");
    }

  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Gagal memanggil Dukun AI" });
  }
}