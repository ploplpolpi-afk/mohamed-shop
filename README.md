# موقع التجارة الإلكترونية
# E-Commerce Website Documentation

## 📖 نظرة عامة / Overview

هذا موقع تجارة إلكترونية عربي RTL مبني باستخدام Vite و Supabase. يتميز بواجهة حديثة مع animations وتصميم responsive يعمل بشكل مثالي على الهاتف والحاسوب.

---

## 🚀 التثبيت والتشغيل / Installation & Setup

### المتطلبات / Requirements:
- Node.js 16+ 
- npm أو yarn
- متصفح حديث (Chrome, Firefox, Safari, Edge)

### خطوات التثبيت:

```bash
# 1. التثبيت
npm install

# 2. تشغيل خادم التطوير
npm run dev

# 3. فتح المتصفح
# http://localhost:5174

# 4. البناء للإنتاج
npm run build

# 5. معاينة الإصدار الإنتاجي
npm run preview
```

---

## 📱 نظام المصادقة / Authentication System

### الميزات:
- تسجيل دخول عبر البريد الإلكتروني أو رقم الهاتف
- تسجيل حساب جديد (مشتري أو بائع)
- تسجيل دخول اجتماعي (Facebook / Google)
- كلمات مرور قوية مع عداد القوة
- تسكر الجلسة تلقائياً عند تسجيل الخروج

### صفحات المصادقة:
1. **صفحة تسجيل الدخول (Login)**
   - الملف: `src/pages/Login.js`
   - المسار: #login-screen
   - الميزات: بريد/هاتف، كلمة مرور، تذكر البيانات، تسجيل اجتماعي

2. **صفحة التسجيل (Registration)**
   - الملف: `src/pages/Register.js`
   - المسار: #register-screen
   - الميزات: بيانات شاملة، نوع الحساب، التحقق من القوة، شروط الخدمة

### التحويل بين الصفحات:
```javascript
// الانتقال إلى صفحة تسجيل الدخول
showScreen('login-screen');

// الانتقال إلى صفحة التسجيل
showScreen('register-screen');
```

---

## 🎨 التصميم والـ Animations

### الألوان الأساسية:
```css
الأرجواني الأساسي: #667eea
الأرجواني الداكن: #764ba2
الأخضر (نجاح): #4ade80
الأحمر (خطأ): #ef4444
```

### Animations المستخدمة:
- `slideUp`: تحريك لأعلى عند التحميل
- `slideInFromRight`: التحريك من اليمين (للـ RTL)
- `slideInFromLeft`: التحريك من اليسار
- `spin`: دوران (للـ Loading)
- `pulse`: نبض (للـ Focus)

### مثال على الاستخدام:
```css
.auth-card {
    animation: slideUp 0.6s ease-out;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
```

---

## 📐 Responsive Design

### نقاط الانقطاع (Breakpoints):

| المجموعة | النطاق | الأجهزة |
|---------|--------|--------|
| Mobile Small | < 400px | هاتف قديم |
| Mobile | < 600px | iPhone, Android |
| Tablet | 600px - 900px | iPad |
| Desktop | > 900px | شاشات الحاسوب |

### التعديلات على كل حجم:

**Mobile (< 600px)**:
- حجم الخط: 14px (أساسي) 
- عرض الـ Container: 100%
- Padding: 12px
- Border radius: 8px

**Mobile Small (< 400px)**:
- حجم الخط: 12px
- عرض الـ Button: 100%
- Padding: 8px

**Desktop (> 900px)**:
- عرض الـ Container: 90%
- Padding: 20px
- Border radius: 12px

---

## 🧪 اختبار التطبيق / Testing

### اختبار على الموبايل:

#### الطريقة 1: باستخدام Chrome DevTools
```
1. اضغط F12 لفتح المطورين
2. اضغط Ctrl+Shift+M لتفعيل محاكاة الهاتف
3. اختر جهاز (iPhone 12, Pixel 5, إلخ)
4. اختبر الـ Touch والحركات
```

#### الطريقة 2: على هاتف حقيقي
```
1. تأكد أن الهاتف والحاسوب على نفس الشبكة
2. افتح terminal واكتب: ipconfig (Windows) أو ifconfig (Mac/Linux)
3. ابحث عن IPv4 Address (مثل 192.168.x.x)
4. على الهاتف افتح: http://192.168.x.x:5174
```

### قائمة اختبار شاملة:

#### Authentication ✓
- [ ] تسجيل دخول بريد صحيح
- [ ] تسجيل دخول رقم صحيح
- [ ] رسالة خطأ لبريد خاطئ
- [ ] رسالة خطأ لرقم خاطئ
- [ ] التسجيل برقم والبريد معاً
- [ ] رسالة خطأ لكلمة مرور ضعيفة
- [ ] عداد قوة كلمة المرور يعمل
- [ ] إخفاء/إظهار كلمة المرور
- [ ] نسيان البيانات بعد logout

#### Responsive ✓
- [ ] يعمل على iPhone (375px)
- [ ] يعمل على Samsung (360px)
- [ ] يعمل على iPad (768px)
- [ ] يعمل على Desktop (1024px+)
- [ ] الـ Arabic RTL يعمل صحيح
- [ ] الأزرار يمكن الضغط بسهولة
- [ ] الخطوط واضحة وسهلة القراءة
- [ ] لا يوجد horizontal scroll

#### Performance ✓
- [ ] الصفحة تحمل بسرعة (< 3 ثوان)
- [ ] الـ Animations سلسة بدون تقطيع
- [ ] لا توجد رسائل خطأ في Console
- [ ] الذاكرة تُحرر عند تغيير الصفحات

#### Security ✓
- [ ] لا توجد رسائل XSS
- [ ] البيانات الحساسة لا تُحفظ
- [ ] كلمات المرور مخفية
- [ ] النماذج تتحقق من الصحة

---

## 📊 هيكل المشروع / Project Structure

```
موقع جديد/
├── App.js                 # تطبيق رئيسي
├── index.html             # صفحة HTML الرئيسية
├── styles.css             # أنماط عامة
├── auth-styles.css        # أنماط المصادقة
├── package.json           # المكتبات والتبعيات
├── SECURITY.md            # سياسة الأمان
├── README.md              # هذا الملف
├── src/
│   ├── pages/
│   │   ├── Home.js        # الصفحة الرئيسية
│   │   ├── Login.js       # صفحة تسجيل الدخول
│   │   ├── Register.js    # صفحة التسجيل
│   │   └── styles.css     # أنماط الصفحات
│   ├── components/
│   │   ├── ProductCard.js # بطاقة المنتج
│   │   └── CheckoutForm.js # نموذج الدفع
│   └── lib/
│       └── supabase.js    # عميل Supabase
└── migrations/            # قاعدة البيانات
    ├── create_products_table.sql
    ├── create_orders_table.sql
    └── alter_orders_add_columns.sql
```

---

## 🔑 الدوال الرئيسية / Key Functions

### في App.js:
```javascript
showScreen(screenName)           // عرض شاشة معينة
toggleRoleMode()                 // تبديل نوع المستخدم
addToCart(product)              // إضافة منتج للسلة
performSearch(query)            // البحث عن منتجات
signOutFromApp()                // تسجيل الخروج
updateRoleButton()              // تحديث زر الدور
```

### في Login.js:
```javascript
renderLoginScreen()             // رسم شاشة الدخول
handleLoginSubmit(event)        // معالجة إرسال النموذج
validateLoginInputs(id, pass)   // التحقق من الصحة
togglePasswordVisibility(id)    // إظهار/إخفاء كلمة المرور
```

### في Register.js:
```javascript
renderRegisterScreen()          // رسم شاشة التسجيل
handleRegisterSubmit(event)     // معالجة التسجيل
validateRegisterInputs(...)     // التحقق الشامل
checkPasswordStrength()         // عداد القوة
isStrongPassword(pass)          // فحص قوة كلمة المرور
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "Login screen not showing"
```javascript
// تأكد من أن الدالة محفوظة في window
console.log(typeof window.renderLoginScreen); // يجب أن تكون 'function'

// تأكد من استيراد الملف
// في index.html يجب أن يكون:
// <script type="module" src="src/pages/Login.js"></script>
```

### الخطأ: "Arabic text is LTR instead of RTL"
```html
<!-- تأكد من وجود dir="rtl" -->
<html dir="rtl" lang="ar">
```

### الخطأ: "Form not responsive on mobile"
```css
/* تأكد من Viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1.0">

/* وتأكد من media queries في auth-styles.css */
@media (max-width: 600px) { ... }
```

---

## 📈 الإحصائيات

- **حجم المشروع**: ~50KB (بدون node_modules)
- **وقت التحميل**: < 2 ثانية (على اتصال عادي)
- **المتصفحات المدعومة**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **دعم الهاتف**: Android 6+, iOS 11+

---

## 📚 موارد إضافية

### Supabase:
- [الموقع الرسمي](https://supabase.com)
- [التوثيق](https://supabase.com/docs)
- [لوحة التحكم](https://app.supabase.com)

### Vite:
- [الموقع الرسمي](https://vitejs.dev)
- [الدليل السريع](https://vitejs.dev/guide/)

### المعايير:
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Best Practices](https://developers.google.com/web/tools/chrome-devtools/device-mode)
- [Performance Optimization](https://web.dev/performance/)

---

## 👥 فريق التطوير

تم تطوير هذا المشروع بواسطة فريق متخصص في الويب العربي.

---

## 📝 الترخيص

هذا المشروع مرخص تحت MIT License. انظر LICENSE.md للتفاصيل.

---

## 📞 التواصل والدعم

للأسئلة والاستفسارات:
- البريد الإلكتروني: support@example.com
- الموقع: https://example.com
- Twitter: @example

---

**آخر تحديث: 2024**
**Version: 1.0.0**
