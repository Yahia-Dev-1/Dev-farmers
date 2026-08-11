
// ============================================================
// The Modern Falla7
// Smart Farming AI - Frontend Logic
// ============================================================


// ============================================================
// 1. Current Year
// ============================================================

const yearSpan = document.getElementById("year");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


// ============================================================
// 2. Elements
// ============================================================

const fileInput = document.getElementById("leafImage");
const fileNameParagraph = document.getElementById("fileName");
const imagePreviewContainer = document.getElementById("imagePreview");

const analyzeBtn = document.getElementById("analyzeBtn");
const resetBtn = document.getElementById("resetBtn");

const diseaseNameEl = document.getElementById("diseaseName");
const confidenceEl = document.getElementById("confidenceValue");
const treatmentEl = document.getElementById("treatmentSuggestion");

const confidenceBar = document.getElementById("confidenceBar");
const confidenceText = document.getElementById("confidenceText");

const resultStatus = document.getElementById("resultStatus");
const analysisLoading = document.getElementById("analysisLoading");


// ============================================================
// 3. Configuration
// ============================================================

const CONFIDENCE_THRESHOLD = 70.0;

const MAX_FILE_SIZE_MB = 4;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// ============================================================
// 4. Arabic Labels
// ============================================================

const LABEL_TO_ARABIC = {

  "tomato early blight":
    "اللفحة المبكرة في الطماطم",

  "tomato late blight":
    "اللفحة المتأخرة في الطماطم",

  "tomato bacterial spot":
    "البقعة البكتيرية في الطماطم",

  "tomato leaf mold":
    "عفن الأوراق في الطماطم",

  "tomato septoria leaf spot":
    "بقعة سبتوريا في الطماطم",

  "tomato spider mites two spotted spider mite":
    "عث العنكبوت في الطماطم",

  "tomato spider mites":
    "عث العنكبوت في الطماطم",

  "tomato target spot":
    "البقعة الهدفية في الطماطم",

  "tomato yellow leaf curl virus":
    "فيروس تجعد الأوراق الأصفر",

  "tomato tomato mosaic virus":
    "فيروس موزاييك الطماطم",

  "tomato healthy":
    "طماطم سليمة ✅",


  "potato early blight":
    "اللفحة المبكرة في البطاطس",

  "potato late blight":
    "اللفحة المتأخرة في البطاطس",

  "potato healthy":
    "بطاطس سليمة ✅",


  "apple apple scab":
    "الجلبة في التفاح",

  "apple black rot":
    "العفن الأسود في التفاح",

  "apple cedar apple rust":
    "صدأ الأرز والتفاح",

  "apple healthy":
    "تفاح سليم ✅",


  "corn cercospora leaf spot gray leaf spot":
    "بقعة أوراق سيركوسبورا في الذرة",

  "corn common rust":
    "الصدأ الشائع في الذرة",

  "corn northern leaf blight":
    "اللفحة الشمالية لأوراق الذرة",

  "corn maize healthy":
    "ذرة سليمة ✅",


  "grape black rot":
    "العفن الأسود في العنب",

  "grape esca black measles":
    "إسكا (الحصبة السوداء) في العنب",

  "grape leaf blight isariopsis leaf spot":
    "لفحة أوراق العنب",

  "grape healthy":
    "عنب سليم ✅",


  "orange haunglongbing citrus greening":
    "مرض الاخضرار في الحمضيات",

  "peach bacterial spot":
    "البقعة البكتيرية في الخوخ",

  "peach healthy":
    "خوخ سليم ✅",

  "pepper bell bacterial spot":
    "البقعة البكتيرية في الفلفل",

  "pepper bell healthy":
    "فلفل سليم ✅",

  "strawberry leaf scorch":
    "حرق أوراق الفراولة",

  "strawberry healthy":
    "فراولة سليمة ✅",

  "cherry including sour powdery mildew":
    "البياض الدقيقي في الكرز",

  "cherry including sour healthy":
    "كرز سليم ✅",

  "squash powdery mildew":
    "البياض الدقيقي في القرع",

  "blueberry healthy":
    "توت سليم ✅",

  "raspberry healthy":
    "توت العليق سليم ✅",

  "soybean healthy":
    "فول صويا سليم ✅"
};


// ============================================================
// 5. Convert Model Label To Arabic
// ============================================================

function labelToArabic(label) {

  if (!label) {
    return "غير معروف";
  }

  const key = label
    .toLowerCase()
    .replace(/___/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (LABEL_TO_ARABIC[key]) {
    return LABEL_TO_ARABIC[key];
  }

  const keyNoWith = key.replace(/ with /g, " ");

  if (LABEL_TO_ARABIC[keyNoWith]) {
    return LABEL_TO_ARABIC[keyNoWith];
  }

  return label
    .replace(/_/g, " ")
    .replace(/\bhealthy\b/gi, "سليم");
}


// ============================================================
// 6. Treatment Suggestions
// ============================================================

function getTreatmentSuggestion(label) {

  const lower = String(label || "").toLowerCase();


  if (lower.includes("healthy")) {

    return `
      <strong>الحالة تبدو سليمة.</strong><br>
      استمر في المتابعة والري المناسب،
      وراقب أي تغيرات جديدة على الأوراق.
    `;
  }


  if (
    lower.includes("blight") ||
    lower.includes("mold") ||
    lower.includes("rust")
  ) {

    return `
      يُنصح بعزل أو إزالة الأوراق المصابة،
      تحسين التهوية وتجنب الري على الأوراق.
      استشر متخصصاً زراعياً قبل استخدام أي مبيد.
    `;
  }


  if (
    lower.includes("bacterial") ||
    lower.includes("spot")
  ) {

    return `
      يُنصح بإزالة الأجزاء المصابة وتحسين التهوية
      وتقليل رطوبة الأوراق.
      يمكن استشارة متخصص لتحديد وسيلة المكافحة المناسبة.
    `;
  }


  if (
    lower.includes("virus") ||
    lower.includes("mosaic")
  ) {

    return `
      الفيروسات تحتاج إلى تقييم متخصص.
      اعزل النبات المصاب قدر الإمكان
      وراقب الحشرات الناقلة للمرض.
    `;
  }


  if (
    lower.includes("mites") ||
    lower.includes("spider")
  ) {

    return `
      افحص الأوراق جيداً بحثاً عن العث.
      يمكن استشارة متخصص حول وسائل المكافحة المناسبة
      للنبات المصاب.
    `;
  }


  return `
    النتيجة تحتاج إلى تقييم متخصص للتأكد من التشخيص
    وتحديد طريقة التعامل المناسبة.
  `;
}


// ============================================================
// 7. Status Helper
// ============================================================

function setStatus(message, type = "info") {

  if (!resultStatus) {
    return;
  }

  const icons = {
    info: "fa-circle-info",
    success: "fa-circle-check",
    warning: "fa-triangle-exclamation",
    error: "fa-circle-xmark"
  };

  resultStatus.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  resultStatus.dataset.status = type;
}


// ============================================================
// 8. File Validation
// ============================================================

function validateImageFile(file) {

  if (!file) {

    return {
      valid: false,
      message: "من فضلك اختر صورة لورقة نبات أولاً."
    };

  }


  if (!ALLOWED_TYPES.includes(file.type)) {

    return {
      valid: false,
      message:
        "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WEBP."
    };

  }


  const maxBytes =
    MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size > maxBytes) {

    return {
      valid: false,
      message:
        `حجم الصورة كبير. الحد الأقصى هو ${MAX_FILE_SIZE_MB}MB.`
    };

  }


  return {
    valid: true,
    message: ""
  };
}


// ============================================================
// 9. File Input Preview
// ============================================================

if (fileInput) {

  fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {

      resetAnalysis();

      return;
    }


    const validation =
      validateImageFile(file);


    if (!validation.valid) {

      alert(validation.message);

      fileInput.value = "";

      resetAnalysis();

      return;
    }


    if (fileNameParagraph) {

      fileNameParagraph.textContent =
        "الصورة المختارة: " + file.name;

    }


    if (imagePreviewContainer) {

      const reader = new FileReader();


      reader.onload = function (event) {

        const image =
          document.createElement("img");

        image.src =
          event.target.result;

        image.alt =
          "صورة ورقة النبات المختارة";

        imagePreviewContainer.innerHTML = "";

        imagePreviewContainer.appendChild(image);

      };


      reader.readAsDataURL(file);

    }


    clearResult();

    setStatus(
      "تم اختيار الصورة. اضغط على تحليل الصورة للبدء.",
      "info"
    );

  });

}


// ============================================================
// 10. Clear Result
// ============================================================

function clearResult() {

  if (diseaseNameEl) {
    diseaseNameEl.textContent = "-";
  }

  if (confidenceEl) {
    confidenceEl.textContent = "-";
  }

  if (treatmentEl) {
    treatmentEl.textContent = "-";
  }

  if (confidenceBar) {
    confidenceBar.style.width = "0%";
  }

  if (confidenceText) {
    confidenceText.textContent =
      "لم يبدأ التحليل";
  }

}


// ============================================================
// 11. Reset Analysis
// ============================================================

function resetAnalysis() {

  if (fileInput) {
    fileInput.value = "";
  }


  if (fileNameParagraph) {

    fileNameParagraph.textContent =
      "لم يتم اختيار ملف";

  }


  if (imagePreviewContainer) {

    imagePreviewContainer.innerHTML = `
      <div class="preview-empty">

        <i class="fa-solid fa-leaf"></i>

        <p class="placeholder-text">
          ستظهر الصورة التي رفعتها هنا.
        </p>

      </div>
    `;

  }


  clearResult();


  if (analysisLoading) {
    analysisLoading.hidden = true;
  }


  if (analyzeBtn) {

    analyzeBtn.disabled = false;

    analyzeBtn.innerHTML =
      '<i class="fa-solid fa-wand-magic-sparkles"></i> تحليل الصورة';

  }


  setStatus(
    "ارفع صورة ثم اضغط على تحليل الصورة.",
    "info"
  );

}


// ============================================================
// 12. Hugging Face / Backend Request
// ============================================================

async function classifyPlant(file) {

  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );


  const response =
    await fetch(
      "/classify-plant",
      {
        method: "POST",
        body: formData
      }
    );


  if (!response.ok) {

    const errorData =
      await response
        .json()
        .catch(() => ({}));


    throw new Error(
      errorData.error ||
      `خطأ HTTP: ${response.status}`
    );

  }


  return await response.json();
}


// ============================================================
// 13. Main AI Analysis
// ============================================================

async function analyzeImage() {

  if (
    !diseaseNameEl ||
    !confidenceEl ||
    !treatmentEl
  ) {

    return;
  }


  if (
    !fileInput ||
    !fileInput.files ||
    fileInput.files.length === 0
  ) {

    alert(
      "من فضلك اختر صورة لورقة نبات أولاً."
    );

    return;
  }


  const imageFile =
    fileInput.files[0];


  const validation =
    validateImageFile(imageFile);


  if (!validation.valid) {

    alert(validation.message);

    return;
  }


  // Disable button

  if (analyzeBtn) {

    analyzeBtn.disabled = true;

    analyzeBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل...';

  }


  // Show loading

  if (analysisLoading) {
    analysisLoading.hidden = false;
  }


  diseaseNameEl.textContent =
    "...";

  confidenceEl.textContent =
    "...";

  treatmentEl.textContent =
    "جاري الاتصال بنموذج الذكاء الاصطناعي...";


  if (confidenceBar) {
    confidenceBar.style.width = "0%";
  }


  if (confidenceText) {
    confidenceText.textContent =
      "جاري التحليل...";
  }


  setStatus(
    "يتم الآن تحليل الصورة. قد يستغرق الأمر بضع ثوانٍ.",
    "info"
  );


  try {

    const data =
      await classifyPlant(imageFile);


    // Model loading response

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].error
    ) {

      throw new Error(
        "النموذج قيد التحميل. انتظر قليلاً ثم حاول مرة أخرى."
      );

    }


    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {

      throw new Error(
        "لم يتم الحصول على نتيجة من نموذج الذكاء الاصطناعي."
      );

    }


    const top =
      data[0];


    const label =
      top.label;


    const rawScore =
      Number(top.score);


    const score =
      (rawScore * 100);


    const formattedScore =
      score.toFixed(1);


    // Disease name

    diseaseNameEl.textContent =
      labelToArabic(label);


    // Confidence

    confidenceEl.textContent =
      `${formattedScore}%`;


    // Progress bar

    if (confidenceBar) {

      const safeScore =
        Math.min(
          Math.max(score, 0),
          100
        );

      confidenceBar.style.width =
        `${safeScore}%`;

    }


    if (confidenceText) {

      confidenceText.textContent =
        `درجة الثقة: ${formattedScore}%`;

    }


    // Low confidence

    if (
      score <
      CONFIDENCE_THRESHOLD
    ) {

      diseaseNameEl.textContent =
        "غير مؤكد ⚠️";


      treatmentEl.innerHTML = `
        <strong style="color:#d97706;">
          ⚠️ النتيجة غير مؤكدة
        </strong>
        <br>
        نسبة الثقة ${formattedScore}% وهي أقل من
        الحد المستخدم في المشروع (${CONFIDENCE_THRESHOLD}%).
        <br>
        حاول تصوير ورقة واحدة بوضوح وإضاءة جيدة.
      `;


      setStatus(
        "النموذج غير متأكد من النتيجة. يفضل إعادة تصوير الورقة أو استشارة متخصص.",
        "warning"
      );

    } else {

      treatmentEl.innerHTML =
        getTreatmentSuggestion(label);


      setStatus(
        "تم تحليل الصورة بنجاح. النتيجة تمثل توقع النموذج وليست تشخيصاً نهائياً.",
        "success"
      );

    }


    // Highlight result

    const resultCard =
      document.getElementById(
        "resultCard"
      );


    if (resultCard) {

      resultCard.classList.remove(
        "flash-result"
      );


      void resultCard.offsetWidth;


      resultCard.classList.add(
        "flash-result"
      );

    }

  } catch (err) {

    console.error(
      "Plant analysis error:",
      err
    );


    diseaseNameEl.textContent =
      "-";

    confidenceEl.textContent =
      "-";

    treatmentEl.textContent =
      "تعذر الحصول على نتيجة.";


    if (confidenceBar) {
      confidenceBar.style.width = "0%";
    }


    if (confidenceText) {
      confidenceText.textContent =
        "فشل التحليل";
    }


    let errorMessage =
      err.message ||
      "تعذر الاتصال بنموذج الذكاء الاصطناعي.";


    if (
      errorMessage.includes(
        "Failed to fetch"
      ) ||
      errorMessage.includes(
        "NetworkError"
      )
    ) {

      errorMessage =
        "تعذر الاتصال بالسيرفر. تأكد من تشغيل server.js ثم حاول مرة أخرى.";

    }


    setStatus(
      errorMessage,
      "error"
    );

  } finally {

    if (analysisLoading) {
      analysisLoading.hidden = true;
    }


    if (analyzeBtn) {

      analyzeBtn.disabled = false;

      analyzeBtn.innerHTML =
        '<i class="fa-solid fa-wand-magic-sparkles"></i> تحليل الصورة';

    }

  }

}
