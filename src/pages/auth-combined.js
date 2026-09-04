/**
 * Combined Auth Module - Login & Register
 * يجمع بين تسجيل الدخول والتسجيل
 */

// ===== LOGIN FUNCTIONS =====

function renderLoginScreen() {
    return `
        <div id="login-screen" class="screen">
            <header class="main-header auth-header">
                <button class="back-btn" onclick="showScreen('welcome-screen')">◄ الرئيسية</button>
                <h2>تسجيل الدخول</h2>
                <p class="subtitle">أدخل بيانات دخولك للوصول إلى حسابك</p>
            </header>
            <main class="auth-container animate-fade-in">
                <div class="auth-card">
                    <div class="auth-card-header">
                        <h3>مرحبا بعودتك!</h3>
                        <p>استخدم بريدك الإلكتروني أو رقم هاتفك وكلمة المرور</p>
                    </div>

                    <form class="auth-form" id="login-form" onsubmit="handleLoginSubmit(event)">
                        <div class="form-group">
                            <label for="login-email">البريد الإلكتروني أو رقم الهاتف</label>
                            <div class="input-wrapper">
                                <input 
                                    id="login-email" 
                                    type="text" 
                                    placeholder="بريدك أو رقم هاتفك" 
                                    autocomplete="email"
                                    required
                                    aria-label="البريد الإلكتروني أو رقم الهاتف"
                                >
                                <span class="input-icon">📧</span>
                            </div>
                            <small id="login-email-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group">
                            <label for="login-password">كلمة المرور</label>
                            <div class="input-wrapper">
                                <input 
                                    id="login-password" 
                                    type="password" 
                                    placeholder="أدخل كلمة مرورك" 
                                    autocomplete="current-password"
                                    required
                                    aria-label="كلمة المرور"
                                >
                                <button class="password-toggle" type="button" onclick="togglePasswordVisibility('login-password', this)" aria-label="إظهار كلمة المرور">👁️</button>
                            </div>
                            <small id="login-password-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="login-remember" class="checkbox-input">
                                <span>تذكرني على هذا الجهاز</span>
                            </label>
                        </div>

                        <button type="submit" class="btn-primary btn-large" id="login-submit">
                            <span>تسجيل الدخول</span>
                            <span class="btn-loader" style="display:none;">⏳</span>
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>أو</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-social btn-facebook" onclick="handleFacebookAuthLogin()">
                            <span>🔵 فيسبوك</span>
                        </button>
                        <button type="button" class="btn-social btn-google" onclick="handleGoogleAuthLogin()">
                            <span>🔴 جوجل</span>
                        </button>
                    </div>

                    <div class="auth-footer">
                        <p>ليس لديك حساب بعد؟ 
                            <button type="button" class="link-btn" onclick="showScreen('register-screen')">
                                <strong>أنشئ حساب جديد</strong>
                            </button>
                        </p>
                        <p>
                            <button type="button" class="link-btn" onclick="showScreen('forgot-password-screen')" style="display:none;">
                                نسيت كلمة المرور؟
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    `;
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit');
    const loader = submitBtn.querySelector('.btn-loader');
    
    clearLoginErrors();
    
    const identifier = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();
    
    if (!validateLoginInputs(identifier, password)) {
        return;
    }
    
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';
    
    try {
        if (typeof window.signInWithSupabase === 'function') {
            const result = await window.signInWithSupabase(identifier, password, { 
                full_name: identifier,
                role: 'buyer'
            });
            
            if (result.success && result.user) {
                APP_STATE.isLoggedIn = true;
                APP_STATE.accountName = result.user.full_name || identifier;
                APP_STATE.accountPhone = identifier;
                APP_STATE.accountMethod = 'phone';
                APP_STATE.authUserId = result.user.id;
                persistAppState();
                updateRoleButton();
                
                showSnack('✅ تم تسجيل الدخول بنجاح!');
                showScreen('welcome-screen');
                return;
            } else {
                const errorMsg = result.message || 'البريد أو كلمة المرور غير صحيحة';
                showSnack('❌ ' + errorMsg);
                document.getElementById('login-password-error').textContent = errorMsg;
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }
        }
        
        APP_STATE.isLoggedIn = true;
        APP_STATE.accountName = identifier;
        APP_STATE.accountPhone = identifier;
        APP_STATE.accountMethod = 'phone';
        APP_STATE.role = 'buyer';
        persistAppState();
        updateRoleButton();
        
        showSnack('✅ تم تسجيل الدخول بنجاح!');
        showScreen('welcome-screen');
        
    } catch (error) {
        console.error('Login error:', error);
        showSnack('❌ حدث خطأ أثناء تسجيل الدخول');
        document.getElementById('login-email-error').textContent = 'حدث خطأ في الخادم';
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
    }
}

function validateLoginInputs(identifier, password) {
    let isValid = true;
    
    if (!identifier) {
        document.getElementById('login-email-error').textContent = 'أدخل بريدك أو رقم هاتفك';
        isValid = false;
    } else if (!isValidEmailOrPhone(identifier)) {
        document.getElementById('login-email-error').textContent = 'البريد أو رقم الهاتف غير صحيح';
        isValid = false;
    }
    
    if (!password) {
        document.getElementById('login-password-error').textContent = 'أدخل كلمة المرور';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('login-password-error').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        isValid = false;
    }
    
    return isValid;
}

function isValidEmailOrPhone(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+2)?01[0-9]{9}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
}

function clearLoginErrors() {
    const emailErr = document.getElementById('login-email-error');
    const passErr = document.getElementById('login-password-error');
    if (emailErr) emailErr.textContent = '';
    if (passErr) passErr.textContent = '';
}

function togglePasswordVisibility(fieldId, button) {
    const field = document.getElementById(fieldId);
    if (field.type === 'password') {
        field.type = 'text';
        button.textContent = '🙈';
    } else {
        field.type = 'password';
        button.textContent = '👁️';
    }
}

async function handleFacebookAuthLogin() {
    showSnack('جاري الاتصال بفيسبوك...');
    try {
        if (typeof window.signInWithFacebookSupabase === 'function') {
            const result = await window.signInWithFacebookSupabase({
                full_name: 'مستخدم فيسبوك',
                role: 'buyer'
            });
            if (result?.success) {
                APP_STATE.isLoggedIn = true;
                persistAppState();
                updateRoleButton();
                showSnack('✅ تم تسجيل الدخول عبر فيسبوك');
                showScreen('welcome-screen');
                return;
            }
        }
        showSnack('❌ تعذر تسجيل الدخول عبر فيسبوك');
    } catch (error) {
        console.error('Facebook login error:', error);
        showSnack('❌ خطأ في الاتصال بفيسبوك');
    }
}

async function handleGoogleAuthLogin() {
    showSnack('جاري الاتصال بجوجل...');
    try {
        if (typeof window.syncGoogleAccountFromSupabase === 'function') {
            await window.syncGoogleAccountFromSupabase();
            showSnack('✅ تم تسجيل الدخول عبر جوجل');
            return;
        }
        showSnack('❌ تعذر تسجيل الدخول عبر جوجل');
    } catch (error) {
        console.error('Google login error:', error);
        showSnack('❌ خطأ في الاتصال بجوجل');
    }
}

// ===== REGISTER FUNCTIONS =====

function renderRegisterScreen() {
    return `
        <div id="register-screen" class="screen">
            <header class="main-header auth-header">
                <button class="back-btn" onclick="showScreen('welcome-screen')">◄ الرئيسية</button>
                <h2>إنشاء حساب جديد</h2>
                <p class="subtitle">انضم إلى متجرنا الآن والتمتع بالتسوق المميز</p>
            </header>
            <main class="auth-container animate-fade-in">
                <div class="auth-card">
                    <div class="auth-card-header">
                        <h3>ابدأ رحلتك معنا</h3>
                        <p>استغرق دقيقة واحدة فقط لإنشاء حسابك</p>
                    </div>

                    <form class="auth-form" id="register-form" onsubmit="handleRegisterSubmit(event)">
                        <div class="form-group">
                            <label for="register-name">الاسم الكامل</label>
                            <div class="input-wrapper">
                                <input 
                                    id="register-name" 
                                    type="text" 
                                    placeholder="اسمك بالكامل" 
                                    autocomplete="name"
                                    required
                                    aria-label="الاسم الكامل"
                                    maxlength="100"
                                >
                                <span class="input-icon">👤</span>
                            </div>
                            <small id="register-name-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group">
                            <label for="register-email">البريد الإلكتروني أو رقم الهاتف</label>
                            <div class="input-wrapper">
                                <input 
                                    id="register-email" 
                                    type="text" 
                                    placeholder="بريدك أو رقم هاتفك" 
                                    autocomplete="email"
                                    required
                                    aria-label="البريد الإلكتروني أو رقم الهاتف"
                                    maxlength="100"
                                >
                                <span class="input-icon">📧</span>
                            </div>
                            <small id="register-email-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group">
                            <label for="register-password">كلمة المرور</label>
                            <div class="input-wrapper">
                                <input 
                                    id="register-password" 
                                    type="password" 
                                    placeholder="كلمة مرور قوية (8+ أحرف)" 
                                    autocomplete="new-password"
                                    required
                                    aria-label="كلمة المرور"
                                    minlength="8"
                                    maxlength="128"
                                    onchange="checkPasswordStrength()"
                                    onkeyup="checkPasswordStrength()"
                                >
                                <button class="password-toggle" type="button" onclick="togglePasswordVisibility('register-password', this)" aria-label="إظهار كلمة المرور">👁️</button>
                            </div>
                            <small id="register-password-error" class="error-message" aria-live="polite"></small>
                            <div class="password-strength" id="password-strength" style="display:none;">
                                <div class="strength-bar"><div class="strength-fill"></div></div>
                                <small class="strength-text"></small>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="register-password-confirm">تأكيد كلمة المرور</label>
                            <div class="input-wrapper">
                                <input 
                                    id="register-password-confirm" 
                                    type="password" 
                                    placeholder="أعد كتابة كلمة المرور" 
                                    autocomplete="new-password"
                                    required
                                    aria-label="تأكيد كلمة المرور"
                                    minlength="8"
                                    maxlength="128"
                                >
                                <button class="password-toggle" type="button" onclick="togglePasswordVisibility('register-password-confirm', this)" aria-label="إظهار كلمة المرور">👁️</button>
                            </div>
                            <small id="register-password-confirm-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group">
                            <label>نوع الحساب</label>
                            <div class="account-type-selector">
                                <label class="account-type-option">
                                    <input type="radio" name="account-type" value="buyer" checked>
                                    <div class="option-card">
                                        <div class="option-icon">🛍️</div>
                                        <div class="option-title">مشتري</div>
                                        <div class="option-desc">تسوق المنتجات</div>
                                    </div>
                                </label>
                                <label class="account-type-option">
                                    <input type="radio" name="account-type" value="seller">
                                    <div class="option-card">
                                        <div class="option-icon">🏪</div>
                                        <div class="option-title">تاجر</div>
                                        <div class="option-desc">بيع منتجاتك</div>
                                    </div>
                                </label>
                            </div>
                            <small id="register-type-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="register-terms" class="checkbox-input" required>
                                <span>أوافق على 
                                    <button type="button" class="link-btn" onclick="showTermsModal()">الشروط والأحكام</button>
                                    و
                                    <button type="button" class="link-btn" onclick="showPrivacyModal()">سياسة الخصوصية</button>
                                </span>
                            </label>
                            <small id="register-terms-error" class="error-message" aria-live="polite"></small>
                        </div>

                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="register-newsletter" class="checkbox-input">
                                <span>أريد تلقي آخر العروض والأخبار</span>
                            </label>
                        </div>

                        <button type="submit" class="btn-primary btn-large" id="register-submit">
                            <span>إنشاء حساب</span>
                            <span class="btn-loader" style="display:none;">⏳</span>
                        </button>
                    </form>

                    <div class="auth-divider">
                        <span>أو</span>
                    </div>

                    <div class="social-login">
                        <button type="button" class="btn-social btn-facebook" onclick="handleFacebookAuthRegister()">
                            <span>🔵 فيسبوك</span>
                        </button>
                        <button type="button" class="btn-social btn-google" onclick="handleGoogleAuthRegister()">
                            <span>🔴 جوجل</span>
                        </button>
                    </div>

                    <div class="auth-footer">
                        <p>هل لديك حساب بالفعل؟ 
                            <button type="button" class="link-btn" onclick="showScreen('login-screen')">
                                <strong>تسجيل الدخول</strong>
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    `;
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-password-confirm');
    const termsCheckbox = document.getElementById('register-terms');
    const accountTypeRadios = document.getElementsByName('account-type');
    const submitBtn = document.getElementById('register-submit');
    const loader = submitBtn.querySelector('.btn-loader');
    
    clearRegisterErrors();
    
    const name = (nameInput?.value || '').trim();
    const identifier = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();
    const confirmPassword = (confirmPasswordInput?.value || '').trim();
    const accountType = Array.from(accountTypeRadios).find(r => r.checked)?.value || 'buyer';
    const acceptedTerms = termsCheckbox?.checked ?? false;
    
    if (!validateRegisterInputs(name, identifier, password, confirmPassword, acceptedTerms)) {
        return;
    }
    
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';
    
    try {
        if (typeof window.signUpWithSupabase === 'function') {
            const result = await window.signUpWithSupabase(identifier, password, {
                full_name: name,
                role: accountType
            });
            
            if (result.success && result.user) {
                APP_STATE.isLoggedIn = true;
                APP_STATE.accountName = name;
                APP_STATE.accountPhone = identifier;
                APP_STATE.accountMethod = 'phone';
                APP_STATE.role = accountType;
                APP_STATE.authUserId = result.user.id;
                if (accountType === 'seller') {
                    APP_STATE.sellerDisplayName = name;
                }
                persistAppState();
                updateRoleButton();
                
                showSnack('✅ تم إنشاء الحساب بنجاح! أهلا وسهلا بك');
                showScreen('welcome-screen');
                return;
            } else if (result.error === 'already_exists') {
                showSnack('❌ هذا الحساب موجود بالفعل. جرب تسجيل الدخول');
                document.getElementById('register-email-error').textContent = 'الحساب موجود بالفعل';
                emailInput.focus();
                return;
            } else {
                const errorMsg = result.message || 'فشل إنشاء الحساب';
                showSnack('❌ ' + errorMsg);
                return;
            }
        }
        
        APP_STATE.isLoggedIn = true;
        APP_STATE.accountName = name;
        APP_STATE.accountPhone = identifier;
        APP_STATE.accountMethod = 'phone';
        APP_STATE.role = accountType;
        if (accountType === 'seller') {
            APP_STATE.sellerDisplayName = name;
        }
        persistAppState();
        updateRoleButton();
        
        showSnack('✅ تم إنشاء الحساب بنجاح!');
        showScreen('welcome-screen');
        
    } catch (error) {
        console.error('Registration error:', error);
        showSnack('❌ حدث خطأ أثناء إنشاء الحساب');
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
    }
}

function validateRegisterInputs(name, identifier, password, confirmPassword, acceptedTerms) {
    let isValid = true;
    
    if (!name) {
        document.getElementById('register-name-error').textContent = 'أدخل اسمك الكامل';
        isValid = false;
    } else if (name.length < 3) {
        document.getElementById('register-name-error').textContent = 'الاسم يجب أن يكون 3 أحرف على الأقل';
        isValid = false;
    } else if (name.length > 100) {
        document.getElementById('register-name-error').textContent = 'الاسم طويل جداً';
        isValid = false;
    }
    
    if (!identifier) {
        document.getElementById('register-email-error').textContent = 'أدخل بريدك أو رقم هاتفك';
        isValid = false;
    } else if (!isValidEmailOrPhone(identifier)) {
        document.getElementById('register-email-error').textContent = 'البريد أو رقم الهاتف غير صحيح';
        isValid = false;
    }
    
    if (!password) {
        document.getElementById('register-password-error').textContent = 'أدخل كلمة مرور';
        isValid = false;
    } else if (password.length < 8) {
        document.getElementById('register-password-error').textContent = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        isValid = false;
    } else if (!isStrongPassword(password)) {
        document.getElementById('register-password-error').textContent = 'كلمة المرور ضعيفة جداً - استخدم أحرف وأرقام';
        isValid = false;
    }
    
    if (!confirmPassword) {
        document.getElementById('register-password-confirm-error').textContent = 'أكد كلمة المرور';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('register-password-confirm-error').textContent = 'كلمة المرور غير متطابقة';
        isValid = false;
    }
    
    if (!acceptedTerms) {
        document.getElementById('register-terms-error').textContent = 'يجب الموافقة على الشروط والأحكام';
        isValid = false;
    }
    
    return isValid;
}

function isStrongPassword(password) {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Zأ-ي]/.test(password);
    const hasMinLength = password.length >= 8;
    
    return hasNumber && hasLetter && hasMinLength;
}

function checkPasswordStrength() {
    const passwordInput = document.getElementById('register-password');
    const strengthDiv = document.getElementById('password-strength');
    const strengthFill = strengthDiv?.querySelector('.strength-fill');
    const strengthText = strengthDiv?.querySelector('.strength-text');
    
    if (!passwordInput?.value) {
        if (strengthDiv) strengthDiv.style.display = 'none';
        return;
    }
    
    const password = passwordInput.value;
    let strength = 0;
    let strengthLabel = 'ضعيفة جداً';
    let strengthColor = '#ff4444';
    
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    if (/\d/.test(password)) strength += 25;
    
    if (/[a-z]/.test(password)) strength += 12;
    if (/[A-Z]/.test(password)) strength += 13;
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 25;
    
    strength = Math.min(strength, 100);
    
    if (strength < 30) {
        strengthLabel = 'ضعيفة جداً';
        strengthColor = '#ff4444';
    } else if (strength < 60) {
        strengthLabel = 'متوسطة';
        strengthColor = '#ffaa44';
    } else if (strength < 85) {
        strengthLabel = 'قوية';
        strengthColor = '#88dd44';
    } else {
        strengthLabel = 'قوية جداً';
        strengthColor = '#44dd44';
    }
    
    if (strengthDiv) {
        strengthDiv.style.display = 'block';
        strengthFill.style.width = strength + '%';
        strengthFill.style.backgroundColor = strengthColor;
        strengthText.textContent = `قوة كلمة المرور: ${strengthLabel}`;
        strengthText.style.color = strengthColor;
    }
}

function clearRegisterErrors() {
    const errors = [
        'register-name-error',
        'register-email-error',
        'register-password-error',
        'register-password-confirm-error',
        'register-type-error',
        'register-terms-error'
    ];
    errors.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

async function handleFacebookAuthRegister() {
    showSnack('جاري الاتصال بفيسبوك...');
    try {
        if (typeof window.signInWithFacebookSupabase === 'function') {
            const result = await window.signInWithFacebookSupabase({
                full_name: 'مستخدم فيسبوك',
                role: Array.from(document.getElementsByName('account-type')).find(r => r.checked)?.value || 'buyer'
            });
            if (result?.success) {
                APP_STATE.isLoggedIn = true;
                persistAppState();
                updateRoleButton();
                showSnack('✅ تم إنشاء الحساب عبر فيسبوك');
                showScreen('welcome-screen');
                return;
            }
        }
        showSnack('❌ تعذر إنشاء حساب عبر فيسبوك');
    } catch (error) {
        console.error('Facebook registration error:', error);
        showSnack('❌ خطأ في الاتصال بفيسبوك');
    }
}

async function handleGoogleAuthRegister() {
    showSnack('جاري الاتصال بجوجل...');
    try {
        if (typeof window.syncGoogleAccountFromSupabase === 'function') {
            await window.syncGoogleAccountFromSupabase();
            showSnack('✅ تم إنشاء الحساب عبر جوجل');
            return;
        }
        showSnack('❌ تعذر إنشاء حساب عبر جوجل');
    } catch (error) {
        console.error('Google registration error:', error);
        showSnack('❌ خطأ في الاتصال بجوجل');
    }
}

function showTermsModal() {
    alert(`الشروط والأحكام

باستخدامك لهذا الموقع، فإنك توافق على:
• عدم بيع منتجات مزيفة أو محرمة
• احترام حقوق الملكية الفكرية
• عدم المساس بسلامة المستخدمين الآخرين
• الالتزام بالقوانين والأنظمة المحلية

للمزيد من التفاصيل، توأصل معنا عبر خدمة العملاء.`);
}

function showPrivacyModal() {
    alert(`سياسة الخصوصية

نحن نحترم خصوصيتك:
• لن نشارك بيانات بريدك مع أطراف ثالثة
• تستخدم بيانات هاتفك فقط للاتصال بخصوص طلبك
• ننتظر الطلبات لتحسين الخدمة
• يمكنك طلب حذف بيانات حسابك في أي وقت

للمزيد من التفاصيل، توأصل معنا عبر خدمة العملاء.`);
}

// Export functions to window
window.renderLoginScreen = renderLoginScreen;
window.renderRegisterScreen = renderRegisterScreen;
window.handleLoginSubmit = handleLoginSubmit;
window.handleRegisterSubmit = handleRegisterSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.checkPasswordStrength = checkPasswordStrength;
window.handleFacebookAuthLogin = handleFacebookAuthLogin;
window.handleGoogleAuthLogin = handleGoogleAuthLogin;
window.handleFacebookAuthRegister = handleFacebookAuthRegister;
window.handleGoogleAuthRegister = handleGoogleAuthRegister;
window.showTermsModal = showTermsModal;
window.showPrivacyModal = showPrivacyModal;
