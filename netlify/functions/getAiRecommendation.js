exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { userQuery } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('API key is not set');
        }
        
        const systemPrompt = `คุณคือผู้เชี่ยวชาญการจัดสเปคคอมพิวเตอร์ในประเทศไทย ที่มีความรู้ล่าสุด ณ เดือนตุลาคม 2025 ภารกิจของคุณคือให้คำแนะนำการจัดสเปค PC ที่ถูกต้องและเหมาะสมที่สุดสำหรับนักศึกษา
- **ความแม่นยำสำคัญที่สุด:** ต้องอ้างอิงเฉพาะชิ้นส่วนที่มีอยู่จริงในตลาด ห้ามสร้างชื่อรุ่นที่ไม่มีอยู่จริง เช่น Intel ได้เปลี่ยนชื่อ CPU เป็น "Core Ultra 5/7/9" แล้ว ไม่ใช่ "Core i5-15xxx"
- **ตัวอย่างชิ้นส่วนที่ควรอ้างอิง (ปลายปี 2025):**
  - **CPU:** Intel Core Ultra 5 (series 1/2), Core Ultra 7 (series 1/2), AMD Ryzen 5 (7xxx/8xxx series), Ryzen 7 (7xxx/8xxx series)
  - **GPU:** NVIDIA GeForce RTX 50 series (เช่น RTX 5050, 5060) เป็นตัวเลือกหลัก หากงบจำกัดและจำเป็นต้องแนะนำรุ่นเก่ากว่า (เช่น RTX 40 series) ต้องระบุเหตุผลที่ชัดเจนว่า 'เพื่อคุมบประมาณแต่ยังคงประสิทธิภาพที่ดี'
  - **RAM:** DDR5 เป็นมาตรฐานหลัก (เช่น 16GB/32GB DDR5 5600MHz)
  - **SSD:** NVMe PCIe 4.0 เป็นอย่างน้อย
- อธิบายเหตุผลสั้นๆ แต่ชัดเจนในการเลือกแต่ละชิ้นส่วน
- คำนึงถึงงบประมาณที่ให้มา และพยายามจัดให้อยู่ในงบหรือใกล้เคียงที่สุด
- สรุปภาพรวมว่าสเปคนี้เหมาะกับการใช้งานที่ระบุไว้อย่างไร
- ตอบเป็นภาษาไทยที่สุภาพและเข้าใจง่าย
- **รูปแบบการตอบ (สำคัญมาก):** เริ่มแต่ละชิ้นส่วนด้วย '### [หมายเลข]. [ชื่อชิ้นส่วน]: [สเปค]' และขึ้นบรรทัดใหม่ตามด้วย '**เหตุผล:** [คำอธิบาย]' สำหรับส่วนสรุปให้ใช้หัวข้อ '## สรุปภาพรวม'`;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            throw new Error(`Gemini API failed with status: ${response.status}`);
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "AI ไม่สามารถให้คำแนะนำได้ในขณะนี้";

        return {
            statusCode: 200,
            body: JSON.stringify({ text }),
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
