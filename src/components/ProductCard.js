function renderProductCard(productName, type, material, price) {
    const images = typeof getProductImages === 'function' ? getProductImages(productName) : [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ];

    // small randomization for demo: some items get 'Bestseller' badge and rating
    const badge = Math.random() > 0.6 ? 'الأكثر مبيعاً' : '';
    const rating = (Math.random() * 1.8 + 3.2).toFixed(1); // 3.2 - 5.0

    return `
        <div class="product-card animate-card" data-images='${JSON.stringify(images)}' data-name='${productName.replace(/'/g, "\\'")}' data-type='${type.replace(/'/g, "\\'")}' data-material='${material.replace(/'/g, "\\'")}' data-price='${price}'>
            ${badge ? `<div class="product-badge">${badge}</div>` : ''}
            <div class="img-container">
                <img src="${images[0]}" data-src="${images[0]}" alt="${productName}" class="product-img" loading="lazy">
            </div>

            <div class="card-actions">
                <button class="card-action" title="إضافة للمفضلة">♡</button>
                <button class="card-action" title="مقارنة">⇄</button>
            </div>

            <div class="thumbs-wrapper">
                <button class="thumb-nav prev" aria-label="previous thumbnails" onclick="thumbNav(this,'prev')">‹</button>
                <div class="thumbs">
                    ${images.map(src => `<img src="${src}" data-src="${src}" alt="thumb" class="thumb" loading="lazy" onclick="setMainImage(this)">`).join('')}
                </div>
                <button class="thumb-nav next" aria-label="next thumbnails" onclick="thumbNav(this,'next')">›</button>
            </div>

            <div class="product-info">
                <h3>${productName}</h3>
                <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;">
                    <div class="product-rating"><span class="star"></span><span>${rating}</span></div>
                </div>
                <p><strong>النوع:</strong> ${type}</p>
                <p><strong>الخامة:</strong> ${material}</p>
                <p class="price">${price} ج.م</p>
                <button class="btn-add" onclick="addToCart('${productName}', ${price})">أضف إلى السلة</button>
                <button class="btn-order" onclick="openProductDetailFromCard(this)">عرض المنتج</button>
            </div>
        </div>
    `;
}