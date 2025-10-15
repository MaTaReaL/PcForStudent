exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { recommendationText } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('API key is not set');
        }
        
        const systemPrompt = `You are a helpful shopping assistant in Thailand. Based on the provided PC components, use Google Search to find approximate prices in THB from major Thai online retailers (e.g., JIB, Advice). Present the results in a simple Markdown table with columns for 'ส่วนประกอบ', 'สเปค', and 'ราคาประมาณ (บาท)'. If a price isn't found, indicate it with '-'. Prioritize accuracy based on search results.`;
        
        const payload = {
            contents: [{ parts: [{ text: recommendationText }] }],
            tools: [{ "google_search": {} }],
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
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่สามารถค้นหาราคาได้";

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
