/**
 * Login Page - تسجيل الدخول
 * Separate from registration for better UX
 */

function renderLoginScreen() {
    return `
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
    `;
}

/**
 * Handle login form submission with validation
 */
async function handleLoginSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit');
    const loader = submitBtn.querySelector('.btn-loader');
    
    // Clear previous errors
    clearLoginErrors();
    
    // Get values
    const identifier = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();
    
    // Validate
    if (!validateLoginInputs(identifier, password)) {
        return;
    }
    
    // Disable button and show loader
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';
    
    try {
        // Try to sign in with Supabase if available
        if (typeof window.signInWithSupabase === 'function') {
            const result = await window.signInWithSupabase(identifier, password, { 
                full_name: identifier,
                role: 'buyer'
            });
            
            if (result.success && result.user) {
                // Successful login
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
                // Failed login
                const errorMsg = result.message || 'البريد أو كلمة المرور غير صحيحة';
                showSnack('❌ ' + errorMsg);
                document.getElementById('login-password-error').textContent = errorMsg;
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }
        }
        
        // Fallback: local authentication
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

/**
 * Validate login inputs
 */
function validateLoginInputs(identifier, password) {
    let isValid = true;
    
    // Check email/phone not empty
    if (!identifier) {
        document.getElementById('login-email-error').textContent = 'أدخل بريدك أو رقم هاتفك';
        isValid = false;
    } else if (!isValidEmailOrPhone(identifier)) {
        document.getElementById('login-email-error').textContent = 'البريد أو رقم الهاتف غير صحيح';
        isValid = false;
    }
    
    // Check password not empty
    if (!password) {
        document.getElementById('login-password-error').textContent = 'أدخل كلمة المرور';
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById('login-password-error').textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate email or phone format
 */
function isValidEmailOrPhone(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+2)?01[0-9]{9}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
}

/**
 * Clear login form errors
 */
function clearLoginErrors() {
    document.getElementById('login-email-error').textContent = '';
    document.getElementById('login-password-error').textContent = '';
}

/**
 * Toggle password visibility
 */
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

/**
 * Facebook login handler
 */
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

/**
 * Google login handler
 */
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

window.renderLoginScreen = renderLoginScreen;
window.handleLoginSubmit = handleLoginSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleFacebookAuthLogin = handleFacebookAuthLogin;
window.handleGoogleAuthLogin = handleGoogleAuthLogin;
