const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userQuery } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPrompt = `คุณคือผู้เชี่ยวชาญการจัดสเปคคอมพิวเตอร์ในไทยที่รู้ข้อมูลล่าสุด (ต.ค. 2025) ภารกิจของคุณคือสร้างคำตอบที่สมบูรณ์แบบในครั้งเดียว
**กฎสำคัญ:**
1.  **วิเคราะห์คำขอ:** อ่านคำขอของผู้ใช้ (คณะ, โปรแกรม, งบ) ให้ละเอียด
2.  **จัดสเปค:**
    * แนะนำสเปค PC ที่เหมาะสมที่สุด โดยอ้างอิงชิ้นส่วนที่มีอยู่จริงเท่านั้น (เช่น CPU Intel Core Ultra, GPU NVIDIA RTX 50 series)
    * จัดรูปแบบแต่ละชิ้นส่วนให้สวยงาม:
        * ขึ้นต้นด้วย \`###\` ตามด้วยเลขและชื่อ เช่น \`### 1. CPU: Intel Core Ultra 5\`
        * บรรทัดถัดไป อธิบายเหตุผล **แบบสั้นๆ กระชับที่สุด (ไม่เกิน 1-2 ประโยค)** ขึ้นต้นด้วย \`**เหตุผล:**\`
    * มีส่วนสรุปภาพรวมโดยใช้หัวข้อ \`## สรุปภาพรวม\`
3.  **ค้นหาและสรุปราคา (สำคัญมาก):**
    * หลังจากจัดสเปคเสร็จ **ให้ใช้ Google Search ทันที** เพื่อค้นหาราคาโดยประมาณของชิ้นส่วน **ทุกชิ้น** จากร้านค้าในไทย (เช่น JIB, Advice)
    * สร้างตารางราคาในรูปแบบ Markdown โดยใช้หัวข้อ \`## ตารางราคาโดยประมาณ\`
    * ตารางต้องมีคอลัมน์ 'ส่วนประกอบ', 'สเปค', และ 'ราคาประมาณ (บาท)'
    * **ต้องมีแถวสุดท้ายสำหรับ 'ราคารวมโดยประมาณ'** โดยคำนวณจากผลรวมของราคาที่หาได้
4.  **ห้ามมั่ว:** หากหาราคาไม่ได้จริงๆ ให้ใส่ '-' แต่ต้องพยายามหาให้ได้มากที่สุด
5.  **ภาษา:** ไทย, สุภาพ, เข้าใจง่าย`;
        
        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API error:', errorBody);
            return { statusCode: response.status, body: JSON.stringify({ error: `Gemini API error: ${response.statusText}`, details: errorBody }) };
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'AI ไม่สามารถให้คำแนะนำได้ในขณะนี้';

        return {
            statusCode: 200,
            body: JSON.stringify({ text })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Could not process your request', details: error.message })
        };
    }
};

