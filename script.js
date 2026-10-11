/**
 * رسوخ العمرانية - منطق صفحة تسجيل بيانات العملاء
 * Client Registration Form Handler
 */

// إعدادات خدمة الإرسال
const CONFIG = {
  // مفتاح Web3Forms الخاص ببريد: rsoukh.rs@gmail.com
  web3formsKey: '113beeb3-a879-4915-b15e-03afe048cd3b',
  
  // اسم الشركة الافتراضي
  companyName: 'رسوخ العمرانية',

  // نقطة نهاية API
  web3formsEndpoint: 'https://api.web3forms.com/submit',
  phpEndpoint: 'send_mail.php'
};

document.addEventListener('DOMContentLoaded', () => {
  // عناصر النموذج
  const form = document.getElementById('customerForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const successScreen = document.getElementById('successScreen');
  const newSubmissionBtn = document.getElementById('newSubmissionBtn');
  const generalAlert = document.getElementById('generalAlert');
  const alertMessage = document.getElementById('alertMessage');

  // الحقول
  const fullNameInput = document.getElementById('fullName');
  const phoneInput = document.getElementById('phoneNumber');
  const cityInput = document.getElementById('cityName');
  const paymentSelect = document.getElementById('paymentMethod');
  const honeypotInput = document.getElementById('website_url_check');

  // مجموعات الحقول ورسائل الخطأ
  const groupFullName = document.getElementById('groupFullName');
  const groupPhone = document.getElementById('groupPhone');
  const groupCity = document.getElementById('groupCity');
  const groupPayment = document.getElementById('groupPayment');

  const fullNameError = document.getElementById('fullNameError');
  const phoneError = document.getElementById('phoneError');
  const cityError = document.getElementById('cityError');
  const paymentError = document.getElementById('paymentError');

  // حالة الإرسال لمنع النقر المتكرر
  let isSubmitting = false;

  /**
   * إظهار رسالة خطأ لحقل معين
   */
  function showError(groupElem, errorElem, message) {
    if (!groupElem || !errorElem) return;
    groupElem.classList.add('has-error');
    const textSpan = errorElem.querySelector('.error-text');
    if (textSpan) {
      textSpan.textContent = message;
    }
    errorElem.style.display = 'flex';
  }

  /**
   * مسح رسالة الخطأ لحقل معين
   */
  function clearError(groupElem, errorElem) {
    if (!groupElem || !errorElem) return;
    groupElem.classList.remove('has-error');
    errorElem.style.display = 'none';
  }

  /**
   * إخفاء التنبيه العام
   */
  function hideGeneralAlert() {
    generalAlert.classList.remove('is-visible');
    generalAlert.style.setProperty('display', 'none', 'important');
  }

  /**
   * إظهار تنبيه عام عند فشل الإرسال
   */
  function showGeneralAlert(message) {
    alertMessage.textContent = message || 'تعذر إرسال البيانات حاليًا، يرجى المحاولة مرة أخرى.';
    generalAlert.classList.add('is-visible');
    generalAlert.style.removeProperty('display');
    generalAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // التأكد من إخفاء التنبيه فور تحميل الصفحة
  hideGeneralAlert();

  /**
   * التحقق من صحة الاسم الكامل
   */
  function validateFullName() {
    const val = fullNameInput.value.trim();
    if (!val) {
      showError(groupFullName, fullNameError, 'هذا الحقل مطلوب.');
      return false;
    }
    if (val.length < 3) {
      showError(groupFullName, fullNameError, 'يرجى إدخال اسم صحيح مكون من 3 أحرف على الأقل.');
      return false;
    }
    clearError(groupFullName, fullNameError);
    return true;
  }

  /**
   * التحقق من صحة رقم الجوال
   */
  function validatePhone() {
    const rawVal = phoneInput.value.trim();
    if (!rawVal) {
      showError(groupPhone, phoneError, 'هذا الحقل مطلوب.');
      return false;
    }

    const cleanNumber = rawVal.replace(/[\s\-\(\)]/g, '');
    const saudiRegex = /^(05|5|\+9665|009665|9665)[0-9]{8}$/;
    const intlRegex = /^(\+?[0-9]{8,15})$/;

    if (saudiRegex.test(cleanNumber) || intlRegex.test(cleanNumber)) {
      clearError(groupPhone, phoneError);
      return true;
    } else {
      showError(groupPhone, phoneError, 'يرجى إدخال رقم جوال صحيح.');
      return false;
    }
  }

  /**
   * التحقق من صحة المدينة
   */
  function validateCity() {
    const val = cityInput.value.trim();
    if (!val) {
      showError(groupCity, cityError, 'هذا الحقل مطلوب.');
      return false;
    }
    if (val.length < 2) {
      showError(groupCity, cityError, 'يرجى إدخال اسم مدينة صحيح.');
      return false;
    }
    clearError(groupCity, cityError);
    return true;
  }

  /**
   * التحقق من اختيار طريقة الدفع
   */
  function validatePayment() {
    const val = paymentSelect.value;
    if (!val) {
      showError(groupPayment, paymentError, 'هذا الحقل مطلوب.');
      return false;
    }
    clearError(groupPayment, paymentError);
    return true;
  }

  // أحداث التفاعل في الوقت الفعلي
  fullNameInput.addEventListener('input', () => {
    if (groupFullName.classList.contains('has-error')) validateFullName();
  });
  fullNameInput.addEventListener('blur', () => {
    if (fullNameInput.value.trim() !== '') validateFullName();
  });

  phoneInput.addEventListener('input', () => {
    if (groupPhone.classList.contains('has-error')) validatePhone();
  });
  phoneInput.addEventListener('blur', () => {
    if (phoneInput.value.trim() !== '') validatePhone();
  });

  cityInput.addEventListener('input', () => {
    if (groupCity.classList.contains('has-error')) validateCity();
  });
  cityInput.addEventListener('blur', () => {
    if (cityInput.value.trim() !== '') validateCity();
  });

  paymentSelect.addEventListener('change', () => {
    validatePayment();
  });

  /**
   * معالجة إرسال النموذج
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    hideGeneralAlert();

    // التحقق من كافة الحقول
    const isNameValid = validateFullName();
    const isPhoneValid = validatePhone();
    const isCityValid = validateCity();
    const isPaymentValid = validatePayment();

    if (!isNameValid || !isPhoneValid || !isCityValid || !isPaymentValid) {
      if (!isNameValid) fullNameInput.focus();
      else if (!isPhoneValid) phoneInput.focus();
      else if (!isCityValid) cityInput.focus();
      else if (!isPaymentValid) paymentSelect.focus();
      return;
    }

    // تفعيل حالة التحميل
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    btnText.textContent = 'جارٍ إرسال البيانات...';

    const fullName = fullNameInput.value.trim();
    const phoneNumber = phoneInput.value.trim();
    const cityName = cityInput.value.trim();
    const paymentMethod = paymentSelect.value;

    try {
      let isSuccess = false;
      let errorMsg = '';

      // 1. إذا كان مفتاح Web3Forms متوفراً
      if (CONFIG.web3formsKey) {
        const formattedDate = new Date().toLocaleString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const payload = {
          access_key: CONFIG.web3formsKey,
          subject: 'تسجيل عميل جديد: ' + fullName + ' (' + cityName + ') - ' + CONFIG.companyName,
          from_name: CONFIG.companyName,
          message: [
            'بيانات تسجيل العميل الجديد:',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
            '• اسم العميل: ' + fullName,
            '• رقم الجوال: ' + phoneNumber,
            '• المدينة: ' + cityName,
            '• طريقة الدفع: ' + paymentMethod,
            '• اسم الشركة: ' + CONFIG.companyName,
            '• تاريخ ووقت الإرسال: ' + formattedDate,
            '• مصدر التسجيل: صفحة تسجيل بيانات العملاء',
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
          ].join('\n')
        };

        if (honeypotInput && honeypotInput.value) {
          payload.botcheck = honeypotInput.value;
        }

        const response = await fetch(CONFIG.web3formsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
          isSuccess = true;
        } else {
          errorMsg = result.message || 'تعذر إرسال البيانات حاليًا، يرجى المحاولة مرة أخرى.';
        }
      } else {
        // 2. استخدام معالج الخادم PHP كبديل
        const payload = {
          full_name: fullName,
          phone_number: phoneNumber,
          city: cityName,
          payment_method: paymentMethod,
          website_url_check: honeypotInput ? honeypotInput.value : ''
        };

        const response = await fetch(CONFIG.phpEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
          isSuccess = true;
        } else {
          errorMsg = result.message || 'تعذر إرسال البيانات حاليًا، يرجى المحاولة مرة أخرى.';
        }
      }

      if (isSuccess) {
        // عرض شاشة النجاح والتأكيد
        form.style.display = 'none';
        successScreen.style.display = 'block';
        successScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
        form.reset();
      } else {
        showGeneralAlert(errorMsg || 'تعذر إرسال البيانات حاليًا، يرجى المحاولة مرة أخرى.');
      }
    } catch (networkError) {
      console.error('Submission error:', networkError);
      showGeneralAlert('تعذر إرسال البيانات حاليًا، يرجى المحاولة مرة أخرى.');
    } finally {
      // إنهاء حالة التحميل
      isSubmitting = false;
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      btnText.textContent = 'إرسال البيانات';
    }
  });

  /**
   * زر تسجيل عميل جديد (إعادة فتح النموذج)
   */
  newSubmissionBtn.addEventListener('click', () => {
    hideGeneralAlert();
    clearError(groupFullName, fullNameError);
    clearError(groupPhone, phoneError);
    clearError(groupCity, cityError);
    clearError(groupPayment, paymentError);
    successScreen.style.display = 'none';
    form.style.display = 'block';
    fullNameInput.focus();
  });
});
