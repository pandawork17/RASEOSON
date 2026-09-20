import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { api, ApiError, getToken, setToken } from "./api";

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [menuType, setMenuType] = useState("shop");
  const [sideCategoryOpen, setSideCategoryOpen] = useState(false);

  // ---- reference data -------------------------------------------------
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [gridTitle, setGridTitle] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [productDetail, setProductDetail] = useState(null);
  const [productDetailLoading, setProductDetailLoading] = useState(false);

  // ---- auth -------------------------------------------------------------
  const [authUser, setAuthUser] = useState(null);
  const loggedIn = Boolean(authUser);

  // ---- user data ----------------------------------------------------
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ---- checkout flow --------------------------------------------------
  const [checkoutDraft, setCheckoutDraft] = useState(null);
  const [paymentData, setPaymentData] = useState({ method: "", agree: false });
  const [completedOrder, setCompletedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // -------------------------------------------------------------- init --
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));

    const token = getToken();
    if (!token) return;
    api
      .getMe()
      .then((user) => setAuthUser(user))
      .catch(() => setToken(null));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadProducts = useCallback((params, title) => {
    setProductsLoading(true);
    setGridTitle(title);
    api
      .getProducts(params)
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, []);

  // initial product list for home best-seller strip
  useEffect(() => {
    loadProducts({}, "ALL");
  }, [loadProducts]);

  const topCategories = useMemo(
    () => categories.filter((c) => c.parent_category_id === null),
    [categories]
  );

  const categoryName = (id) =>
    categories.find((c) => c.category_id === id)?.category_name || "";

  // ------------------------------------------------------------- nav ---
  const closeOverlays = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
  };

  const goHome = () => {
    setPage("home");
    closeOverlays();
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
  };

  const toggleCategory = () => {
    setCategoryOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const goCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    loadProducts({ category_id: categoryId }, categoryName(categoryId));
    setPage("category");
    closeOverlays();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goSearch = (term) => {
    if (!term.trim()) return;
    loadProducts({ search: term.trim() }, `‘${term.trim()}’ 검색 결과`);
    setPage("search");
    closeOverlays();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goProductDetail = (productId) => {
    setPage("detail");
    setProductDetail(null);
    setProductDetailLoading(true);
    closeOverlays();
    window.scrollTo({ top: 0, behavior: "smooth" });
    api
      .getProduct(productId)
      .then(setProductDetail)
      .catch(() => window.alert("상품 정보를 불러오지 못했습니다."))
      .finally(() => setProductDetailLoading(false));
  };

  const goBestSellerPage = () => {
    loadProducts({}, "BEST SELLER");
    setPage("bestseller");
    closeOverlays();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------------------------------------------------ auth ---
  const goLogin = () => {
    closeOverlays();
    setPage("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goRegister = () => {
    closeOverlays();
    setPage("register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (result) => {
    setToken(result.access_token);
    setAuthUser(result.user);
    setMenuOpen(false);
    setPage("home");
  };

  const handleLogout = () => {
    setToken(null);
    setAuthUser(null);
    setAddresses([]);
    setOrders([]);
    setRefunds([]);
    closeOverlays();
    setPage("home");
  };

  const requireLogin = () => {
    window.alert("로그인이 필요한 서비스입니다.");
    goLogin();
  };

  // --------------------------------------------------------- my page ---
  const goMyPage = () => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    setPage("mypage");
    window.scrollTo({ top: 0, behavior: "smooth" });
    api
      .getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  };

  const goRefundHistory = () => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    setPage("refund");
    window.scrollTo({ top: 0, behavior: "smooth" });
    api
      .getRefundRequests()
      .then(setRefunds)
      .catch(() => setRefunds([]));
  };

  const goCancelExchangeReturn = () => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    setPage("cancel-exchange-return");
    window.scrollTo({ top: 0, behavior: "smooth" });
    api
      .getRefundRequests()
      .then(setRefunds)
      .catch(() => setRefunds([]));
  };

  const goMemberInfo = () => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    setPage("member-info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goAddress = () => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    setPage("address");
    window.scrollTo({ top: 0, behavior: "smooth" });
    api
      .getAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  };

  const goOrderDetail = (order) => {
    setSelectedOrder(order);
    closeOverlays();
    setPage("order-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const refreshOrders = async () => {
    try {
      const list = await api.getOrders();
      setOrders(list);
      return list;
    } catch {
      return [];
    }
  };

  const requestRefund = async (order, reason) => {
    try {
      await api.createRefundRequest({ order_id: order.order_id, refund_reason: reason });
      window.alert("환불이 접수되었습니다.");
      const list = await refreshOrders();
      const updated = list.find((o) => o.order_id === order.order_id) || order;
      setSelectedOrder(updated);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "환불 신청에 실패했습니다.");
    }
  };

  // ---------------------------------------------------- buy / checkout --
  const handleBuy = ({ product, variant, quantity }) => {
    if (!loggedIn) {
      requireLogin();
      return;
    }

    setCheckoutDraft({
      product,
      variant,
      quantity,
      recipient: {
        name: authUser?.user_name || "",
        phone: authUser?.phone || "",
        address: "",
        zip: "",
        detailAddress: "",
      },
      shippingRequest: "",
    });
    setPaymentData({ method: "", agree: false });
    setPage("order");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPayment = (data) => {
    setCheckoutDraft((prev) => ({ ...prev, ...data }));
    setPaymentData({ method: "", agree: false });
    setPage("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completePayment = async (method) => {
    if (!checkoutDraft) return;
    setSubmitting(true);
    try {
      const { variant, quantity, recipient } = checkoutDraft;
      const order = await api.createOrder({
        variant_id: variant.variant_id,
        quantity,
        receiver_name: recipient.name,
        receiver_phone: recipient.phone,
        zipcode: recipient.zip,
        shipping_address1: recipient.address,
        shipping_address2: recipient.detailAddress,
        payment_method: method,
      });

      setPaymentData({ method, agree: true });
      setCompletedOrder(order);
      setPage("complete");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "결제에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <Header
        onHome={goHome}
        onMenu={toggleMenu}
        onCategory={toggleCategory}
        categoryOpen={categoryOpen}
        onBestSeller={goBestSellerPage}
        onMyPage={goMyPage}
        isScrolled={isScrolled}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={goSearch}
      />

      {categoryOpen && (
        <>
          <div className="overlay category-overlay" onClick={() => setCategoryOpen(false)} />
          <CategoryDropdown categories={topCategories} onCategory={goCategory} />
        </>
      )}

      {menuOpen && (
        <>
          <div className="overlay menu-overlay" onClick={() => setMenuOpen(false)} />
          <SideMenu
            menuType={menuType}
            setMenuType={setMenuType}
            loggedIn={loggedIn}
            authUser={authUser}
            sideCategoryOpen={sideCategoryOpen}
            categories={topCategories}
            onLogin={goLogin}
            onLogout={handleLogout}
            onHome={goHome}
            onToggleCategory={() => setSideCategoryOpen((prev) => !prev)}
            onCategory={goCategory}
            onBestSeller={goBestSellerPage}
            onMyPage={goMyPage}
            onRefund={goRefundHistory}
          />
        </>
      )}

      {page === "home" && (
        <Home products={products} onProductClick={goProductDetail} />
      )}

      {(page === "category" || page === "bestseller" || page === "search") && (
        <ProductGridPage
          title={gridTitle}
          bannerSeed={page === "category" ? `category-${selectedCategoryId}` : page}
          products={products}
          loading={productsLoading}
          onProductClick={goProductDetail}
        />
      )}

      {page === "detail" && (
        <ProductDetail
          product={productDetail}
          loading={productDetailLoading}
          onBuy={handleBuy}
        />
      )}

      {page === "login" && (
        <LoginPage onSuccess={handleAuthSuccess} onGoRegister={goRegister} />
      )}

      {page === "register" && (
        <RegisterPage onSuccess={handleAuthSuccess} onGoLogin={goLogin} />
      )}

      {page === "mypage" && (
        <MyPage
          authUser={authUser}
          orderHistory={orders}
          onOrderDetail={goOrderDetail}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "refund" && (
        <RefundHistoryPage
          refunds={refunds}
          authUser={authUser}
          onOrderHistory={goMyPage}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "cancel-exchange-return" && (
        <CancelExchangeReturnPage
          refunds={refunds}
          authUser={authUser}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "member-info" && (
        <MemberInfoPage
          authUser={authUser}
          setAuthUser={setAuthUser}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "address" && (
        <AddressPage
          addresses={addresses}
          setAddresses={setAddresses}
          authUser={authUser}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onLogout={handleLogout}
        />
      )}

      {page === "order-detail" && selectedOrder && (
        <OrderDetailPage order={selectedOrder} onBack={goMyPage} onRefund={requestRefund} />
      )}

      {page === "order" && checkoutDraft && (
        <OrderPage
          checkoutDraft={checkoutDraft}
          onChange={setCheckoutDraft}
          onPayment={goPayment}
          savedAddresses={addresses}
          loggedIn={loggedIn}
        />
      )}

      {page === "payment" && checkoutDraft && (
        <PaymentPage
          checkoutDraft={checkoutDraft}
          paymentData={paymentData}
          onChange={setPaymentData}
          onComplete={completePayment}
          submitting={submitting}
        />
      )}

      {page === "complete" && completedOrder && (
        <OrderCompletePage order={completedOrder} onBestSeller={goBestSellerPage} onMyPage={goMyPage} />
      )}
    </div>
  );
}

// =====================================================================
// Header / Navigation
// =====================================================================

function Header({
  onHome,
  onMenu,
  onCategory,
  categoryOpen,
  onBestSeller,
  onMyPage,
  isScrolled,
  searchTerm,
  onSearchTermChange,
  onSearch,
}) {
  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <button className="logo" onClick={onHome}>
        BASEASON
      </button>

      <nav className="main-nav">
        <button className={`nav-button ${categoryOpen ? "active" : ""}`} onClick={onCategory}>
          CATEGORY
        </button>

        <button className="nav-button" onClick={onBestSeller}>
          BEST SELLER
        </button>
      </nav>

      <div className="header-right">
        <div className="search-area">
          <input
            type="text"
            placeholder="SEARCH"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch(searchTerm);
            }}
          />
          <button
            className="icon-button search-button"
            aria-label="검색"
            onClick={() => onSearch(searchTerm)}
          >
            <img src="/images/icons/icon_search.svg" alt="" />
          </button>
        </div>

        <button className="header-icon-button" aria-label="마이페이지" onClick={onMyPage}>
          <img src="/images/icons/icon_user.svg" alt="" />
        </button>

        <button className="header-icon-button menu-button" onClick={onMenu} aria-label="메뉴">
          <span className="hamburger">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  );
}

function CategoryDropdown({ categories, onCategory }) {
  return (
    <div className="category-dropdown">
      {categories.map((c) => (
        <button key={c.category_id} onClick={() => onCategory(c.category_id)}>
          {c.category_name}
        </button>
      ))}
    </div>
  );
}

function SideMenu({
  menuType,
  setMenuType,
  loggedIn,
  authUser,
  sideCategoryOpen,
  categories,
  onLogin,
  onLogout,
  onToggleCategory,
  onCategory,
  onBestSeller,
  onMyPage,
  onRefund,
}) {
  return (
    <aside className="side-menu">
      {!loggedIn ? (
        <div className="side-login-area">
          <p>
            고객님은 현재 <strong>‘로그아웃’</strong> 상태입니다.
          </p>
          <p>‘로그인’ 후 다양한 서비스를 이용해보세요.</p>

          <div className="login-icons">
            <button onClick={onLogin}>
              <img
                src="/images/icons/icon_login.svg"
                alt="로그인"
                className="big-image-icon login-icon-image"
              />
              <strong>로그인</strong>
            </button>

            <button type="button" onClick={onMyPage}>
              <img
                src="/images/icons/icon_user.svg"
                alt="마이페이지"
                className="big-image-icon pre-login-mypage-icon"
              />
              <strong>마이페이지</strong>
            </button>
          </div>
        </div>
      ) : (
        <div className="side-login-area logged-area">
          <p>
            <strong>‘{authUser?.user_name}’</strong>님 즐거운 쇼핑되세요.
          </p>

          <div className="logged-menu">
            <button type="button" onClick={onMyPage}>
              <img src="/images/icons/icon_mypage.svg" alt="마이페이지" className="big-image-icon" />
              <strong>마이페이지</strong>
            </button>

            <div className="mypage-links">
              <button type="button" onClick={onMyPage}>
                주문내역
              </button>

              <button type="button" onClick={onRefund}>
                환불내역
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="menu-tabs">
        <button className={menuType === "shop" ? "selected" : ""} onClick={() => setMenuType("shop")}>
          SHOP
        </button>

        <button
          className={menuType === "community" ? "selected" : ""}
          onClick={() => setMenuType("community")}
        >
          COMMUNITY
        </button>
      </div>

      {menuType === "shop" && (
        <div className="side-links">
          <button
            className={`side-category-toggle ${sideCategoryOpen ? "open" : ""}`}
            onClick={onToggleCategory}
          >
            <span>CATEGORY</span>
            <span className="side-category-close">{sideCategoryOpen ? "×" : "+"}</span>
          </button>

          {sideCategoryOpen && (
            <div className="side-category-submenu">
              {categories.map((c) => (
                <button key={c.category_id} onClick={() => onCategory(c.category_id)}>
                  {c.category_name}
                </button>
              ))}
            </div>
          )}

          <button onClick={onBestSeller}>BEST SELLER</button>
          {loggedIn && (
            <button className="logout-button" onClick={onLogout}>
              LOGOUT
            </button>
          )}
        </div>
      )}

      {menuType === "community" && (
        <div className="side-links">
          <button>NOTICE</button>
          <button>Q&A</button>
          {loggedIn && (
            <button className="logout-button" onClick={onLogout}>
              LOGOUT
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

// =====================================================================
// Home / listing pages
// =====================================================================

function Home({ products, onProductClick }) {
  const [startIndex, setStartIndex] = useState(0);
  const count = products.length;

  const visibleProducts = Array.from({ length: Math.min(4, count) }, (_, index) => {
    return products[(startIndex + index) % count];
  });

  const moveLeft = () => setStartIndex((prev) => (prev - 1 + count) % count);
  const moveRight = () => setStartIndex((prev) => (prev + 1) % count);

  return (
    <main className="home">
      <section className="main-banner" onClick={() => count > 0 && onProductClick(products[0].product_id)}>
        <img src="/images/banners/main_banner.png" alt="A Better Season 2025 Fall Winter" />
      </section>

      <section className="best-seller-section" id="best-seller">
        <h2>BESTSELLER</h2>

        {count === 0 ? (
          <p className="empty-inline">상품을 불러오는 중입니다...</p>
        ) : (
          <div className="best-seller-slider">
            <button className="slider-arrow left" onClick={moveLeft} aria-label="이전 상품">
              ‹
            </button>

            <div className="best-seller-track">
              {visibleProducts.map((product, index) => (
                <article
                  className="best-seller-card"
                  key={`${product.product_id}-${index}`}
                  onClick={() => onProductClick(product.product_id)}
                >
                  <div className="best-seller-image">
                    <img src={product.thumbnail_url} alt={product.product_name} />
                  </div>

                  <div className="best-seller-info">
                    <strong>{product.product_name}</strong>
                    <span>{formatPrice(product.sale_price)}</span>
                  </div>
                </article>
              ))}
            </div>

            <button className="slider-arrow right" onClick={moveRight} aria-label="다음 상품">
              ›
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProductGridPage({ title, bannerSeed, products, loading, onProductClick }) {
  return (
    <main className="category-page">
      <section className="category-banner">
        <img src={`https://picsum.photos/seed/${bannerSeed}/1200/300`} alt={`${title} banner`} />
        <h1>{title}</h1>
      </section>

      {loading ? (
        <p className="empty-inline">불러오는 중입니다...</p>
      ) : products.length === 0 ? (
        <p className="empty-inline">표시할 상품이 없습니다.</p>
      ) : (
        <section className="product-grid">
          {products.map((product) => (
            <article
              className="product-card"
              key={product.product_id}
              onClick={() => onProductClick(product.product_id)}
            >
              <div className="product-image">
                <img src={product.thumbnail_url} alt={product.product_name} />
              </div>

              <div className="product-info">
                <strong>{product.product_name}</strong>
                <span>{formatPrice(product.sale_price)}</span>
                {!product.in_stock && <span className="soldout-badge">품절</span>}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

// =====================================================================
// Product detail
// =====================================================================

function buildOptionGroups(variants) {
  const group1Name = variants.find((v) => v.option_name1)?.option_name1 || null;
  const group2Name = variants.find((v) => v.option_name2)?.option_name2 || null;
  const values1 = group1Name
    ? [...new Set(variants.map((v) => v.option_value1).filter(Boolean))]
    : [];
  const values2 = group2Name
    ? [...new Set(variants.map((v) => v.option_value2).filter(Boolean))]
    : [];
  return { group1Name, values1, group2Name, values2 };
}

function ProductDetail({ product, loading, onBuy }) {
  const [value1, setValue1] = useState(null);
  const [value2, setValue2] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    setValue1(null);
    setValue2(null);
    setQuantity(1);
    setMainImage(product?.images?.[0] || null);
  }, [product]);

  if (loading || !product) {
    return (
      <main className="product-detail-page">
        <p className="empty-inline">상품 정보를 불러오는 중입니다...</p>
      </main>
    );
  }

  const { group1Name, values1, group2Name, values2 } = buildOptionGroups(product.variants);

  const selectedVariant = product.variants.find(
    (v) =>
      (!group1Name || v.option_value1 === value1) && (!group2Name || v.option_value2 === value2)
  );

  const copyText = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert(successMessage);
    } catch {
      window.alert("복사할 수 없습니다.");
    }
  };

  const handleBuy = () => {
    if (group1Name && !value1) {
      window.alert(`${group1Name}을(를) 선택해주세요.`);
      return;
    }
    if (group2Name && !value2) {
      window.alert(`${group2Name}을(를) 선택해주세요.`);
      return;
    }
    if (!selectedVariant) {
      window.alert("선택하신 옵션의 상품을 찾을 수 없습니다.");
      return;
    }
    if (selectedVariant.stock_available <= 0) {
      window.alert("품절된 옵션입니다.");
      return;
    }
    if (quantity > selectedVariant.stock_available) {
      window.alert(`최대 ${selectedVariant.stock_available}개까지 구매 가능합니다.`);
      return;
    }

    onBuy({ product, variant: selectedVariant, quantity });
  };

  const unitPrice =
    Number(product.sale_price) + Number(selectedVariant?.additional_price || 0);
  const hasDiscount = Number(product.regular_price) > Number(product.sale_price);
  const discountRate = hasDiscount
    ? Math.round(
        ((Number(product.regular_price) - Number(product.sale_price)) /
          Number(product.regular_price)) *
          100
      )
    : 0;

  return (
    <main className="product-detail-page">
      <section className="detail-container">
        <div className="detail-left">
          <div className="detail-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.product_name} />
            ) : (
              <div className="detail-image-empty">상세 이미지를 준비해주세요.</div>
            )}
          </div>

          <div className="detail-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={image}
                className={mainImage === image ? "selected" : ""}
                onClick={() => setMainImage(image)}
              >
                <img src={image} alt={`상품 상세 이미지 ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-top-row">
            <div
              className="product-code copyable"
              onClick={() => copyText(product.product_code, "상품번호가 복사되었습니다.")}
              title="상품번호 복사"
            >
              상품번호 : {product.product_code}
            </div>

            <button
              className="share-button"
              onClick={() => copyText(window.location.href, "상품 상세 페이지 링크가 복사되었습니다.")}
              title="상품 링크 복사"
            >
              <img src="/images/icons/icon_share.svg" alt="공유" />
            </button>
          </div>

          <h1 className="detail-title">{product.product_name}</h1>
          {product.short_description && <p className="detail-short-desc">{product.short_description}</p>}

          <div className="detail-tags">
            {hasDiscount && <span>오늘만 할인</span>}
            <span>무료 배송</span>
          </div>

          <div className="price-area">
            {hasDiscount && (
              <>
                <span className="original-price">{formatNumber(product.regular_price)}</span>
                <span className="price-divider">/</span>
              </>
            )}

            <strong>{formatNumber(unitPrice)}</strong>

            {hasDiscount && <span className="discount">{discountRate}%</span>}
          </div>

          <hr />

          {group1Name && (
            <div className="option-section">
              <div className="option-title">
                <h3>{group1Name}</h3>
                <p className={value1 ? "selected-option" : ""}>
                  {value1 ? value1 : `${group1Name}을(를) 선택해주세요`}
                </p>
              </div>

              <div className="size-buttons">
                {values1.map((v) => (
                  <button
                    key={v}
                    className={value1 === v ? "selected" : ""}
                    onClick={() => setValue1(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {group2Name && (
            <div className="option-section">
              <div className="option-title">
                <h3>{group2Name}</h3>
                <p className={value2 ? "selected-option" : ""}>
                  {value2 ? value2 : `${group2Name}을(를) 선택해주세요`}
                </p>
              </div>

              <div className="size-buttons">
                {values2.map((v) => (
                  <button
                    key={v}
                    className={value2 === v ? "selected" : ""}
                    onClick={() => setValue2(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedVariant && (
            <p className="stock-info">
              {selectedVariant.stock_available > 0
                ? `재고 ${selectedVariant.stock_available}개`
                : "품절"}
            </p>
          )}

          <div className="quantity-area">
            <strong>수량</strong>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((prev) => prev + 1)}>
                +
              </button>
            </div>
          </div>

          <div className="total-area">
            <strong>총금액</strong>
            <span>{formatNumber(unitPrice * quantity)}원</span>
          </div>

          <button className="buy-button" onClick={handleBuy}>
            <img src="/images/icons/icon_delivery.svg" alt="" />
            구매하기
          </button>

          {product.description && (
            <div className="detail-description">
              <h3>상세 설명</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// =====================================================================
// Auth pages
// =====================================================================

// 데모용 구매자 계정 (DB 시드 데이터의 buyer01~buyer96)
// 비밀번호는 scripts/reset_test_buyer_passwords.py 로 buyer1234 로 고정해둔 상태입니다.
const TEST_BUYERS = [
  { login_id: "buyer01", label: "구매자김 (buyer01, 전주지사)", password: "buyer1234" },
  { login_id: "buyer02", label: "구매자이 (buyer02, 부산지사)", password: "buyer1234" },
  { login_id: "buyer03", label: "구매자박 (buyer03, 본사)", password: "buyer1234" },
  { login_id: "buyer96", label: "Buyer 96 (buyer96, 본사)", password: "buyer1234" },
  { login_id: "buyer5", label: "오길동 (buyer5, 본사)", password: "buyer1234" },
];

function LoginPage({ onSuccess, onGoRegister }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doLogin = async (id, pw) => {
    setError("");
    setSubmitting(true);
    try {
      const result = await api.login({ login_id: id, password: pw });
      onSuccess(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(loginId, password);
  };

  const handleSelectBuyer = (e) => {
    const id = e.target.value;
    setSelectedBuyer(id);
    const buyer = TEST_BUYERS.find((b) => b.login_id === id);
    if (buyer) {
      setLoginId(buyer.login_id);
      setPassword(buyer.password);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>로그인</h1>

        <div className="quick-login-box">
          <label>
            <span>테스트 구매자로 빠른 로그인</span>
            <select value={selectedBuyer} onChange={handleSelectBuyer}>
              <option value="">구매자를 선택해주세요</option>
              {TEST_BUYERS.map((b) => (
                <option key={b.login_id} value={b.login_id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          {selectedBuyer && (
            <p className="quick-login-hint">
              아이디 <strong>{loginId}</strong> / 비밀번호 <strong>{password}</strong> 가 아래에 자동
              입력되었습니다. 바로 로그인해도 되고 직접 수정해도 됩니다.
            </p>
          )}
        </div>

        <div className="receiver-grid auth-grid">
          <label>
            <span>아이디</span>
            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="setting-primary-button" disabled={submitting}>
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        <p className="auth-switch">
          아직 회원이 아니신가요?{" "}
          <button type="button" onClick={onGoRegister}>
            회원가입
          </button>
        </p>
      </form>
    </main>
  );
}

function RegisterPage({ onSuccess, onGoLogin }) {
  const [form, setForm] = useState({
    login_id: "",
    password: "",
    user_name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api.register(form);
      onSuccess(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>회원가입</h1>
        <div className="receiver-grid auth-grid">
          <label>
            <span>아이디</span>
            <input value={form.login_id} onChange={update("login_id")} minLength={4} required />
          </label>
          <label>
            <span>비밀번호</span>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              minLength={4}
              required
            />
          </label>
          <label>
            <span>이름</span>
            <input value={form.user_name} onChange={update("user_name")} required />
          </label>
          <label>
            <span>이메일</span>
            <input type="email" value={form.email} onChange={update("email")} required />
          </label>
          <label>
            <span>휴대전화</span>
            <input value={form.phone} onChange={update("phone")} placeholder="010-0000-0000" />
          </label>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="setting-primary-button" disabled={submitting}>
          {submitting ? "가입 처리 중..." : "회원가입"}
        </button>

        <p className="auth-switch">
          이미 계정이 있으신가요?{" "}
          <button type="button" onClick={onGoLogin}>
            로그인
          </button>
        </p>
      </form>
    </main>
  );
}

// =====================================================================
// Checkout
// =====================================================================

function OrderPage({ checkoutDraft, onChange, onPayment, savedAddresses }) {
  const { product, variant, quantity, recipient, shippingRequest } = checkoutDraft;

  useEffect(() => {
    if (window.daum?.Postcode) return;
    if (document.querySelector('script[data-daum-postcode="true"]')) return;

    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.dataset.daumPostcode = "true";
    document.body.appendChild(script);
  }, []);

  const unitPrice = Number(product.sale_price) + Number(variant.additional_price || 0);
  const unitRegular = Number(product.regular_price) + Number(variant.additional_price || 0);
  const productAmount = unitRegular * quantity;
  const discountAmount = Math.max(0, unitRegular - unitPrice) * quantity;
  const shippingFee = 3000;
  const paymentAmount = productAmount - discountAmount + shippingFee;

  const updateRecipient = (key, value) => {
    onChange((prev) => ({ ...prev, recipient: { ...prev.recipient, [key]: value } }));
  };

  const applyAddress = (addr) => {
    updateRecipient("name", addr.receiver_name || "");
    updateRecipient("phone", addr.receiver_phone || "");
    updateRecipient("zip", addr.zipcode || "");
    updateRecipient("address", addr.address1 || "");
    updateRecipient("detailAddress", addr.address2 || "");
  };

  const canPayment =
    recipient.name.trim() &&
    recipient.phone.trim() &&
    recipient.address.trim() &&
    recipient.detailAddress.trim() &&
    shippingRequest;

  const handlePayment = () => {
    if (!canPayment) return;
    onPayment({ recipient, shippingRequest });
  };

  const openPostcode = () => {
    const open = () => {
      if (!window.daum?.Postcode) return;
      new window.daum.Postcode({
        oncomplete: (data) => {
          const address = data.roadAddress || data.jibunAddress || "";
          const extraAddress =
            data.addressType === "R" ? [data.bname, data.buildingName].filter(Boolean).join(", ") : "";
          updateRecipient("zip", data.zonecode || "");
          updateRecipient("address", extraAddress ? `${address} (${extraAddress})` : address);
        },
      }).open();
    };

    if (window.daum?.Postcode) {
      open();
      return;
    }
    const script = document.querySelector('script[data-daum-postcode="true"]');
    if (script) {
      script.addEventListener("load", open, { once: true });
      return;
    }
    window.alert("우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
  };

  return (
    <main className="checkout-page order-page">
      <div className="checkout-inner">
        <section className="checkout-heading">
          <div>
            <h1>주문 / 결제하기</h1>
            <p>주문할 상품과 배송 정보를 입력해주세요.</p>
          </div>
          <CheckoutSteps current={1} />
        </section>

        <div className="checkout-layout">
          <section className="checkout-main">
            <h2>주문할 상품</h2>
            <div className="section-line" />

            <div className="order-product-row">
              <div className="order-product-image">
                <img src={product.images[0]} alt={product.product_name} />
              </div>
              <div className="order-product-info">
                <strong>{product.product_name}</strong>
                <span>
                  옵션 : {[variant.option_value1, variant.option_value2].filter(Boolean).join(" / ") || "기본 옵션"}
                </span>
              </div>
              <strong className="order-unit-price">{formatPrice(unitPrice)}</strong>
              <div className="order-quantity-control">
                <span>{quantity}개</span>
              </div>
              <strong className="order-row-total">{formatPrice(unitPrice * quantity)}</strong>
            </div>

            {savedAddresses.length > 0 && (
              <div className="checkout-section saved-address-section">
                <h2>저장된 배송지</h2>
                <div className="saved-address-list">
                  {savedAddresses.map((addr) => (
                    <button type="button" key={addr.address_id} onClick={() => applyAddress(addr)}>
                      {addr.address_name || "배송지"} · {addr.receiver_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="checkout-section receiver-section">
              <h2>받는 분 정보</h2>
              <div className="receiver-grid receiver-grid-first">
                <label>
                  <span>받는 분 성함</span>
                  <input value={recipient.name} onChange={(e) => updateRecipient("name", e.target.value)} />
                </label>
                <label>
                  <span>전화번호</span>
                  <input
                    value={recipient.phone}
                    onChange={(e) => updateRecipient("phone", e.target.value)}
                    placeholder="010-0000-0000"
                  />
                </label>
              </div>

              <div className="receiver-address-row">
                <label className="address-main">
                  <span>주소</span>
                  <input value={recipient.address} onChange={(e) => updateRecipient("address", e.target.value)} />
                </label>
                <label className="zip-field">
                  <span>우편번호</span>
                  <input value={recipient.zip} onChange={(e) => updateRecipient("zip", e.target.value)} />
                </label>
                <button type="button" className="zip-button" onClick={openPostcode}>
                  우편번호 찾기
                </button>
              </div>

              <input
                className="detail-address-input"
                value={recipient.detailAddress}
                onChange={(e) => updateRecipient("detailAddress", e.target.value)}
                placeholder="상세 주소를 입력해주세요."
              />
            </div>

            <div className="checkout-section shipping-request-section">
              <h2>배송 시 요청사항</h2>
              <select
                value={shippingRequest}
                onChange={(e) => onChange((prev) => ({ ...prev, shippingRequest: e.target.value }))}
              >
                <option value="">배송 시 요청사항을 선택해주세요.</option>
                <option value="문 앞에 놓아주세요.">문 앞에 놓아주세요.</option>
                <option value="경비실에 맡겨주세요.">경비실에 맡겨주세요.</option>
                <option value="배송 전 연락주세요.">배송 전 연락주세요.</option>
                <option value="직접 전달해주세요.">직접 전달해주세요.</option>
                <option value="요청사항 없음">요청사항 없음</option>
              </select>
            </div>
          </section>

          <OrderSummaryCard
            productAmount={productAmount}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            paymentAmount={paymentAmount}
            onPayment={handlePayment}
            disabled={!canPayment}
          />
        </div>
      </div>
    </main>
  );
}

function OrderSummaryCard({ productAmount, discountAmount, shippingFee, paymentAmount, onPayment, disabled }) {
  return (
    <aside className="order-summary-card">
      <h2>결제 내용</h2>
      <div className="summary-row">
        <span>상품 금액</span>
        <strong>{formatPrice(productAmount)}</strong>
      </div>
      <div className="summary-row">
        <span>배송비</span>
        <strong>{formatPrice(shippingFee)}</strong>
      </div>
      <div className="summary-row discount-row">
        <span>할인 금액</span>
        <strong>- {formatPrice(discountAmount)}</strong>
      </div>
      <div className="summary-divider" />
      <div className="summary-total-row">
        <span>결제 금액</span>
        <strong>{formatPrice(paymentAmount)}</strong>
      </div>
      <button type="button" className="summary-payment-button" disabled={disabled} onClick={onPayment}>
        <img src="/images/icons/icon_delivery.svg" alt="" />
        결제하기
      </button>
    </aside>
  );
}

function CheckoutSteps({ current }) {
  return (
    <div className="checkout-steps">
      <div className={`step ${current === 1 ? "active" : ""}`}>
        <span>1</span>
        <p>주문/결제</p>
      </div>
      <div className={`step ${current === 2 ? "active" : ""}`}>
        <span>2</span>
        <p>결제 단계</p>
      </div>
      <div className={`step ${current === 3 ? "active" : ""}`}>
        <span>3</span>
        <p>주문완료</p>
      </div>
    </div>
  );
}

function PaymentPage({ checkoutDraft, paymentData, onChange, onComplete, submitting }) {
  const { product, variant, quantity } = checkoutDraft;
  const unitPrice = Number(product.sale_price) + Number(variant.additional_price || 0);
  const unitRegular = Number(product.regular_price) + Number(variant.additional_price || 0);
  const productAmount = unitRegular * quantity;
  const discountAmount = Math.max(0, unitRegular - unitPrice) * quantity;
  const shippingFee = 3000;
  const paymentAmount = productAmount - discountAmount + shippingFee;

  const methods = [
    { key: "card", icon: "/images/icons/payment_card.svg", label: "신용 / 체크카드" },
    { key: "kakao", icon: "/images/icons/payment_kakao.svg", label: "카카오 페이" },
    { key: "naver", icon: "/images/icons/payment_naver.svg", label: "네이버 페이" },
    { key: "toss", icon: "/images/icons/payment_toss.svg", label: "토스 페이" },
    { key: "bank", icon: "/images/icons/payment_bank.svg", label: "무통장 입금" },
  ];

  const canPay = paymentData.method && paymentData.agree && !submitting;

  return (
    <main className="checkout-page payment-page">
      <div className="checkout-inner">
        <section className="checkout-heading">
          <div>
            <h1>주문 / 결제하기</h1>
            <p>원하시는 결제 방법을 선택해주세요. (테스트 결제이며 실제 결제는 이루어지지 않습니다)</p>
          </div>
          <CheckoutSteps current={2} />
        </section>

        <div className="checkout-layout">
          <section className="checkout-main payment-main">
            <h2>결제 방법</h2>
            <div className="payment-method-list">
              {methods.map((method) => (
                <button
                  key={method.key}
                  type="button"
                  className={`payment-method ${paymentData.method === method.key ? "selected" : ""}`}
                  onClick={() => onChange((prev) => ({ ...prev, method: method.key }))}
                >
                  <span className="payment-radio" />
                  <span className="payment-icon">
                    <img src={method.icon} alt="" />
                  </span>
                  <span className="payment-label">{method.label}</span>
                </button>
              ))}
            </div>
          </section>

          <aside className="payment-summary-card">
            <h2>주문 상품</h2>
            <div className="payment-product-row">
              <div className="payment-product-image">
                <img src={product.images[0]} alt={product.product_name} />
              </div>
              <div className="payment-product-info">
                <strong>{product.product_name}</strong>
                <span>
                  옵션 : {[variant.option_value1, variant.option_value2].filter(Boolean).join(" / ") || "기본 옵션"}
                </span>
                <span>수량 : {quantity}개</span>
              </div>
              <strong className="payment-product-price">{formatPrice(unitPrice * quantity)}</strong>
            </div>

            <div className="summary-divider" />
            <h3>결제 금액</h3>
            <div className="summary-row">
              <span>상품 금액</span>
              <strong>{formatPrice(productAmount)}</strong>
            </div>
            <div className="summary-row">
              <span>배송비</span>
              <strong>{formatPrice(shippingFee)}</strong>
            </div>
            <div className="summary-row discount-row">
              <span>할인 금액</span>
              <strong>- {formatPrice(discountAmount)}</strong>
            </div>
            <div className="summary-divider" />
            <div className="payment-final-row">
              <span>최종 결제 금액</span>
              <strong>{formatPrice(paymentAmount)}</strong>
            </div>

            <label className="agreement-row">
              <input
                type="checkbox"
                checked={paymentData.agree}
                onChange={(e) => onChange((prev) => ({ ...prev, agree: e.target.checked }))}
              />
              <span>[필수] 결제 서비스 이용 약관, 개인정보 처리 동의</span>
            </label>

            <button
              type="button"
              className="final-payment-button"
              disabled={!canPay}
              onClick={() => onComplete(paymentData.method)}
            >
              {submitting ? "결제 처리 중..." : `${formatPrice(paymentAmount)} 결제하기`}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

function OrderCompletePage({ order, onBestSeller, onMyPage }) {
  const item = order.items[0];

  return (
    <main className="checkout-page complete-page">
      <div className="complete-inner">
        <div className="complete-icon">✓</div>
        <h1>상품 주문이 완료되었습니다.</h1>
        <p>BASEASON을 이용해주셔서 감사합니다.</p>
        <p>주문하신 상품은 빠르게 준비하여 안전하게 배송해드리겠습니다.</p>

        <div className="complete-order-card">
          <div className="complete-order-details">
            <div>
              <span>주문번호</span>
              <strong>{order.order_no}</strong>
            </div>
            <div>
              <span>주문일시</span>
              <strong>{formatDateTime(order.ordered_at)}</strong>
            </div>
            <div>
              <span>결제방법</span>
              <strong>{paymentMethodLabel(order.payment_method)}</strong>
            </div>
            <div>
              <span>주문금액</span>
              <strong>{formatPrice(order.total_amount)}</strong>
            </div>
          </div>

          {item && (
            <div className="complete-product">
              <div className="complete-product-image">
                <img src={item.thumbnail_url} alt={item.product_name_snapshot} />
              </div>
              <div className="complete-product-info">
                <strong>{item.product_name_snapshot}</strong>
                <span>수량 : {item.quantity}개</span>
              </div>
              <strong className="complete-product-price">{formatPrice(item.item_amount)}</strong>
            </div>
          )}
        </div>

        <div className="complete-buttons">
          <button type="button" onClick={onMyPage}>
            주문 내역 보러가기
          </button>
          <button type="button" className="outline" onClick={onBestSeller}>
            다른 상품 보러가기
          </button>
        </div>
      </div>
    </main>
  );
}

// =====================================================================
// My page
// =====================================================================

function MyPageSidebar({ active, authUser, onOrderHistory, onRefund, onCancelExchangeReturn, onMemberInfo, onAddress, onLogout }) {
  return (
    <aside className="mypage-sidebar">
      <div className="mypage-user">
        <img src="/images/icons/icon_mypage.svg" alt="" />
        <div>
          <span>안녕하세요,</span>
          <strong>{authUser?.user_name}님</strong>
        </div>
      </div>

      <nav className="mypage-nav">
        <button className={active === "order" ? "active" : ""} type="button" onClick={onOrderHistory}>
          주문내역
        </button>
        <button className={active === "refund" ? "active" : ""} type="button" onClick={onRefund}>
          환불내역
        </button>
        <button className={active === "cancel" ? "active" : ""} type="button" onClick={onCancelExchangeReturn}>
          취소/교환/반품 내역
        </button>
        <button className={active === "member" ? "active" : ""} type="button" onClick={onMemberInfo}>
          회원정보수정
        </button>
        <button className={active === "address" ? "active" : ""} type="button" onClick={onAddress}>
          배송지 관리
        </button>
      </nav>

      <button className="mypage-logout" type="button" onClick={onLogout}>
        LOGOUT
      </button>
    </aside>
  );
}

function MyPage({ authUser, orderHistory, onOrderDetail, onRefund, onCancelExchangeReturn, onMemberInfo, onAddress, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 주문내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="order"
            authUser={authUser}
            onOrderHistory={() => {}}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content">
            <div className="mypage-heading">
              <div>
                <h1>주문내역</h1>
                <p>지금까지 주문하신 내역을 확인하실 수 있습니다.</p>
              </div>
              <span>총 {orderHistory.length}건</span>
            </div>

            {orderHistory.length === 0 ? (
              <div className="empty-order-history">
                <div className="empty-order-icon">⌁</div>
                <h2>주문내역이 없습니다.</h2>
                <p>아직 주문하신 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {orderHistory.map((order) => {
                  const item = order.items[0];
                  return (
                    <article className="history-order-card" key={order.order_id}>
                      <div className="history-order-head">
                        <span>{formatDateTime(order.ordered_at)}</span>
                        <strong>주문번호 {order.order_no}</strong>
                        <button type="button" onClick={() => onOrderDetail(order)}>
                          상세보기 ›
                        </button>
                      </div>

                      <div className="history-order-body">
                        {item && (
                          <>
                            <div className="history-product-image">
                              <img src={item.thumbnail_url} alt={item.product_name_snapshot} />
                            </div>
                            <div className="history-product-info">
                              <strong>{item.product_name_snapshot}</strong>
                              <span>수량 : {item.quantity}개</span>
                            </div>
                            <strong className="history-product-price">{formatPrice(item.item_amount)}</strong>
                          </>
                        )}

                        <div className="history-order-status">
                          <strong>{orderStatusLabel(order.process_status || order.order_status)}</strong>
                          <button type="button" onClick={() => onOrderDetail(order)}>
                            주문상세보기
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function OrderDetailPage({ order, onBack, onRefund }) {
  const item = order.items[0];
  const canRequestRefund = ["PAID", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED"].includes(order.order_status);

  const handleRefundClick = () => {
    const reason = window.prompt("환불 사유를 입력해주세요.", "단순 변심");
    if (!reason) return;
    onRefund(order, reason);
  };

  return (
    <main className="mypage">
      <div className="mypage-inner order-detail-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 주문내역 <span>›</span> 상세보기
        </div>

        <section className="order-detail-page">
          <div className="mypage-heading">
            <div>
              <h1>주문 상세보기</h1>
              <p>주문하신 상품의 상세 정보를 확인하실 수 있습니다.</p>
            </div>
          </div>

          <div className="order-detail-box">
            <div className="order-detail-meta order-detail-meta-three">
              <div>
                <span>주문번호</span>
                <strong>{order.order_no}</strong>
              </div>
              <div>
                <span>주문상태</span>
                <strong>{orderStatusLabel(order.process_status || order.order_status)}</strong>
              </div>
              <div>
                <span>결제방법</span>
                <strong>{paymentMethodLabel(order.payment_method)}</strong>
              </div>
            </div>

            {item && (
              <div className="order-detail-product">
                <div className="order-detail-image">
                  <img src={item.thumbnail_url} alt={item.product_name_snapshot} />
                </div>
                <div className="order-detail-info">
                  <strong>{item.product_name_snapshot}</strong>
                  <span>SKU : {item.sku_snapshot}</span>
                  <span>수량 : {item.quantity}개</span>
                </div>
                <strong className="order-detail-price">{formatPrice(item.item_amount)}</strong>
              </div>
            )}

            <div className="order-detail-delivery">
              <h2>배송 정보</h2>
              <div>
                <span>받는 분</span>
                <strong>{order.receiver_name || "-"}</strong>
              </div>
              <div>
                <span>연락처</span>
                <strong>{order.receiver_phone || "-"}</strong>
              </div>
              <div>
                <span>주소</span>
                <strong>
                  {order.shipping_address1 || "-"} {order.shipping_address2 || ""}
                </strong>
              </div>
            </div>

            <div className="order-detail-payment">
              <h2>결제 금액</h2>
              <div>
                <span>상품 금액</span>
                <strong>{formatPrice(order.product_amount)}</strong>
              </div>
              <div>
                <span>할인 금액</span>
                <strong>- {formatPrice(order.discount_amount)}</strong>
              </div>
              <div>
                <span>배송비</span>
                <strong>{formatPrice(order.shipping_amount)}</strong>
              </div>
              <div className="total">
                <span>최종 결제 금액</span>
                <strong>{formatPrice(order.total_amount)}</strong>
              </div>
            </div>
          </div>

          <div className="order-detail-actions">
            <button className="order-detail-back" type="button" onClick={onBack}>
              주문내역으로 돌아가기
            </button>
            {canRequestRefund && order.process_status !== "REFUND_WAITING" && (
              <button className="order-detail-refund" type="button" onClick={handleRefundClick}>
                환불 신청
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function RefundHistoryPage({ refunds, authUser, onOrderHistory, onCancelExchangeReturn, onMemberInfo, onAddress, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner refund-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 환불내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="refund"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={() => {}}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content refund-content">
            <div className="mypage-heading">
              <div>
                <h1>환불내역</h1>
                <p>신청하신 환불 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <span>총 {refunds.length}건</span>
            </div>

            {refunds.length === 0 ? (
              <div className="refund-empty">
                <div className="refund-empty-icon">↩</div>
                <h2>환불내역이 없습니다.</h2>
                <p>아직 환불을 신청한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {refunds.map((r) => (
                  <article className="history-order-card" key={r.refund_request_id}>
                    <div className="history-order-head">
                      <span>{formatDateTime(r.requested_at)}</span>
                      <strong>주문번호 {r.order_no}</strong>
                      <span>{refundStatusLabel(r.refund_status)}</span>
                    </div>
                    <div className="history-order-body">
                      <div className="history-product-info">
                        <strong>환불 사유 : {r.refund_reason}</strong>
                        <span>요청 금액 : {formatPrice(r.requested_amount)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="refund-guide">
              <div className="refund-guide-title">
                <h2>환불 안내</h2>
                <span>BASEASON 환불 안내</span>
              </div>
              <ul>
                <li>환불은 상품 수거 완료 후 영업일 기준 3~5일 이내에 처리됩니다.</li>
                <li>결제 수단에 따라 실제 환불 반영 시점은 달라질 수 있습니다.</li>
                <li>환불 신청 및 진행 상태는 환불내역에서 확인하실 수 있습니다.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function CancelExchangeReturnPage({ refunds, authUser, onOrderHistory, onRefund, onMemberInfo, onAddress, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 취소/교환/반품 내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="cancel"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={() => {}}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content empty-status-page">
            <div className="mypage-heading">
              <div>
                <h1>취소/교환/반품 내역</h1>
                <p>신청하신 취소, 교환, 반품(환불) 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <span>총 {refunds.length}건</span>
            </div>

            {refunds.length === 0 ? (
              <div className="empty-status-box">
                <div className="empty-status-icon">↺</div>
                <h2>취소/교환/반품 내역이 없습니다.</h2>
                <p>아직 취소, 교환 또는 반품을 신청한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {refunds.map((r) => (
                  <article className="history-order-card" key={r.refund_request_id}>
                    <div className="history-order-head">
                      <span>{formatDateTime(r.requested_at)}</span>
                      <strong>주문번호 {r.order_no}</strong>
                      <span>{refundStatusLabel(r.refund_status)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function MemberInfoPage({ authUser, setAuthUser, onOrderHistory, onRefund, onCancelExchangeReturn, onAddress, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState(authUser?.user_name || "");
  const [phone, setPhone] = useState(authUser?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateMe({ user_name: userName, phone });
      setAuthUser(updated);
      setEditing(false);
      window.alert("회원정보가 수정되었습니다.");
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = window.prompt("현재 비밀번호를 입력해주세요.");
    if (!oldPassword) return;
    const newPassword = window.prompt("새 비밀번호를 입력해주세요. (4자 이상)");
    if (!newPassword) return;

    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      window.alert("비밀번호가 변경되었습니다.");
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 회원정보 수정
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="member"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={() => {}}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content simple-setting-page">
            <div className="mypage-heading">
              <div>
                <h1>회원정보 수정</h1>
                <p>회원님의 기본 정보를 확인하고 수정할 수 있습니다.</p>
              </div>
            </div>

            {!editing ? (
              <div className="setting-card">
                <div className="setting-row">
                  <span>아이디</span>
                  <strong>{authUser?.login_id}</strong>
                </div>
                <div className="setting-row">
                  <span>이름</span>
                  <strong>{authUser?.user_name}</strong>
                </div>
                <div className="setting-row">
                  <span>비밀번호</span>
                  <button type="button" className="small-setting-button" onClick={handleChangePassword}>
                    비밀번호 변경
                  </button>
                </div>
                <div className="setting-row">
                  <span>휴대전화</span>
                  <strong>{authUser?.phone || "등록된 정보 없음"}</strong>
                </div>
                <div className="setting-row">
                  <span>이메일</span>
                  <strong>{authUser?.email || "등록된 정보 없음"}</strong>
                </div>
              </div>
            ) : (
              <div className="receiver-grid auth-grid">
                <label>
                  <span>이름</span>
                  <input value={userName} onChange={(e) => setUserName(e.target.value)} />
                </label>
                <label>
                  <span>휴대전화</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              </div>
            )}

            <div className="setting-actions">
              {!editing ? (
                <button type="button" className="setting-primary-button" onClick={() => setEditing(true)}>
                  수정하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="small-setting-button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    취소
                  </button>
                  <button type="button" className="setting-primary-button" onClick={handleSave} disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AddressPage({ addresses, setAddresses, authUser, onOrderHistory, onRefund, onCancelExchangeReturn, onMemberInfo, onLogout }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    address_name: "",
    receiver_name: "",
    receiver_phone: "",
    zipcode: "",
    address1: "",
    address2: "",
    default_yn: "N",
  });
  const [saving, setSaving] = useState(false);

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await api.createAddress(form);
      setAddresses((prev) => [created, ...prev.map((a) => (form.default_yn === "Y" ? { ...a, default_yn: "N" } : a))]);
      setAdding(false);
      setForm({
        address_name: "",
        receiver_name: "",
        receiver_phone: "",
        zipcode: "",
        address1: "",
        address2: "",
        default_yn: "N",
      });
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "배송지 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("이 배송지를 삭제하시겠습니까?")) return;
    try {
      await api.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "배송지 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 배송지 관리
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="address"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={() => {}}
            onLogout={onLogout}
          />

          <section className="mypage-content simple-setting-page">
            <div className="mypage-heading">
              <div>
                <h1>배송지 관리</h1>
                <p>자주 사용하는 배송지를 관리할 수 있습니다.</p>
              </div>
            </div>

            {addresses.length === 0 && !adding && (
              <div className="address-empty-box">
                <div className="empty-status-icon">⌂</div>
                <h2>등록된 배송지가 없습니다.</h2>
                <p>배송지를 등록하면 주문할 때 편리하게 이용할 수 있습니다.</p>
                <button type="button" className="setting-primary-button" onClick={() => setAdding(true)}>
                  배송지 추가
                </button>
              </div>
            )}

            {addresses.length > 0 && (
              <div className="address-list">
                {addresses.map((addr) => (
                  <article className="address-card" key={addr.address_id}>
                    <div>
                      <strong>{addr.address_name || "배송지"}</strong>
                      {addr.default_yn === "Y" && <span className="default-badge">기본배송지</span>}
                    </div>
                    <p>
                      {addr.receiver_name} · {addr.receiver_phone}
                    </p>
                    <p>
                      ({addr.zipcode}) {addr.address1} {addr.address2}
                    </p>
                    <button type="button" className="small-setting-button" onClick={() => handleDelete(addr.address_id)}>
                      삭제
                    </button>
                  </article>
                ))}
              </div>
            )}

            {addresses.length > 0 && !adding && (
              <div className="setting-actions">
                <button type="button" className="setting-primary-button" onClick={() => setAdding(true)}>
                  배송지 추가
                </button>
              </div>
            )}

            {adding && (
              <form className="receiver-grid auth-grid address-form" onSubmit={handleAdd}>
                <label>
                  <span>배송지명</span>
                  <input value={form.address_name} onChange={update("address_name")} placeholder="집, 회사 등" />
                </label>
                <label>
                  <span>받는 분</span>
                  <input value={form.receiver_name} onChange={update("receiver_name")} required />
                </label>
                <label>
                  <span>연락처</span>
                  <input value={form.receiver_phone} onChange={update("receiver_phone")} required />
                </label>
                <label>
                  <span>우편번호</span>
                  <input value={form.zipcode} onChange={update("zipcode")} />
                </label>
                <label>
                  <span>주소</span>
                  <input value={form.address1} onChange={update("address1")} required />
                </label>
                <label>
                  <span>상세주소</span>
                  <input value={form.address2} onChange={update("address2")} />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.default_yn === "Y"}
                    onChange={(e) => setForm((prev) => ({ ...prev, default_yn: e.target.checked ? "Y" : "N" }))}
                  />
                  <span>기본 배송지로 설정</span>
                </label>

                <div className="setting-actions">
                  <button type="button" className="small-setting-button" onClick={() => setAdding(false)} disabled={saving}>
                    취소
                  </button>
                  <button type="submit" className="setting-primary-button" disabled={saving}>
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

// =====================================================================
// Formatting helpers
// =====================================================================

function paymentMethodLabel(method) {
  const labels = {
    card: "신용카드",
    kakao: "카카오페이",
    naver: "네이버페이",
    toss: "토스페이",
    bank: "무통장 입금",
  };
  return labels[method] || "결제 완료";
}

function orderStatusLabel(status) {
  const labels = {
    ORDERED: "주문접수",
    PAYMENT_PENDING: "결제대기",
    PAID: "결제완료",
    PAYMENT_COMPLETED: "결제완료",
    PREPARING: "배송준비중",
    PREPARING_SHIPMENT: "배송준비중",
    SHIPPING: "배송중",
    DELIVERED: "배송완료",
    COMPLETED: "주문완료",
    CANCELLED: "주문취소",
    REFUNDED: "환불완료",
    REFUND_WAITING: "환불대기",
    REFUND_PROCESSING: "환불처리중",
    REFUND_COMPLETED: "환불처리완료",
  };
  return labels[status] || status || "-";
}

function refundStatusLabel(status) {
  const labels = {
    REQUESTED: "접수됨",
    REVIEWING: "심사중",
    APPROVED: "승인됨",
    REJECTED: "거절됨",
    COMPLETED: "환불완료",
  };
  return labels[status] || status;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const date = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("ko-KR");
}

function formatPrice(value) {
  return `${formatNumber(value)}원`;
}

export default App;
