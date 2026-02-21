const express = require('express');
const multer = require('multer');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;
const upload = multer();

// Load token from environment variable
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    console.warn('❌ تحذير: لم يتم العثور على HF_TOKEN في ملف .env');
}

// ملفات الموقع
app.use(express.static(__dirname));

// نقطة تحليل الصورة
app.post('/classify-plant', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم رفع صورة' });
    }

    console.log('⏳ جاري تحليل الصورة عبر Hugging Face...');

    const options = {
        hostname: 'router.huggingface.co',
        path: '/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + HF_TOKEN,
            'Content-Type': 'application/octet-stream',
            'Content-Length': req.file.buffer.length
        }
    };

    const apiReq = https.request(options, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (apiRes.statusCode === 200) {
                    console.log('✅ تم التحليل بنجاح!');
                    res.json(json);
                } else {
                    console.error('❌ خطأ من API:', json);
                    res.status(apiRes.statusCode).json(json);
                }
            } catch (e) {
                console.error('❌ رد غير متوقع:', data.substring(0, 300));
                res.status(500).json({ error: 'رد غير صالح من HuggingFace' });
            }
        });
    });

    apiReq.on('error', (err) => {
        console.error('❌ خطأ اتصال:', err.message);
        res.status(500).json({ error: 'فشل الاتصال: ' + err.message });
    });

    apiReq.write(req.file.buffer);
    apiReq.end();
});

app.listen(PORT, () => {
    console.log('✅ السيرفر شغال: http://localhost:' + PORT);
});
