// ============================================================
// Smart Farming AI - Frontend Demo Logic
// ============================================================

// Set the current year in the footer on all pages
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Helper: show the selected file name and preview image on the AI page
const fileInput = document.getElementById("leafImage");
const fileNameParagraph = document.getElementById("fileName");
const imagePreviewContainer = document.getElementById("imagePreview");

if (fileInput) {
  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];

    if (!file) {
      if (fileNameParagraph) {
        fileNameParagraph.textContent = "No file selected";
      }
      if (imagePreviewContainer) {
        imagePreviewContainer.innerHTML =
          '<p class="placeholder-text">Your uploaded image will appear here.</p>';
      }
      return;
    }

    // Show file name بالعربي
    if (fileNameParagraph) {
      fileNameParagraph.textContent = "الصورة المختارة: " + file.name;
    }

    // Show image preview
    if (imagePreviewContainer) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const image = document.createElement("img");
        image.src = event.target.result;

        imagePreviewContainer.innerHTML = "";
        imagePreviewContainer.appendChild(image);
      };

      reader.readAsDataURL(file);
    }
  });
}

// ============================================================
// Hugging Face - Plant Disease Model
// ============================================================
const CONFIDENCE_THRESHOLD = 70.0;

const LABEL_TO_ARABIC = {
  "tomato early blight": "اللفحة المبكرة في الطماطم",
  "tomato late blight": "اللفحة المتأخرة في الطماطم",
  "tomato bacterial spot": "البقعة البكتيرية في الطماطم",
  "tomato leaf mold": "عفن الأوراق في الطماطم",
  "tomato septoria leaf spot": "بقعة سبتوريا في الطماطم",
  "tomato spider mites two spotted spider mite": "عث العنكبوت في الطماطم",
  "tomato spider mites": "عث العنكبوت في الطماطم",
  "tomato target spot": "البقعة الهدفية في الطماطم",
  "tomato yellow leaf curl virus": "فيروس تجعد الأوراق الأصفر",
  "tomato tomato mosaic virus": "فيروس موزاييك الطماطم",
  "tomato healthy": "طماطم سليمة ✅",
  "potato early blight": "اللفحة المبكرة في البطاطس",
  "potato late blight": "اللفحة المتأخرة في البطاطس",
  "potato healthy": "بطاطس سليمة ✅",
  "apple apple scab": "الجلبة في التفاح",
  "apple black rot": "العفن الأسود في التفاح",
  "apple cedar apple rust": "صدأ الأرز والتفاح",
  "apple healthy": "تفاح سليم ✅",
  "corn cercospora leaf spot gray leaf spot": "بقعة أوراق سيركوسبورا في الذرة",
  "corn common rust": "الصدأ الشائع في الذرة",
  "corn northern leaf blight": "اللفحة الشمالية لأوراق الذرة",
  "corn maize healthy": "ذرة سليمة ✅",
  "grape black rot": "العفن الأسود في العنب",
  "grape esca black measles": "إسكا (الحصبة السوداء) في العنب",
  "grape leaf blight isariopsis leaf spot": "لفحة أوراق العنب",
  "grape healthy": "عنب سليم ✅",
  "orange haunglongbing citrus greening": "مرض الاخضرار في الحمضيات",
  "peach bacterial spot": "البقعة البكتيرية في الخوخ",
  "peach healthy": "خوخ سليم ✅",
  "pepper bell bacterial spot": "البقعة البكتيرية في الفلفل",
  "pepper bell healthy": "فلفل سليم ✅",
  "strawberry leaf scorch": "حرق أوراق الفراولة",
  "strawberry healthy": "فراولة سليمة ✅",
  "cherry including sour powdery mildew": "البياض الدقيقي في الكرز",
  "cherry including sour healthy": "كرز سليم ✅",
  "squash powdery mildew": "البياض الدقيقي في القرع",
  "blueberry healthy": "توت سليم ✅",
  "raspberry healthy": "توت العليق سليم ✅",
  "soybean healthy": "فول صويا سليم ✅",
};

function labelToArabic(label) {
  const key = label.toLowerCase().replace(/___/g, ' ').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  if (LABEL_TO_ARABIC[key]) return LABEL_TO_ARABIC[key];
  const keyNoWith = key.replace(/ with /g, ' ');
  if (LABEL_TO_ARABIC[keyNoWith]) return LABEL_TO_ARABIC[keyNoWith];
  return label.replace(/_/g, ' ');
}

function getTreatmentSuggestion(label) {
  const lower = label.toLowerCase();
  if (lower.includes("healthy")) return "النبات يبدو سليماً. استمر في العناية الجيدة والري المنتظم.";
  if (lower.includes("blight") || lower.includes("mold") || lower.includes("rust")) return "قم بإزالة الأوراق المصابة، تجنب الري من الأعلى، استخدم مبيداً فطرياً، وفكّر في تبديل المحصول.";
  if (lower.includes("bacterial") || lower.includes("spot")) return "إزالة الأوراق المصابة، استخدام مبيد بكتيري مناسب، وتحسين التهوية.";
  if (lower.includes("virus") || lower.includes("mosaic")) return "الفيروسات صعبة العلاج. أزل النباتات المصابة وقم بمكافحة الحشرات الناقلة.";
  if (lower.includes("mites") || lower.includes("spider")) return "استخدم صابوناً زراعياً أو زيت النيم لمكافحة العث.";
  return "استشر متخصصاً زراعياً للتشخيص الدقيق والعلاج المناسب.";
}

async function classifyPlant(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/classify-plant', { method: 'POST', body: formData });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `خطأ HTTP: ${response.status}`);
  }
  return await response.json();
}

async function analyzeImage() {
  const diseaseNameEl = document.getElementById("diseaseName");
  const confidenceEl = document.getElementById("confidenceValue");
  const treatmentEl = document.getElementById("treatmentSuggestion");
  const analyzeBtn = document.getElementById("analyzeBtn");

  if (!diseaseNameEl || !confidenceEl || !treatmentEl) return;
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert("من فضلك اختر صورة لورقة نبات أولاً.");
    return;
  }

  const imageFile = fileInput.files[0];
  if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل...';
  }
  diseaseNameEl.textContent = "...";
  confidenceEl.textContent = "...";
  treatmentEl.textContent = "جاري الاتصال بنموذج الذكاء الاصطناعي...";

  try {
    const data = await classifyPlant(imageFile);
    if (Array.isArray(data) && data.length > 0 && data[0].error) {
      throw new Error("النموذج قيد التحميل. انتظر دقيقة ثم حاول مرة أخرى.");
    }
    if (!Array.isArray(data) || data.length === 0) throw new Error("لم يُرجَع أي تصنيف.");

    const top = data[0];
    const label = top.label;
    const score = (top.score * 100).toFixed(1);

    diseaseNameEl.textContent = labelToArabic(label);
    confidenceEl.textContent = `${score}%`;

    if (parseFloat(score) < CONFIDENCE_THRESHOLD) {
      diseaseNameEl.textContent = "غير مؤكد ⚠️";
      treatmentEl.innerHTML = `<span style="color: #e67e22; font-weight: bold;">⚠️ تنبيه: نسبة الثقة منخفضة (${score}%)</span><br>الذكاء الاصطناعي غير متأكد. يرجى تصوير "ورقة" النبات بوضوح. النظام يدعم أوراق (الطماطم، البطاطس، العنب، التفاح...) فقط.`;
    } else {
      treatmentEl.textContent = getTreatmentSuggestion(label);
    }
  } catch (err) {
    diseaseNameEl.textContent = "-";
    confidenceEl.textContent = "-";

    let errorMessage = err.message || "تعذر الاتصال بنموذج الذكاء الاصطناعي.";

    // تحسين رسائل الخطأ للمستخدم
    if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
      errorMessage = "السيرفر المحلي مش شغال! ⚠️\nتأكد من تشغيل (node server.js) في الـ Terminal قبل التحليل.";
    }

    treatmentEl.textContent = "حدث خطأ: " + errorMessage;
  } finally {
    if (analyzeBtn) {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> تحليل الصورة';
    }
  }
}
