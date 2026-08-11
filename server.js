const express = require('express');
const multer = require('multer');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// تكوين multer للـ Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB حد أقصى
  }
});

// Middleware للسماح بـ CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Middleware لتحليل JSON وبيانات النموذج
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Load token from environment variable
const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    console.warn('❌ تحذير: لم يتم العثور على HF_TOKEN في ملف .env');
}

// نقاط للملفات الثابتة
app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

// نقطة الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// نقطة تحليل الصورة
app.post('/classify-plant', upload.single('image'), (req, res) => {
  console.log('طلب POST وصل:', req.method, req.url);
  
  if (!req.file) {
    console.error('❌ لم يتم إرسال صورة');
    return res.status(400).json({ error: 'لم يتم إرسال صورة' });
  }

  console.log('⏳ جاري تحليل الصورة...');
  
  // استخدام البيانات من ملف.req.buffer
  const imageBuffer = req.file.buffer;
  
  const options = {
    hostname: 'router.huggingface.co',
    path: '/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + HF_TOKEN,
      'Content-Type': 'application/octet-stream',
      'Content-Length': imageBuffer.length
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
          res.status(apiRes.statusCode).json({ error: json.error || 'حدث خطأ في التحليل' });
        }
      } catch (e) {
        console.error('❌ رد غير متوقع:', data.substring(0, 300));
        res.status(500).json({ error: 'رد غير صالح من الخادم' });
      }
    });
  });

  apiReq.on('error', (err) => {
    console.error('❌ خطأ اتصال:', err.message);
    res.status(500).json({ error: 'فشل الاتصال بالخادم: ' + err.message });
  });

  apiReq.write(imageBuffer);
  apiReq.end();
});

// إضافة نقاط للصفحات الأخرى
app.get('/ai.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/team.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'team.html'));
});

// إضافة نقطة للتأكد من أن التطبيق يعمل
app.get('/health', (req, res) => {
  res.json({ status: 'working', message: 'الخادم شغال нормально' });
});

// تصدير التطبيق لـ Vercel
module.exports = app;

// تشغيل السيرفر محلياً فقط
if (require.main === module) {
    app.listen(PORT, () => {
        console.log('✅ السيرفر شغال: http://localhost:' + PORT);
    });
}