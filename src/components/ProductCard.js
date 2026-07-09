function renderProductCard(productOrName, type, material, price) {
    const product = typeof productOrName === 'object' && productOrName !== null
        ? productOrName
        : { name: productOrName, type, material, price };

    const productName = product.name || 'منتج';
    const productType = product.type || 'عام';
    const productMaterial = product.material || 'غير محدد';
    const productPrice = Number(product.price || 0);
    const productStock = Number(product.stock || 0);
    const productId = product.id || '';
    const images = Array.isArray(product.images) && product.images.length
        ? product.images
        : (typeof getProductImages === 'function' ? getProductImages(productName) : [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
        ]);

    const badge = Math.random() > 0.6 ? 'الأكثر مبيعاً' : '';
    const rating = (Math.random() * 1.8 + 3.2).toFixed(1);
    const safeName = String(productName).replace(/'/g, "\\'");
    const safeType = String(productType).replace(/'/g, "\\'");
    const safeMaterial = String(productMaterial).replace(/'/g, "\\'");

    return `
        <div class="product-card animate-card" data-images='${JSON.stringify(images)}' data-product-id='${productId}' data-name='${safeName}' data-type='${safeType}' data-material='${safeMaterial}' data-price='${productPrice}' data-product-stock='${productStock}' data-product-seller='${(product.sellerName || '').replace(/'/g, "\\'")}' data-product-price-value='${productPrice}'>
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
                <p><strong>النوع:</strong> ${productType}</p>
                <p><strong>الخامة:</strong> ${productMaterial}</p>
                <p class="price">${productPrice} ج.م</p>
                <p class="stock-pill">المخزون: ${productStock}</p>
                <button class="btn-add" onclick="addToCartFromCard(this)">أضف إلى السلة</button>
                <button class="btn-order" onclick="openProductDetailFromCard(this)">عرض المنتج</button>
            </div>
        </div>
    `;
}

window.renderProductCard = renderProductCard;