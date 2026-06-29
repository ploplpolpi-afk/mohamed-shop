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
                    <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80" alt="تشرتات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>تشرتات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('هوديز رجالى')">
                    <img src="https://images.unsplash.com/photo-1544161515-4abf2c3f2d6a?auto=format&fit=crop&w=300&q=80" alt="هوديز" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>هوديز</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بنطلونات رجالى')">
                    <img src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80" alt="بناطيل" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بناطيل</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('ترنجات رجالى')">
                    <img src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=300&q=80" alt="ترنجات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
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
                    <img src="https://images.unsplash.com/photo-1520975916032-6b3cc4e3c2b1?auto=format&fit=crop&w=300&q=80" alt="تشرتات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>تشرتات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بناطيل حريمى')">
                    <img src="https://images.unsplash.com/photo-1520975922398-7d1bd1efb3c9?auto=format&fit=crop&w=300&q=80" alt="بناطيل" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بناطيل</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('بلوزات حريمى')">
                    <img src="https://images.unsplash.com/photo-1531123414780-f0b8a1b1d2a8?auto=format&fit=crop&w=300&q=80" alt="بلوزات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>بلوزات</span>
                </button>
                <button class="sub-item animate-card" onclick="openProductPage('دراسات حريمى')">
                    <img src="https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=300&q=80" alt="دراسات" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}'">
                    <span>دراسات</span>
                </button>
            </div>
        </main>
    `;
}