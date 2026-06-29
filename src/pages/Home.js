function renderWelcomeScreen() {
    return `
        <div class="welcome-content animate-fade-in">
            <h1>مرحبا ف متجرنا للبيع</h1>
            <p>أفضل الخامات وأحدث الصيحات بين يديك</p>
            <button id="start-btn" class="btn-primary" onclick="showScreen('categories-screen')">ابدأ</button>
        </div>
    `;
}

function renderCategoriesScreen() {
    const fallbackImg = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=200&q=80';
    return `
        <header class="main-header">
            <button class="back-btn" onclick="showScreen('welcome-screen')">◄ الرئيسية</button>
            <h2>اختر القسم</h2>
            <p class="subtitle">تسوق حسب اهتمامك</p>
        </header>
        
        <main class="categories-container animate-fade-in">
            <div class="category-card men-bg" onclick="toggleSubMenu('men-sub')">
                <div class="card-overlay">
                    <div class="card-text">
                        <h3>ملابس رجالى</h3>
                        <p>هوديز • تشرتات • بنطلونات • ترنجات</p>
                        <span class="explore-text">تصفح القسم ◄</span>
                    </div>
                </div>
            </div>
            <div id="men-sub" class="sub-menu-dropdown">
                <button class="sub-item animate-card" onclick="openProductPage('تشرتات رجالى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx0XzbT8kDJpQxwpTrD6LAKp74UO7OCu6__ByyGEQ4fUHmihUW4AIYLfUM&s=10" alt="تشرتات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>تشرتات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('هوديز رجالى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmdSvDFpEqFEpEG5iBvEDa7eWDy4bmhnGA_mwdyTJYeAOaUW5a1DB61A5N&s=10" alt="هوديز" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>هوديز</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بنطلونات رجالى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtaVQMpuA_086We4-MHK9seNOO_YFED2nj9aUlrsiuIg&s=10" alt="بناطيل" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بناطيل</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('ترنجات رجالى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqCePrvCS4wPO0agge5BBCRSFN3c2b-NfAFpjA-2IaHG7MWvjbwxbvM1s&s=10" alt="ترنجات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>ترنجات</span>
                </button>
            </div>

            <div class="category-card women-bg" onclick="toggleSubMenu('women-sub')">
                <div class="card-overlay">
                    <div class="card-text">
                        <h3>ملابس حريمى</h3>
                        <p>تشرتات • بناطيل • بلوزات • دراسات</p>
                        <span class="explore-text">تصفح القسم ◄</span>
                    </div>
                </div>
            </div>
            <div id="women-sub" class="sub-menu-dropdown">
                <button class="sub-item animate-card" onclick="openProductPage('تشرتات حريمى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNtncZH6wrv8iPmIKDQia9OtKlGF7N1p9ZTk7V0WFJavYUDDhQZykqDTa6&s=10" alt="تشرتات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>تشرتات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بناطيل حريمى')">
                    <img src="https://p.globalsources.com/IMAGES/PDT/S1222010627/petite-women-s-cargo-pants.png?ver=6063515456" alt="بناطيل" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بناطيل</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بلوزات حريمى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQZaf8rAl-eeKpDlTmBNZrfEaRVAKsNqVcUcqz0cO_7kE51oEPyPOW5rhq&s=10" alt="بلوزات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بلوزات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('دراسات حريمى')">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8Jkf57JsmDoqBZHI6H-Gt3E2eN30Q3zlZKHJcZYw2UcCi36aZJ-ldDOeK&s=10" alt="دراسات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>دراسات</span>
                </button>
            </div>
        </main>
    `;
}