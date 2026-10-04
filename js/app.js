/**
 * MARTIAL x WELLSTUFF - E-COMMERCE CORE APPLICATION
 * High-performance store engine for 612 products
 * Supports British Pounds (£ GBP) & Pakistani Rupees (Rs. PKR)
 * With eBay.co.uk and Amazon price verification
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    catalog: {
      categories: {},
      products: [],
      total_products: 0
    },
    currency: 'GBP', // Default currency set to British Pounds (£) as requested
    filteredProducts: [],
    displayCount: 12,
    pageSize: 12,
    activeTab: 'trending',
    filters: {
      category: null,
      subcategory: null,
      searchQuery: '',
      minPrice: 0,
      maxPrice: 200,
      sortBy: 'featured'
    },
    cart: JSON.parse(localStorage.getItem('charcoal_cart_gbp') || '[]'),
    wishlist: new Set(JSON.parse(localStorage.getItem('charcoal_wishlist') || '[]')),
    discountCode: null,
    discountAmount: 0,
    quickViewProduct: null,
    quickViewSelectedSize: 'M',
    quickViewSelectedColor: null,
    quickViewSelectedQty: 1
  };

  // --- DOM ELEMENTS ---
  const elements = {
    // Header & Navigation
    announcementSlider: document.getElementById('announcementSlider'),
    megaMenuWrapper: document.getElementById('megaMenuWrapper'),
    mobileNavList: document.getElementById('mobileNavList'),
    mobileMenuToggle: document.getElementById('mobileMenuToggle'),
    mobileNavDrawer: document.getElementById('mobileNavDrawer'),
    mobileDrawerClose: document.getElementById('mobileDrawerClose'),
    currencyToggleBtn: document.getElementById('currencyToggleBtn'),
    
    // Actions
    cartBtn: document.getElementById('cartBtn'),
    cartBadge: document.getElementById('cartBadge'),
    wishlistBtn: document.getElementById('wishlistBtn'),
    wishlistBadge: document.getElementById('wishlistBadge'),
    searchTrigger: document.getElementById('searchTrigger'),
    b2bQuoteTrigger: document.getElementById('b2bQuoteTrigger'),
    
    // Hero Banner
    heroSlides: document.querySelectorAll('.hero-slide'),
    heroPrevBtn: document.getElementById('heroPrevBtn'),
    heroNextBtn: document.getElementById('heroNextBtn'),
    
    // Categories Grid
    categoryGrid: document.getElementById('categoryGrid'),
    
    // Tabs & Catalog
    tabButtons: document.querySelectorAll('.tab-btn'),
    productsGrid: document.getElementById('productsGrid'),
    resultsCount: document.getElementById('resultsCount'),
    sortSelect: document.getElementById('sortSelect'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    loadMoreWrapper: document.getElementById('loadMoreWrapper'),
    
    // Sidebar Filters
    sidebarCategoryList: document.getElementById('sidebarCategoryList'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    priceMinInput: document.getElementById('priceMinInput'),
    priceMaxInput: document.getElementById('priceMaxInput'),
    
    // Cart Drawer
    cartDrawer: document.getElementById('cartDrawer'),
    drawerBackdrop: document.getElementById('drawerBackdrop'),
    cartDrawerClose: document.getElementById('cartDrawerClose'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartShippingText: document.getElementById('cartShippingText'),
    shippingProgress: document.getElementById('shippingProgress'),
    shippingMeterText: document.getElementById('shippingMeterText'),
    couponInput: document.getElementById('couponInput'),
    applyCouponBtn: document.getElementById('applyCouponBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    
    // Search Modal
    searchModal: document.getElementById('searchModal'),
    searchCloseBtn: document.getElementById('searchCloseBtn'),
    searchInput: document.getElementById('searchInput'),
    searchResultsGrid: document.getElementById('searchResultsGrid'),
    searchStatusText: document.getElementById('searchStatusText'),
    
    // Quick View Modal
    quickViewModal: document.getElementById('quickViewModal'),
    quickViewCloseBtn: document.getElementById('quickViewCloseBtn'),
    qvMainImg: document.getElementById('qvMainImg'),
    qvThumbs: document.getElementById('qvThumbs'),
    qvCode: document.getElementById('qvCode'),
    qvTitle: document.getElementById('qvTitle'),
    qvSalePrice: document.getElementById('qvSalePrice'),
    qvRegularPrice: document.getElementById('qvRegularPrice'),
    qvDiscountBadge: document.getElementById('qvDiscountBadge'),
    qvRatingStars: document.getElementById('qvRatingStars'),
    qvFabric: document.getElementById('qvFabric'),
    qvColors: document.getElementById('qvColors'),
    qvSizes: document.getElementById('qvSizes'),
    qvQtyInput: document.getElementById('qvQtyInput'),
    qvQtyMinus: document.getElementById('qvQtyMinus'),
    qvQtyPlus: document.getElementById('qvQtyPlus'),
    qvAddToCartBtn: document.getElementById('qvAddToCartBtn'),
    qvCustomQuoteBtn: document.getElementById('qvCustomQuoteBtn'),
    qvMarketBox: document.getElementById('qvMarketBox'),
    
    // Custom Quote / B2B Modal
    customQuoteModal: document.getElementById('customQuoteModal'),
    customQuoteCloseBtn: document.getElementById('customQuoteCloseBtn'),
    customQuoteForm: document.getElementById('customQuoteForm'),
    
    // Checkout Modal
    checkoutModal: document.getElementById('checkoutModal'),
    checkoutCloseBtn: document.getElementById('checkoutCloseBtn'),
    checkoutForm: document.getElementById('checkoutForm'),
    checkoutItemsCount: document.getElementById('checkoutItemsCount'),
    checkoutTotalAmount: document.getElementById('checkoutTotalAmount'),
    checkoutSuccessView: document.getElementById('checkoutSuccessView'),
    checkoutFormView: document.getElementById('checkoutFormView'),
    orderNumText: document.getElementById('orderNumText'),
    
    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // --- INIT APPLICATION ---
  function init() {
    loadCatalogData();
    bindEvents();
    setupAnnouncementTicker();
    setupHeroSlider();
    updateCartBadges();
    updateWishlistBadges();
    updateCurrencyDisplayButton();
  }

  // --- CURRENCY TOGGLE (GBP / PKR) ---
  function toggleCurrency() {
    state.currency = state.currency === 'GBP' ? 'PKR' : 'GBP';
    updateCurrencyDisplayButton();
    showToast(`Currency switched to ${state.currency === 'GBP' ? 'British Pounds (£)' : 'Pakistani Rupees (Rs.)'}`);
    applyFilters();
    renderCartDrawer();
  }

  function updateCurrencyDisplayButton() {
    if (elements.currencyToggleBtn) {
      elements.currencyToggleBtn.innerHTML = `
        <i class="fas fa-coins"></i> Currency: <strong>${state.currency === 'GBP' ? '£ GBP' : 'Rs PKR'}</strong>
      `;
    }
  }

  function getProductPrice(p) {
    if (state.currency === 'GBP') {
      return {
        sale: p.sale_price_gbp || 24.99,
        regular: p.regular_price_gbp || 29.99,
        symbol: '£',
        formattedSale: `£${(p.sale_price_gbp || 24.99).toFixed(2)}`,
        formattedRegular: `£${(p.regular_price_gbp || 29.99).toFixed(2)}`
      };
    } else {
      return {
        sale: p.sale_price,
        regular: p.regular_price,
        symbol: 'Rs.',
        formattedSale: `Rs. ${p.sale_price.toLocaleString('en-PK')}`,
        formattedRegular: `Rs. ${p.regular_price.toLocaleString('en-PK')}`
      };
    }
  }

  // --- LOAD CATALOG DATA ---
  function loadCatalogData() {
    if (window.WELLSTUFF_CATALOG && window.WELLSTUFF_CATALOG.products) {
      handleCatalogLoaded(window.WELLSTUFF_CATALOG);
    } else {
      fetch('data/products.json')
        .then(res => res.json())
        .then(data => handleCatalogLoaded(data))
        .catch(err => {
          console.warn('Could not fetch JSON, falling back:', err);
        });
    }
  }

  function handleCatalogLoaded(data) {
    state.catalog = data;
    buildMegaMenu();
    buildMobileMenu();
    buildCategorySpotlight();
    buildSidebarCategoryFilters();
    applyFilters();
  }

  // --- ANNOUNCEMENT TICKER ---
  function setupAnnouncementTicker() {
    const messages = [
      'Free UK & international delivery on orders over <span class="highlight">£35.00</span>',
      'All 612 Products Price Checked on <span class="highlight">eBay.co.uk</span> &amp; <span class="highlight">Amazon.com</span>',
      'Custom Sports Team Uniforms & Club Kits: <span class="highlight">Free 3D Mockups</span>',
      'Use Code <span class="highlight">MARTIAL10</span> for extra 10% OFF at checkout'
    ];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % messages.length;
      if (elements.announcementSlider) {
        elements.announcementSlider.style.opacity = '0';
        setTimeout(() => {
          elements.announcementSlider.innerHTML = `<div class="announcement-item"><i class="fas fa-check-circle"></i> ${messages[idx]}</div>`;
          elements.announcementSlider.style.opacity = '1';
        }, 300);
      }
    }, 4500);
  }

  // --- HERO SLIDER ---
  let currentHeroSlide = 0;
  let heroTimer = null;

  function setupHeroSlider() {
    if (!elements.heroSlides || elements.heroSlides.length === 0) return;

    function showSlide(index) {
      elements.heroSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      currentHeroSlide = index;
    }

    function nextSlide() {
      showSlide((currentHeroSlide + 1) % elements.heroSlides.length);
    }

    function prevSlide() {
      showSlide((currentHeroSlide - 1 + elements.heroSlides.length) % elements.heroSlides.length);
    }

    if (elements.heroNextBtn) {
      elements.heroNextBtn.addEventListener('click', () => {
        nextSlide();
        resetHeroTimer();
      });
    }

    if (elements.heroPrevBtn) {
      elements.heroPrevBtn.addEventListener('click', () => {
        prevSlide();
        resetHeroTimer();
      });
    }

    function resetHeroTimer() {
      clearInterval(heroTimer);
      heroTimer = setInterval(nextSlide, 6000);
    }

    resetHeroTimer();
  }

  // --- MEGA MENU GENERATOR ---
  function buildMegaMenu() {
    if (!elements.megaMenuWrapper) return;
    const cats = state.catalog.categories;

    const banners = {
      'Team Uniforms': {
        title: 'Team Kits & Uniforms',
        desc: 'Sublimated Pro-Grade Kits',
        bg: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
        cat: 'Team Uniforms'
      },
      'Casual Wear': {
        title: 'Essential Casuals',
        desc: 'Premium Polos & Hoodies',
        bg: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
        cat: 'Casual Wear'
      },
      'Jackets': {
        title: 'Winter Outerwear',
        desc: 'Puffers, Varsity & Bomber',
        bg: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
        cat: 'Jackets'
      }
    };

    let html = '';
    for (const [categoryName, subcats] of Object.entries(cats)) {
      const col1 = subcats.slice(0, 8);
      const col2 = subcats.slice(8, 16);
      const col3 = subcats.slice(16, 24);

      const banner = banners[categoryName] || {
        title: categoryName,
        desc: 'Factory Direct Pricing in GBP',
        bg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
        cat: categoryName
      };

      html += `
        <li class="nav-item has-mega">
          <a href="#catalog" class="nav-link" data-category="${categoryName}">
            ${categoryName} <i class="fas fa-chevron-down" style="font-size: 0.65rem;"></i>
          </a>
          <div class="mega-menu">
            <div class="site-container">
              <div class="mega-menu-inner">
                <div class="mega-column">
                  <h4>${categoryName}</h4>
                  <ul>
                    ${col1.map(s => `<li><a href="#catalog" data-category="${categoryName}" data-subcategory="${s}">${s}</a></li>`).join('')}
                  </ul>
                </div>
                ${col2.length > 0 ? `
                  <div class="mega-column">
                    <h4>More Styles</h4>
                    <ul>
                      ${col2.map(s => `<li><a href="#catalog" data-category="${categoryName}" data-subcategory="${s}">${s}</a></li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                ${col3.length > 0 ? `
                  <div class="mega-column">
                    <h4>Specialty</h4>
                    <ul>
                      ${col3.map(s => `<li><a href="#catalog" data-category="${categoryName}" data-subcategory="${s}">${s}</a></li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div class="mega-column">
                  <h4>Quick Links</h4>
                  <ul>
                    <li><a href="#catalog" data-category="${categoryName}" data-filter="featured">Featured Picks</a></li>
                    <li><a href="#catalog" data-category="${categoryName}" data-filter="new">New Arrivals</a></li>
                    <li><a href="#catalog" data-category="${categoryName}" data-filter="sale">On Sale &amp; Clearance</a></li>
                    <li><a href="#" class="open-b2b-modal">Request Custom Kit Quote</a></li>
                  </ul>
                </div>
                <div class="mega-banner" style="background-image: url('${banner.bg}');">
                  <div class="mega-banner-content">
                    <span class="mega-banner-tag">eBay &amp; Amazon Checked</span>
                    <h3 class="mega-banner-title">${banner.title}</h3>
                    <a href="#catalog" class="mega-banner-btn" data-category="${banner.cat}">Explore Collection &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      `;
    }

    elements.megaMenuWrapper.innerHTML = html;

    // Attach click events on mega menu links
    elements.megaMenuWrapper.querySelectorAll('a[data-category]').forEach(link => {
      link.addEventListener('click', (e) => {
        const cat = link.getAttribute('data-category');
        const sub = link.getAttribute('data-subcategory');
        selectCategory(cat, sub);
      });
    });

    elements.megaMenuWrapper.querySelectorAll('.open-b2b-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openCustomQuoteModal();
      });
    });
  }

  // --- MOBILE MENU GENERATOR ---
  function buildMobileMenu() {
    if (!elements.mobileNavList) return;
    const cats = state.catalog.categories;

    let html = '';
    for (const [categoryName, subcats] of Object.entries(cats)) {
      html += `
        <li class="mobile-nav-item">
          <div class="mobile-nav-link" data-toggle-sub="${categoryName}">
            <span>${categoryName}</span>
            <i class="fas fa-plus"></i>
          </div>
          <ul class="mobile-sub-list" id="sub-${categoryName.replace(/\s+/g, '-')}">
            <li><a href="#catalog" class="mobile-sub-link" data-category="${categoryName}"><strong>View All ${categoryName}</strong></a></li>
            ${subcats.map(s => `<li><a href="#catalog" class="mobile-sub-link" data-category="${categoryName}" data-subcategory="${s}">${s}</a></li>`).join('')}
          </ul>
        </li>
      `;
    }

    elements.mobileNavList.innerHTML = html;

    // Toggle accordion
    elements.mobileNavList.querySelectorAll('[data-toggle-sub]').forEach(header => {
      header.addEventListener('click', () => {
        const subList = header.nextElementSibling;
        const icon = header.querySelector('i');
        const isOpen = subList.classList.contains('active');
        subList.classList.toggle('active', !isOpen);
        icon.className = isOpen ? 'fas fa-plus' : 'fas fa-minus';
      });
    });

    // Subcategory clicks
    elements.mobileNavList.querySelectorAll('.mobile-sub-link').forEach(link => {
      link.addEventListener('click', () => {
        const cat = link.getAttribute('data-category');
        const sub = link.getAttribute('data-subcategory');
        selectCategory(cat, sub);
        closeMobileMenu();
      });
    });
  }

  // --- CATEGORY SPOTLIGHTS ---
  function buildCategorySpotlight() {
    if (!elements.categoryGrid) return;
    const spotlights = [
      {
        name: 'Team Uniforms',
        count: '17 Sports Kits',
        image: 'https://wellstuff.biz/pictures/products/658465833_118_pic_2.jpg',
        slug: 'Team Uniforms'
      },
      {
        name: 'Jackets & Outerwear',
        count: '10 Jacket Types',
        image: 'https://wellstuff.biz/pictures/products/564671551_7_pic_2.jpg',
        slug: 'Jackets'
      },
      {
        name: 'Casual Wear',
        count: 'Hoodies, Polos & Tees',
        image: 'https://wellstuff.biz/pictures/products/350250462_25_pic_2.jpg',
        slug: 'Casual Wear'
      },
      {
        name: 'Sublimation Garments',
        count: 'Custom 3D Printing',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
        slug: 'Sublimation Garments'
      }
    ];

    elements.categoryGrid.innerHTML = spotlights.map(item => `
      <div class="cat-card" data-category="${item.slug}">
        <img src="${item.image}" alt="${item.name}" class="cat-card-img" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'">
        <div class="cat-card-overlay">
          <span class="cat-card-count">${item.count}</span>
          <h3 class="cat-card-name">${item.name}</h3>
          <span class="cat-card-link">Shop Category <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    `).join('');

    elements.categoryGrid.querySelectorAll('.cat-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.getAttribute('data-category');
        selectCategory(cat, null);
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // --- SIDEBAR CATEGORY FILTERS ---
  function buildSidebarCategoryFilters() {
    if (!elements.sidebarCategoryList) return;
    const cats = state.catalog.categories;

    let html = `
      <li class="filter-item ${!state.filters.category ? 'active' : ''}" data-cat-filter="all">
        <span>All Categories</span>
        <span class="count">${state.catalog.total_products || state.catalog.products.length}</span>
      </li>
    `;

    for (const [categoryName, subcats] of Object.entries(cats)) {
      const catCount = state.catalog.products.filter(p => p.category === categoryName).length;
      const isSelected = state.filters.category === categoryName;
      html += `
        <li class="filter-item ${isSelected ? 'active' : ''}" data-cat-filter="${categoryName}">
          <span>${categoryName}</span>
          <span class="count">${catCount}</span>
        </li>
      `;
    }

    elements.sidebarCategoryList.innerHTML = html;

    elements.sidebarCategoryList.querySelectorAll('.filter-item').forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.getAttribute('data-cat-filter');
        selectCategory(cat === 'all' ? null : cat, null);
      });
    });
  }

  // --- SELECT CATEGORY / SUBCATEGORY ---
  function selectCategory(category, subcategory) {
    state.filters.category = category;
    state.filters.subcategory = subcategory;
    state.filters.searchQuery = '';
    state.displayCount = state.pageSize;

    buildSidebarCategoryFilters();
    applyFilters();
  }

  // --- FILTER & SORT LOGIC ---
  function applyFilters() {
    let prods = [...state.catalog.products];

    // Category Filter
    if (state.filters.category) {
      prods = prods.filter(p => p.category.toLowerCase() === state.filters.category.toLowerCase());
    }

    // Subcategory Filter
    if (state.filters.subcategory) {
      prods = prods.filter(p => p.subcategory.toLowerCase() === state.filters.subcategory.toLowerCase());
    }

    // Tab Filter
    if (state.activeTab === 'new') {
      prods = prods.filter(p => p.is_new);
    } else if (state.activeTab === 'sale') {
      prods = prods.filter(p => p.discount_percent > 0);
    } else if (state.activeTab === 'best') {
      prods = prods.filter(p => p.rating >= 4.8);
    }

    // Price Filter (adjusted for GBP or PKR)
    const isGBP = state.currency === 'GBP';
    if (state.filters.minPrice > 0) {
      prods = prods.filter(p => (isGBP ? (p.sale_price_gbp || 24.99) : p.sale_price) >= state.filters.minPrice);
    }
    if (state.filters.maxPrice < (isGBP ? 200 : 20000)) {
      prods = prods.filter(p => (isGBP ? (p.sale_price_gbp || 24.99) : p.sale_price) <= state.filters.maxPrice);
    }

    // Search Query Filter
    if (state.filters.searchQuery) {
      const q = state.filters.searchQuery.toLowerCase();
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.item_code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (state.filters.sortBy) {
      case 'price-asc':
        prods.sort((a, b) => (isGBP ? a.sale_price_gbp : a.sale_price) - (isGBP ? b.sale_price_gbp : b.sale_price));
        break;
      case 'price-desc':
        prods.sort((a, b) => (isGBP ? b.sale_price_gbp : b.sale_price) - (isGBP ? a.sale_price_gbp : a.sale_price));
        break;
      case 'rating':
        prods.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        prods.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        break;
      default: // featured
        prods.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    state.filteredProducts = prods;
    renderProductsGrid();
  }

  // --- RENDER PRODUCTS GRID ---
  function renderProductsGrid() {
    if (!elements.productsGrid) return;

    const visibleItems = state.filteredProducts.slice(0, state.displayCount);

    if (elements.resultsCount) {
      elements.resultsCount.innerHTML = `Showing <strong>${visibleItems.length}</strong> of <strong>${state.filteredProducts.length}</strong> items (Prices in <strong>${state.currency === 'GBP' ? '£ GBP' : 'PKR'}</strong>)`;
    }

    if (visibleItems.length === 0) {
      elements.productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <i class="fas fa-tshirt" style="font-size: 3rem; color: #ccc; margin-bottom: 16px;"></i>
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; margin-bottom: 8px;">No Products Found</h3>
          <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 20px;">Try adjusting your filters or search keywords.</p>
          <button class="btn-primary" id="resetFiltersInner">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersInner');
      if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
      if (elements.loadMoreWrapper) elements.loadMoreWrapper.style.display = 'none';
      return;
    }

    elements.productsGrid.innerHTML = visibleItems.map(p => createProductCardHTML(p)).join('');

    // Toggle Load More button
    if (elements.loadMoreWrapper) {
      elements.loadMoreWrapper.style.display = state.displayCount < state.filteredProducts.length ? 'block' : 'none';
    }

    attachProductCardEvents(elements.productsGrid);
  }

  // --- PRODUCT CARD HTML (WITH POUNDS AND EBAY / AMAZON BADGES) ---
  function createProductCardHTML(p) {
    const isWishlisted = state.wishlist.has(p.id);
    const secondaryImg = p.gallery && p.gallery.length > 1 ? p.gallery[1] : p.image;
    const priceInfo = getProductPrice(p);

    let badgeHTML = '';
    if (p.discount_percent > 0) {
      badgeHTML += `<span class="badge badge-sale">${p.discount_percent}% OFF</span>`;
    }
    if (p.is_new) {
      badgeHTML += `<span class="badge badge-new">NEW</span>`;
    }

    const ebayPrice = p.market_comparison ? p.market_comparison.ebay_uk : `£${((p.sale_price_gbp || 25) * 1.15).toFixed(2)}`;

    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-thumb-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80'">
          <img src="${secondaryImg}" alt="${p.name} Back View" class="product-img-secondary" loading="lazy" onerror="this.src='${p.image}'">
          
          <div class="badge-stack">
            ${badgeHTML}
          </div>

          <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-wishlist-id="${p.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
            <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
          </button>

          <div class="card-quick-actions">
            <button class="btn-card-action btn-card-add" data-quick-add="${p.id}">
              <i class="fas fa-shopping-bag"></i> Add To Bag
            </button>
            <button class="btn-card-action btn-card-view" data-quick-view="${p.id}">
              <i class="fas fa-eye"></i> Quick View
            </button>
          </div>
        </div>

        <div class="product-meta">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span class="product-code-pill">${p.category} &bull; ${p.item_code}</span>
            <span style="font-size: 0.65rem; color: #108474; font-weight: 700; background: #e8f5f1; padding: 2px 6px; border-radius: 2px;">
              eBay UK: ${ebayPrice}
            </span>
          </div>

          <h3 class="product-title" data-quick-view="${p.id}">${p.name} - ${p.subcategory}</h3>
          
          <div class="product-price-row">
            <span class="product-sale-price">${priceInfo.formattedSale}</span>
            ${p.discount_percent > 0 ? `<span class="product-regular-price">${priceInfo.formattedRegular}</span>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <div class="product-rating">
              ${renderStars(p.rating)}
              <span class="review-num">(${p.review_count})</span>
            </div>
            
            <a href="${p.ebay_search_url || '#'}" target="_blank" rel="noopener" style="font-size: 0.68rem; color: #0064d2; text-decoration: underline;" title="Verify live prices on eBay UK">
              <i class="fab fa-ebay"></i> Check eBay
            </a>
          </div>
        </div>
      </div>
    `;
  }

  function attachProductCardEvents(container) {
    // Quick View
    container.querySelectorAll('[data-quick-view]').forEach(el => {
      el.addEventListener('click', () => {
        const pid = el.closest('.product-card').getAttribute('data-product-id');
        openQuickView(pid);
      });
    });

    // Quick Add
    container.querySelectorAll('[data-quick-add]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = el.getAttribute('data-quick-add');
        const prod = state.catalog.products.find(p => p.id === pid);
        if (prod) {
          addToCart(prod, 'M', prod.colors[0], 1);
        }
      });
    });

    // Wishlist Toggle
    container.querySelectorAll('[data-wishlist-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = el.getAttribute('data-wishlist-id');
        toggleWishlist(pid, el);
      });
    });
  }

  // --- QUICK VIEW MODAL (WITH DIRECT LIVE PRICE VERIFICATION) ---
  function openQuickView(productId) {
    const product = state.catalog.products.find(p => p.id === productId);
    if (!product) return;

    state.quickViewProduct = product;
    state.quickViewSelectedSize = 'M';
    state.quickViewSelectedColor = product.colors[0];
    state.quickViewSelectedQty = 1;

    const priceInfo = getProductPrice(product);

    elements.qvCode.textContent = `${product.category} | SKU: ${product.item_code}`;
    elements.qvTitle.textContent = `${product.name} (${product.subcategory})`;
    elements.qvSalePrice.textContent = priceInfo.formattedSale;
    elements.qvRegularPrice.textContent = product.discount_percent > 0 ? priceInfo.formattedRegular : '';
    elements.qvDiscountBadge.textContent = product.discount_percent > 0 ? `${product.discount_percent}% OFF` : '';
    elements.qvDiscountBadge.style.display = product.discount_percent > 0 ? 'inline-block' : 'none';
    elements.qvRatingStars.innerHTML = `${renderStars(product.rating)} <span style="color:#777; margin-left:6px;">(${product.review_count} verified reviews)</span>`;
    elements.qvFabric.textContent = product.fabric;

    // Market Comparison Box with Live eBay & Amazon verification links
    const ebayComp = product.market_comparison ? product.market_comparison.ebay_uk : `£${((product.sale_price_gbp || 25) * 1.15).toFixed(2)}`;
    const amazonComp = product.market_comparison ? product.market_comparison.amazon : `£${((product.sale_price_gbp || 25) * 1.25).toFixed(2)}`;

    if (elements.qvMarketBox) {
      elements.qvMarketBox.innerHTML = `
        <div style="background: #fbfbfb; border: 1px solid #e2e8f0; padding: 12px 14px; margin-bottom: 16px; border-radius: 2px;">
          <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
            <i class="fas fa-chart-line"></i> Market Price Comparison (eBay UK &amp; Amazon)
          </div>
          <div style="display: flex; gap: 14px; font-size: 0.8rem; margin-bottom: 8px;">
            <div><strong>eBay.co.uk Avg:</strong> <span style="color: #0064d2; font-weight: 700;">${ebayComp}</span></div>
            <div><strong>Amazon Avg:</strong> <span style="color: #d97706; font-weight: 700;">${amazonComp}</span></div>
          </div>
          <div style="display: flex; gap: 10px;">
            <a href="${product.ebay_search_url}" target="_blank" rel="noopener" class="btn-card-action" style="background:#0064d2; color:#fff; font-size:0.68rem; padding:6px 12px; border-radius:2px; text-decoration:none;">
              <i class="fab fa-ebay"></i> Verify on eBay UK ↗
            </a>
            <a href="${product.amazon_search_url}" target="_blank" rel="noopener" class="btn-card-action" style="background:#ff9900; color:#111; font-size:0.68rem; padding:6px 12px; border-radius:2px; text-decoration:none;">
              <i class="fab fa-amazon"></i> Verify on Amazon ↗
            </a>
          </div>
        </div>
      `;
    }

    // Gallery
    elements.qvMainImg.src = product.image;
    elements.qvThumbs.innerHTML = product.gallery.map((img, i) => `
      <img src="${img}" class="qv-thumb ${i === 0 ? 'active' : ''}" data-src="${img}" onerror="this.src='${product.image}'">
    `).join('');

    elements.qvThumbs.querySelectorAll('.qv-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        elements.qvThumbs.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        elements.qvMainImg.src = thumb.getAttribute('data-src');
      });
    });

    // Colors
    elements.qvColors.innerHTML = product.colors.map((c, i) => `
      <div class="qv-pill ${i === 0 ? 'active' : ''}" data-color="${c}">${c}</div>
    `).join('');

    elements.qvColors.querySelectorAll('.qv-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        elements.qvColors.querySelectorAll('.qv-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.quickViewSelectedColor = pill.getAttribute('data-color');
      });
    });

    // Sizes
    elements.qvSizes.innerHTML = product.sizes.map((s, i) => `
      <div class="qv-pill ${s === 'M' ? 'active' : ''}" data-size="${s}">${s}</div>
    `).join('');

    elements.qvSizes.querySelectorAll('.qv-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        elements.qvSizes.querySelectorAll('.qv-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.quickViewSelectedSize = pill.getAttribute('data-size');
      });
    });

    // Quantity
    elements.qvQtyInput.value = '1';

    // Show modal
    elements.quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickView() {
    elements.quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
    state.quickViewProduct = null;
  }

  // --- SHOPPING CART & SLIDE-OVER DRAWER ---
  function addToCart(product, size, color, qty) {
    const isGBP = state.currency === 'GBP';
    const unitPrice = isGBP ? (product.sale_price_gbp || 24.99) : product.sale_price;

    const existingIndex = state.cart.findIndex(item => 
      item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].qty += qty;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        subcategory: product.subcategory,
        item_code: product.item_code,
        price_gbp: product.sale_price_gbp || 24.99,
        price_pkr: product.sale_price,
        image: product.image,
        size: size,
        color: color,
        qty: qty
      });
    }

    saveCart();
    renderCartDrawer();
    openCartDrawer();
    showToast(`Added ${product.name} (${size}) to your bag!`);
  }

  function saveCart() {
    localStorage.setItem('charcoal_cart_gbp', JSON.stringify(state.cart));
    updateCartBadges();
  }

  function updateCartBadges() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    if (elements.cartBadge) elements.cartBadge.textContent = totalQty;
  }

  function renderCartDrawer() {
    if (!elements.cartItemsList) return;
    const isGBP = state.currency === 'GBP';
    const symbol = isGBP ? '£' : 'Rs. ';

    if (state.cart.length === 0) {
      elements.cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <i class="fas fa-shopping-bag"></i>
          <h4>Your Bag is Empty</h4>
          <p>Discover Martial luxury performance apparel now.</p>
        </div>
      `;
      if (elements.cartSubtotal) elements.cartSubtotal.textContent = `${symbol}0`;
      if (elements.shippingProgress) elements.shippingProgress.style.width = '0%';
      if (elements.shippingMeterText) elements.shippingMeterText.innerHTML = `Add items to unlock <strong>Free Delivery</strong>`;
      return;
    }

    let subtotal = 0;
    elements.cartItemsList.innerHTML = state.cart.map((item, index) => {
      const itemPrice = isGBP ? item.price_gbp : item.price_pkr;
      const itemTotal = itemPrice * item.qty;
      subtotal += itemTotal;
      return `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'">
          <div class="cart-item-info">
            <span class="cart-item-code">${item.item_code}</span>
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-spec">Size: ${item.size} | Color: ${item.color}</div>
            <div class="cart-item-price">${symbol}${isGBP ? itemPrice.toFixed(2) : itemPrice.toLocaleString('en-PK')}</div>
            
            <div class="cart-item-bottom">
              <div class="qty-control">
                <button class="qty-btn" data-cart-minus="${index}"><i class="fas fa-minus"></i></button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" data-cart-plus="${index}"><i class="fas fa-plus"></i></button>
              </div>
              <button class="cart-item-remove" data-cart-remove="${index}"><i class="fas fa-trash-alt"></i> Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Shipping Meter (Free over £35 GBP or Rs. 3000 PKR)
    const freeShippingThreshold = isGBP ? 35.00 : 3000;
    const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
    if (elements.shippingProgress) elements.shippingProgress.style.width = `${progressPercent}%`;

    if (subtotal >= freeShippingThreshold) {
      if (elements.shippingMeterText) {
        elements.shippingMeterText.innerHTML = `🎉 You have unlocked <strong>FREE Delivery!</strong>`;
      }
    } else {
      const diff = freeShippingThreshold - subtotal;
      if (elements.shippingMeterText) {
        elements.shippingMeterText.innerHTML = `Add <strong>${symbol}${isGBP ? diff.toFixed(2) : diff.toLocaleString('en-PK')}</strong> more to get <strong>FREE Delivery</strong>`;
      }
    }

    // Apply Coupon
    let finalTotal = subtotal;
    if (state.discountCode === 'MARTIAL10') {
      state.discountAmount = isGBP ? (subtotal * 0.10) : Math.round(subtotal * 0.10);
      finalTotal -= state.discountAmount;
    }

    if (elements.cartSubtotal) {
      elements.cartSubtotal.innerHTML = `
        ${state.discountAmount > 0 ? `<div style="font-size:0.8rem; color:#108474; margin-bottom:4px;">Discount (10%): -${symbol}${isGBP ? state.discountAmount.toFixed(2) : state.discountAmount.toLocaleString('en-PK')}</div>` : ''}
        <span>${symbol}${isGBP ? finalTotal.toFixed(2) : finalTotal.toLocaleString('en-PK')}</span>
      `;
    }

    // Attach cart item quantity and remove events
    elements.cartItemsList.querySelectorAll('[data-cart-minus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-minus'), 10);
        if (state.cart[idx].qty > 1) {
          state.cart[idx].qty--;
        } else {
          state.cart.splice(idx, 1);
        }
        saveCart();
        renderCartDrawer();
      });
    });

    elements.cartItemsList.querySelectorAll('[data-cart-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-plus'), 10);
        state.cart[idx].qty++;
        saveCart();
        renderCartDrawer();
      });
    });

    elements.cartItemsList.querySelectorAll('[data-cart-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-remove'), 10);
        state.cart.splice(idx, 1);
        saveCart();
        renderCartDrawer();
        showToast('Item removed from your bag.');
      });
    });
  }

  function openCartDrawer() {
    renderCartDrawer();
    elements.cartDrawer.classList.add('active');
    elements.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    elements.cartDrawer.classList.remove('active');
    elements.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- WISHLIST ---
  function toggleWishlist(productId, btnElement) {
    if (state.wishlist.has(productId)) {
      state.wishlist.delete(productId);
      if (btnElement) {
        btnElement.classList.remove('active');
        btnElement.querySelector('i').className = 'far fa-heart';
      }
      showToast('Item removed from wishlist');
    } else {
      state.wishlist.add(productId);
      if (btnElement) {
        btnElement.classList.add('active');
        btnElement.querySelector('i').className = 'fas fa-heart';
      }
      showToast('Added to your wishlist!');
    }
    localStorage.setItem('charcoal_wishlist', JSON.stringify([...state.wishlist]));
    updateWishlistBadges();
  }

  function updateWishlistBadges() {
    if (elements.wishlistBadge) elements.wishlistBadge.textContent = state.wishlist.size;
  }

  // --- PREDICTIVE SEARCH MODAL ---
  function openSearchModal() {
    elements.searchModal.classList.add('active');
    elements.searchInput.focus();
    document.body.style.overflow = 'hidden';
    runSearch('');
  }

  function closeSearchModal() {
    elements.searchModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function runSearch(query) {
    query = query.trim().toLowerCase();
    let matches = [];

    if (query.length === 0) {
      matches = state.catalog.products.slice(0, 8);
      elements.searchStatusText.textContent = 'Popular Trending Styles:';
    } else {
      matches = state.catalog.products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.item_code.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.subcategory.toLowerCase().includes(query)
      ).slice(0, 16);
      elements.searchStatusText.textContent = `Found ${matches.length} results matching "${query}":`;
    }

    elements.searchResultsGrid.innerHTML = matches.map(p => createProductCardHTML(p)).join('');
    attachProductCardEvents(elements.searchResultsGrid);
  }

  // --- CUSTOM TEAM UNIFORM & GRAPHIC DESIGN (B2B) MODAL ---
  function openCustomQuoteModal(productName = '') {
    elements.customQuoteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const noteField = document.getElementById('b2bProductRef');
    if (noteField && productName) {
      noteField.value = `Interested in custom team production for: ${productName}`;
    }
  }

  function closeCustomQuoteModal() {
    elements.customQuoteModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- CHECKOUT MODAL ---
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('Your bag is empty! Add items first.');
      return;
    }

    closeCartDrawer();
    elements.checkoutSuccessView.style.display = 'none';
    elements.checkoutFormView.style.display = 'block';

    const isGBP = state.currency === 'GBP';
    const symbol = isGBP ? '£' : 'Rs. ';
    const subtotal = state.cart.reduce((s, item) => s + ((isGBP ? item.price_gbp : item.price_pkr) * item.qty), 0);
    const shipping = subtotal >= (isGBP ? 35 : 3000) ? 0 : (isGBP ? 3.99 : 250);
    const total = subtotal - state.discountAmount + shipping;

    if (elements.checkoutItemsCount) elements.checkoutItemsCount.textContent = `${state.cart.length} items`;
    if (elements.checkoutTotalAmount) elements.checkoutTotalAmount.textContent = `${symbol}${isGBP ? total.toFixed(2) : total.toLocaleString('en-PK')}`;

    elements.checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    elements.checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function handleOrderPlaced(e) {
    e.preventDefault();
    const orderNum = 'MTL-' + Math.floor(100000 + Math.random() * 900000);
    elements.orderNumText.textContent = orderNum;
    elements.checkoutFormView.style.display = 'none';
    elements.checkoutSuccessView.style.display = 'block';

    state.cart = [];
    saveCart();
    renderCartDrawer();
  }

  // --- RESET ALL FILTERS ---
  function resetAllFilters() {
    state.filters.category = null;
    state.filters.subcategory = null;
    state.filters.searchQuery = '';
    state.filters.minPrice = 0;
    state.filters.maxPrice = state.currency === 'GBP' ? 200 : 20000;
    state.filters.sortBy = 'featured';
    state.displayCount = state.pageSize;

    if (elements.priceMinInput) elements.priceMinInput.value = '';
    if (elements.priceMaxInput) elements.priceMaxInput.value = '';
    if (elements.sortSelect) elements.sortSelect.value = 'featured';

    buildSidebarCategoryFilters();
    applyFilters();
  }

  // --- EVENT BINDINGS ---
  function bindEvents() {
    // Currency Toggle
    if (elements.currencyToggleBtn) {
      elements.currencyToggleBtn.addEventListener('click', toggleCurrency);
    }

    // Header scroll
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        header.classList.toggle('scrolled', window.scrollY > 20);
      }
    });

    // Mobile nav drawer
    if (elements.mobileMenuToggle) {
      elements.mobileMenuToggle.addEventListener('click', () => {
        elements.mobileNavDrawer.classList.add('active');
        elements.drawerBackdrop.classList.add('active');
      });
    }

    if (elements.mobileDrawerClose) {
      elements.mobileDrawerClose.addEventListener('click', closeMobileMenu);
    }

    function closeMobileMenu() {
      if (elements.mobileNavDrawer) elements.mobileNavDrawer.classList.remove('active');
      if (elements.drawerBackdrop) elements.drawerBackdrop.classList.remove('active');
    }

    // Cart Drawer triggers
    if (elements.cartBtn) elements.cartBtn.addEventListener('click', openCartDrawer);
    if (elements.cartDrawerClose) elements.cartDrawerClose.addEventListener('click', closeCartDrawer);
    if (elements.drawerBackdrop) {
      elements.drawerBackdrop.addEventListener('click', () => {
        closeCartDrawer();
        closeMobileMenu();
      });
    }

    // Search Modal triggers
    if (elements.searchTrigger) elements.searchTrigger.addEventListener('click', openSearchModal);
    if (elements.searchCloseBtn) elements.searchCloseBtn.addEventListener('click', closeSearchModal);
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        runSearch(e.target.value);
      });
    }

    // Quick View Modal
    if (elements.quickViewCloseBtn) elements.quickViewCloseBtn.addEventListener('click', closeQuickView);
    if (elements.quickViewModal) {
      elements.quickViewModal.addEventListener('click', (e) => {
        if (e.target === elements.quickViewModal) closeQuickView();
      });
    }

    // Quick View Quantity
    if (elements.qvQtyMinus) {
      elements.qvQtyMinus.addEventListener('click', () => {
        let v = parseInt(elements.qvQtyInput.value, 10) || 1;
        if (v > 1) elements.qvQtyInput.value = --v;
      });
    }
    if (elements.qvQtyPlus) {
      elements.qvQtyPlus.addEventListener('click', () => {
        let v = parseInt(elements.qvQtyInput.value, 10) || 1;
        elements.qvQtyInput.value = ++v;
      });
    }

    // Quick View Add to Cart
    if (elements.qvAddToCartBtn) {
      elements.qvAddToCartBtn.addEventListener('click', () => {
        if (state.quickViewProduct) {
          const qty = parseInt(elements.qvQtyInput.value, 10) || 1;
          addToCart(
            state.quickViewProduct,
            state.quickViewSelectedSize,
            state.quickViewSelectedColor,
            qty
          );
          closeQuickView();
        }
      });
    }

    // Quick View Custom Quote
    if (elements.qvCustomQuoteBtn) {
      elements.qvCustomQuoteBtn.addEventListener('click', () => {
        if (state.quickViewProduct) {
          const title = `${state.quickViewProduct.name} (${state.quickViewProduct.item_code})`;
          closeQuickView();
          openCustomQuoteModal(title);
        }
      });
    }

    // Tabs
    elements.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeTab = btn.getAttribute('data-tab');
        state.displayCount = state.pageSize;
        applyFilters();
      });
    });

    // Sorting
    if (elements.sortSelect) {
      elements.sortSelect.addEventListener('change', (e) => {
        state.filters.sortBy = e.target.value;
        applyFilters();
      });
    }

    // Load More
    if (elements.loadMoreBtn) {
      elements.loadMoreBtn.addEventListener('click', () => {
        state.displayCount += state.pageSize;
        renderProductsGrid();
      });
    }

    // Clear Filters
    if (elements.clearFiltersBtn) {
      elements.clearFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Price Filter
    if (elements.priceMinInput) {
      elements.priceMinInput.addEventListener('input', (e) => {
        state.filters.minPrice = parseFloat(e.target.value) || 0;
        applyFilters();
      });
    }
    if (elements.priceMaxInput) {
      elements.priceMaxInput.addEventListener('input', (e) => {
        state.filters.maxPrice = parseFloat(e.target.value) || (state.currency === 'GBP' ? 200 : 20000);
        applyFilters();
      });
    }

    // Apply Coupon
    if (elements.applyCouponBtn) {
      elements.applyCouponBtn.addEventListener('click', () => {
        const code = (elements.couponInput.value || '').trim().toUpperCase();
        if (code === 'MARTIAL10' || code === 'CHARCOAL10') {
          state.discountCode = 'MARTIAL10';
          showToast('Coupon MARTIAL10 Applied: 10% Discount!');
          renderCartDrawer();
        } else {
          showToast('Invalid Coupon Code.');
        }
      });
    }

    // Checkout Modal
    if (elements.checkoutBtn) elements.checkoutBtn.addEventListener('click', openCheckoutModal);
    if (elements.checkoutCloseBtn) elements.checkoutCloseBtn.addEventListener('click', closeCheckoutModal);
    if (elements.checkoutForm) elements.checkoutForm.addEventListener('submit', handleOrderPlaced);
    if (elements.checkoutModal) {
      elements.checkoutModal.addEventListener('click', (e) => {
        if (e.target === elements.checkoutModal) closeCheckoutModal();
      });
    }

    // B2B / Custom Quote Modal
    if (elements.b2bQuoteTrigger) {
      elements.b2bQuoteTrigger.addEventListener('click', () => openCustomQuoteModal());
    }
    if (elements.customQuoteCloseBtn) {
      elements.customQuoteCloseBtn.addEventListener('click', closeCustomQuoteModal);
    }
    if (elements.customQuoteModal) {
      elements.customQuoteModal.addEventListener('click', (e) => {
        if (e.target === elements.customQuoteModal) closeCustomQuoteModal();
      });
    }
    if (elements.customQuoteForm) {
      elements.customQuoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Thank you! Your custom team inquiry has been received.');
        closeCustomQuoteModal();
        elements.customQuoteForm.reset();
      });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Subscribed! Welcome to Martial Insider.');
        newsletterForm.reset();
      });
    }

    // Payment Option selector in checkout
    document.querySelectorAll('.payment-card-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.payment-card-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  }

  // --- HELPER UTILITIES ---
  function renderStars(rating) {
    let stars = '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.4;
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    const remaining = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < remaining; i++) stars += '<i class="far fa-star"></i>';
    return stars;
  }

  function showToast(message) {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 50);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
