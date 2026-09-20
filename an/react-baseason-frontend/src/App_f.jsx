import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* ============================================================
   상품 데이터
   - 목록 대표 이미지는 각 상품 폴더의 main.png 사용
   - 상세/옵션 이미지는 상품 상세 페이지에서 사용
============================================================ */

const products = [
  {
    id: 1,
    category: "outer",
    code: "KS0917",
    name: "미니멀 싱글 코트 _ 브라운",
    detailName: "[유니섹스] 미니멀 싱글 코트 _ 브라운",
    price: 800800,
    originalPrice: 1000000,
    discount: 20,
    image: "/images/products/outer/outer-1/main.png",
    detailImages: [
      "/images/products/outer/outer-1/detail/detail-1.png",
      "/images/products/outer/outer-1/detail/detail-2.png",
      "/images/products/outer/outer-1/detail/detail-3.png",
      "/images/products/outer/outer-1/detail/detail-4.png",
      "/images/products/outer/outer-1/detail/detail-5.png",
    ],
    colors: [
      {
        key: "brown",
        name: "브라운",
        image: "/images/products/outer/outer-1/options/brown.png",
      },
      {
        key: "black",
        name: "블랙",
        image: "/images/products/outer/outer-1/options/black.png",
      },
      {
        key: "charcoal",
        name: "차콜",
        image: "/images/products/outer/outer-1/options/charcoal.png",
      },
    ],
    sizes: ["S (95)", "M (100)", "L (105)", "XL (110)"],
    reviewCount: 100,
    rating: "4.7",
  },
  {
    id: 2,
    category: "outer",
    code: "KS0918",
    name: "미니멀 더블 울 코트 _ 블랙",
    detailName: "[유니섹스] 미니멀 더블 울 코트 _ 블랙",
    price: 179000,
    originalPrice: null,
    discount: null,
    image: "/images/products/outer/outer-2/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)", "XL (110)"],
    reviewCount: 78,
    rating: "4.6",
  },
  {
    id: 3,
    category: "outer",
    code: "KS0919",
    name: "울 블렌드 코트 _ 차콜",
    detailName: "울 블렌드 코트 _ 차콜",
    price: 169000,
    originalPrice: null,
    discount: null,
    image: "/images/products/outer/outer-3/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)", "XL (110)"],
    reviewCount: 64,
    rating: "4.5",
  },
  {
    id: 4,
    category: "outer",
    code: "KS0920",
    name: "클래식 더블 코트 _ 아이보리",
    detailName: "클래식 더블 코트 _ 아이보리",
    price: 169000,
    originalPrice: null,
    discount: null,
    image: "/images/products/outer/outer-4/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)", "XL (110)"],
    reviewCount: 51,
    rating: "4.5",
  },

  {
    id: 5,
    category: "top",
    code: "KT1001",
    name: "베이직 라운드 니트 _ 블랙",
    price: 59000,
    image: "/images/products/top/top-1/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 45,
    rating: "4.6",
  },
  {
    id: 6,
    category: "top",
    code: "KT1002",
    name: "베이직 라운드 니트 _ 브라운",
    price: 59000,
    image: "/images/products/top/top-2/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 39,
    rating: "4.5",
  },
  {
    id: 7,
    category: "top",
    code: "KT1003",
    name: "울 라운드 니트 _ 그레이",
    price: 69000,
    image: "/images/products/top/top-3/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 31,
    rating: "4.5",
  },
  {
    id: 8,
    category: "top",
    code: "KT1004",
    name: "소프트 라운드 니트 _ 아이보리",
    price: 69000,
    image: "/images/products/top/top-4/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 27,
    rating: "4.4",
  },

  {
    id: 9,
    category: "shirts",
    code: "KS1101",
    name: "클래식 코튼 셔츠 _ 화이트",
    price: 69000,
    image: "/images/products/shirts/shirts-1/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 56,
    rating: "4.7",
  },
  {
    id: 10,
    category: "shirts",
    code: "KS1102",
    name: "클래식 코튼 셔츠 _ 블루",
    price: 69000,
    image: "/images/products/shirts/shirts-2/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 43,
    rating: "4.6",
  },
  {
    id: 11,
    category: "shirts",
    code: "KS1103",
    name: "오버핏 셔츠 _ 네이비",
    price: 79000,
    image: "/images/products/shirts/shirts-3/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 38,
    rating: "4.5",
  },
  {
    id: 12,
    category: "shirts",
    code: "KS1104",
    name: "라이트 셔츠 _ 그레이",
    price: 69000,
    image: "/images/products/shirts/shirts-4/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (95)", "M (100)", "L (105)"],
    reviewCount: 34,
    rating: "4.5",
  },

  {
    id: 13,
    category: "pants",
    code: "KP1201",
    name: "와이드 슬랙스 _ 블랙",
    price: 89000,
    image: "/images/products/pants/pants-1/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (28)", "M (30)", "L (32)", "XL (34)"],
    reviewCount: 62,
    rating: "4.7",
  },
  {
    id: 14,
    category: "pants",
    code: "KP1202",
    name: "와이드 슬랙스 _ 차콜",
    price: 89000,
    image: "/images/products/pants/pants-2/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (28)", "M (30)", "L (32)", "XL (34)"],
    reviewCount: 48,
    rating: "4.6",
  },
  {
    id: 15,
    category: "pants",
    code: "KP1203",
    name: "데님 와이드 팬츠 _ 블루",
    price: 79000,
    image: "/images/products/pants/pants-3/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (28)", "M (30)", "L (32)", "XL (34)"],
    reviewCount: 41,
    rating: "4.5",
  },
  {
    id: 16,
    category: "pants",
    code: "KP1204",
    name: "와이드 팬츠 _ 아이보리",
    price: 89000,
    image: "/images/products/pants/pants-4/main.png",
    detailImages: [],
    colors: [],
    sizes: ["S (28)", "M (30)", "L (32)", "XL (34)"],
    reviewCount: 29,
    rating: "4.4",
  },
];

/* 현재는 기존 상품 중 6개를 임시 BEST SELLER로 선택.
   나중에 DB의 bestseller 값으로 교체하면 됨. */
const bestsellerIds = [1, 9, 13, 5, 3, 10];

/* ============================================================
   더미 데이터
   - 테스트용 주문 1건 / 환불 1건만 넣어둠
   - 실제 기능 연결 시 아래 두 배열을 삭제하면 됨
============================================================ */
const DUMMY_ORDER_HISTORY = [
  {
    product: products[0],
    color: "브라운",
    size: "M (100)",
    quantity: 1,
    recipient: {
      name: "admin1234",
      phone: "010-0000-0000",
      address: "경기도 성남시",
      zip: "00000",
      detailAddress: "BASEASON",
    },
    shippingRequest: "배송 전 연락주세요.",
    paymentMethod: "card",
    orderNumber: "20260916-0000001",
    orderDate: "2026. 09. 16 18:18",
  },
];

const DUMMY_REFUND_HISTORY = [
  {
    refundNumber: "RF20260916-000001",
    refundDate: "2026. 09. 16 18:30",
    refundStatus: "환불 접수",
    refundReason: "사이즈가 맞지 않음",
    refundAmount: 800800,
    product: products[0],
    color: "브라운",
    size: "M (100)",
    quantity: 1,
  },
];

const categoryInfo = {
  outer: {
    title: "OUTER",
    banner: "/images/banners/outer_banner.png",
  },
  top: {
    title: "TOP",
    banner: "/images/banners/top_banner.png",
  },
  shirts: {
    title: "SHIRTS",
    banner: "/images/banners/shirts_banner.png",
  },
  pants: {
    title: "PANTS",
    banner: "/images/banners/pants_banner.png",
  },
};

function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [menuType, setMenuType] = useState("shop");
  const [loggedIn, setLoggedIn] = useState(false);
  const [sideCategoryOpen, setSideCategoryOpen] = useState(false);

  const [orderData, setOrderData] = useState({
    product: products[0],
    color: "",
    size: "",
    quantity: 1,
    recipient: {
      name: "",
      phone: "",
      address: "",
      zip: "",
      detailAddress: "",
    },
    shippingRequest: "",
  });

  const [paymentData, setPaymentData] = useState({
    method: "",
    agree: false,
  });

  const [orderNumber, setOrderNumber] = useState("");
  const [orderHistory, setOrderHistory] = useState(DUMMY_ORDER_HISTORY);
  const [refundHistory, setRefundHistory] = useState(DUMMY_REFUND_HISTORY);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const goHome = () => {
    setPage("home");
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
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

  const goCategory = (category) => {
    setPage(category);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setMenuOpen(false);
  };

  const goProductDetail = (product) => {
    setSelectedProduct(product);
    setPage("detail");
    setMenuOpen(false);
    setCategoryOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBuy = ({ product, color, size, quantity }) => {
    setOrderData({
      product,
      color,
      size,
      quantity,
      recipient: {
        name: "",
        phone: "",
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
    setOrderData((prev) => ({ ...prev, ...data }));
    setPaymentData({ method: "", agree: false });
    setPage("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const completePayment = (method) => {
    setPaymentData((prev) => ({ ...prev, method, agree: true }));

    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const uniquePart = String(Date.now()).slice(-7);
    const newOrderNumber = `${datePart}-${uniquePart}`;
    const newOrder = {
      ...orderData,
      paymentMethod: method,
      orderNumber: newOrderNumber,
      orderDate: formatDateTime(),
    };

    setOrderData(newOrder);
    setOrderNumber(newOrderNumber);
    setOrderHistory((prev) => [newOrder, ...prev]);
    setPage("complete");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goMyPage = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);

    if (!loggedIn) {
      setMenuOpen(true);
      return;
    }

    setPage("mypage");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goRefundHistory = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("refund");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goCancelExchangeReturn = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("cancel-exchange-return");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goMemberInfo = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("member-info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goAddress = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("address");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goOrderDetail = (order) => {
    setSelectedOrder(order);
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("order-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = () => {
    setLoggedIn(true);
    setMenuOpen(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setMenuOpen(false);
    setPage("home");
  };

  const scrollToBestSeller = () => {
    setMenuOpen(false);
    setCategoryOpen(false);

    if (page !== "home") {
      setPage("home");
      setTimeout(() => {
        document
          .getElementById("best-seller")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } else {
      document
        .getElementById("best-seller")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goBestSellerPage = () => {
    setMenuOpen(false);
    setCategoryOpen(false);
    setSideCategoryOpen(false);
    setPage("bestseller");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      />

      {categoryOpen && (
        <>
          <div
            className="overlay category-overlay"
            onClick={() => setCategoryOpen(false)}
          />
          <CategoryDropdown onCategory={goCategory} />
        </>
      )}

      {menuOpen && (
        <>
          <div
            className="overlay menu-overlay"
            onClick={() => setMenuOpen(false)}
          />
          <SideMenu
            menuType={menuType}
            setMenuType={setMenuType}
            loggedIn={loggedIn}
            sideCategoryOpen={sideCategoryOpen}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onHome={goHome}
            onToggleCategory={() => setSideCategoryOpen((prev) => !prev)}
            onCategory={goCategory}
            onBestSeller={goBestSellerPage}
            onMyPage={goMyPage}
          />
        </>
      )}

      {page === "home" && <Home onProductClick={goProductDetail} />}

      {categoryInfo[page] && (
        <CategoryPage
          title={categoryInfo[page].title}
          banner={categoryInfo[page].banner}
          category={page}
          onProductClick={goProductDetail}
        />
      )}

      {page === "detail" && (
        <ProductDetail
          product={selectedProduct}
          onBuy={handleBuy}
        />
      )}

      {page === "bestseller" && (
        <BestSellerPage onProductClick={goProductDetail} />
      )}

      {page === "mypage" && (
        <MyPage
          orderHistory={orderHistory}
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
          refundHistory={refundHistory}
          onBack={goMyPage}
          onLogout={handleLogout}
          onOrderHistory={goMyPage}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
        />
      )}

      {page === "cancel-exchange-return" && (
        <CancelExchangeReturnPage
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "member-info" && (
        <MemberInfoPage
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onAddress={goAddress}
          onLogout={handleLogout}
        />
      )}

      {page === "address" && (
        <AddressPage
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onLogout={handleLogout}
        />
      )}

      {page === "order-detail" && selectedOrder && (
        <OrderDetailPage
          order={selectedOrder}
          onBack={goMyPage}
        />
      )}

      {page === "order" && (
        <OrderPage
          orderData={orderData}
          onChange={setOrderData}
          onPayment={goPayment}
        />
      )}

      {page === "payment" && (
        <PaymentPage
          orderData={orderData}
          paymentData={paymentData}
          onChange={setPaymentData}
          onComplete={completePayment}
        />
      )}

      {page === "complete" && (
        <OrderCompletePage
          orderData={orderData}
          orderNumber={orderNumber}
          onBestSeller={goBestSellerPage}
          onMyPage={goMyPage}
        />
      )}
    </div>
  );
}

function Header({
  onHome,
  onMenu,
  onCategory,
  categoryOpen,
  onBestSeller,
  onMyPage,
}) {
  return (
    <header className="header">
      <button className="logo" onClick={onHome}>
        BASEASON
      </button>

      <nav className="main-nav">
        <button
          className={`nav-button ${categoryOpen ? "active" : ""}`}
          onClick={onCategory}
        >
          CATEGORY
        </button>

        <button className="nav-button" onClick={onBestSeller}>
          BEST SELLER
        </button>
      </nav>

      <div className="header-right">
        <div className="search-area">
          <input type="text" placeholder="SEARCH" />
          <button className="icon-button search-button" aria-label="검색">
            <img src="/images/icons/icon_search.svg" alt="" />
          </button>
        </div>

        <button
          className="header-icon-button"
          aria-label="마이페이지"
          onClick={onMyPage}
        >
          <img src="/images/icons/icon_user.svg" alt="" />
        </button>

        <button className="header-icon-button" aria-label="장바구니">
          <img src="/images/icons/icon_cart.svg" alt="" />
        </button>

        <button
          className="header-icon-button menu-button"
          onClick={onMenu}
          aria-label="메뉴"
        >
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

function CategoryDropdown({ onCategory }) {
  return (
    <div className="category-dropdown">
      <button onClick={() => onCategory("outer")}>OUTER</button>
      <button onClick={() => onCategory("top")}>TOP</button>
      <button onClick={() => onCategory("shirts")}>SHIRTS</button>
      <button onClick={() => onCategory("pants")}>PANTS</button>
    </div>
  );
}

function SideMenu({
  menuType,
  setMenuType,
  loggedIn,
  sideCategoryOpen,
  onLogin,
  onLogout,
  onHome,
  onToggleCategory,
  onCategory,
  onBestSeller,
  onMyPage,
}) {
  return (
    <aside className="side-menu">
      {!loggedIn ? (
        <div className="side-login-area">
          <p>고객님은 현재 <strong>‘로그아웃’</strong> 상태입니다.</p>
          <p>‘로그인’ 후 다양한 서비스를 이용해보세요.</p>

          <div className="login-icons">
            {/* 로그인 아이콘만 실제 로그인 동작 */}
            <button onClick={onLogin}>
              <img
                src="/images/icons/icon_login.svg"
                alt="로그인"
                className="big-image-icon login-icon-image"
              />
              <strong>로그인</strong>
            </button>

            {/* 로그인 전 마이페이지는 로그인 상태를 바꾸지 않음 */}
            <button type="button">
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
          <p><strong>‘admin1234’</strong>님 즐거운 쇼핑되세요.</p>

          <div className="logged-menu">
            <button type="button" onClick={onMyPage}>
              <img
                src="/images/icons/icon_mypage.svg"
                alt="마이페이지"
                className="big-image-icon"
              />
              <strong>마이페이지</strong>
            </button>

            <div className="mypage-links">
              <button type="button" onClick={onMyPage}>결제 내역</button>
              <button type="button" onClick={onMyPage}>주문내역</button>
            </div>
          </div>
        </div>
      )}

      <div className="menu-tabs">
        <button
          className={menuType === "shop" ? "selected" : ""}
          onClick={() => setMenuType("shop")}
        >
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
          {/* 사이드 메뉴 전용 CATEGORY: 헤더 드롭다운과 별개 */}
          <button
            className={`side-category-toggle ${sideCategoryOpen ? "open" : ""}`}
            onClick={onToggleCategory}
          >
            <span>CATEGORY</span>
            <span className="side-category-close">
              {sideCategoryOpen ? "×" : ""}
            </span>
          </button>

          {sideCategoryOpen && (
            <div className="side-category-submenu">
              <button onClick={() => onCategory("outer")}>OUTER</button>
              <button onClick={() => onCategory("top")}>TOP</button>
              <button onClick={() => onCategory("shirts")}>SHIRTS</button>
              <button onClick={() => onCategory("pants")}>PANTS</button>
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
function Home({ onProductClick }) {
  const bestsellerProducts = useMemo(
    () =>
      bestsellerIds
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    []
  );

  const [startIndex, setStartIndex] = useState(0);

  const visibleProducts = Array.from({ length: 4 }, (_, index) => {
    return bestsellerProducts[(startIndex + index) % bestsellerProducts.length];
  });

  const moveLeft = () => {
    setStartIndex(
      (prev) =>
        (prev - 1 + bestsellerProducts.length) %
        bestsellerProducts.length
    );
  };

  const moveRight = () => {
    setStartIndex(
      (prev) => (prev + 1) % bestsellerProducts.length
    );
  };

  return (
    <main className="home">
      <section className="main-banner" onClick={() => onProductClick(products[0])}>
        <img
          src="/images/banners/main_banner.png"
          alt="A Better Season 2025 Fall Winter"
        />
      </section>

      <section className="best-seller-section" id="best-seller">
        <h2>BESTSELLER</h2>

        <div className="best-seller-slider">
          <button
            className="slider-arrow left"
            onClick={moveLeft}
            aria-label="이전 상품"
          >
            ‹
          </button>

          <div className="best-seller-track">
            {visibleProducts.map((product, index) => (
              <article
                className="best-seller-card"
                key={`${product.id}-${index}`}
                onClick={() => onProductClick(product)}
              >
                <div className="best-seller-image">
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="best-seller-info">
                  <strong>{product.name}</strong>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </article>
            ))}
          </div>

          <button
            className="slider-arrow right"
            onClick={moveRight}
            aria-label="다음 상품"
          >
            ›
          </button>
        </div>
      </section>
    </main>
  );
}

function BestSellerPage({ onProductClick }) {
  const bestsellerProducts = bestsellerIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean);

  return (
    <main className="bestseller-page">
      <section className="bestseller-heading">
        <h1>BEST SELLER</h1>
        <p>BASEASON에서 가장 사랑받는 상품을 만나보세요.</p>
      </section>

      <section className="product-grid bestseller-grid">
        {bestsellerProducts.map((product) => (
          <article
            className="product-card"
            key={product.id}
            onClick={() => onProductClick(product)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <strong>{product.name}</strong>
              <span>{formatPrice(product.price)}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function CategoryPage({
  title,
  banner,
  category,
  onProductClick,
}) {
  const categoryProducts = products.filter(
    (product) => product.category === category
  );

  return (
    <main className="category-page">
      <section className="category-banner">
        <img src={banner} alt={`${title} category banner`} />
        <h1>{title}</h1>
      </section>

      <section className="product-grid">
        {categoryProducts.map((product) => (
          <article
            className="product-card"
            key={product.id}
            onClick={() => onProductClick(product)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <strong>{product.name}</strong>
              <span>{formatPrice(product.price)}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function ProductDetail({ product, onBuy }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const detailImages = product.detailImages || [];
  const [mainImage, setMainImage] = useState(detailImages[0] || null);

  const selectedColorData = product.colors?.find(
    (color) => color.key === selectedColor
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
    if (!selectedColor && product.colors?.length) {
      window.alert("색상을 선택해주세요.");
      return;
    }

    if (!selectedSize) {
      window.alert("사이즈를 선택해주세요.");
      return;
    }

    onBuy({
      product,
      color: selectedColorData ? selectedColorData.name : "",
      size: selectedSize,
      quantity,
    });
  };

  return (
    <main className="product-detail-page">
      <section className="detail-container">
        <div className="detail-left">
          <div className="detail-main-image">
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <div className="detail-image-empty">
                상세 이미지를 준비해주세요.
              </div>
            )}
          </div>

          <div className="detail-thumbnails">
            {detailImages.map((image, index) => (
              <button
                key={image}
                className={mainImage === image ? "selected" : ""}
                onClick={() => setMainImage(image)}
              >
                <img
                  src={image}
                  alt={`상품 상세 이미지 ${index + 1}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-right">
          <div className="detail-top-row">
            <div
              className="product-code copyable"
              onClick={() =>
                copyText(product.code, "상품번호가 복사되었습니다.")
              }
              title="상품번호 복사"
            >
              상품번호 : {product.code}
              <img
                src="/images/icons/icon_copy.svg"
                alt="복사"
                className="inline-icon"
              />
            </div>

            <button
              className="share-button"
              onClick={() =>
                copyText(
                  window.location.href,
                  "상품 상세 페이지 링크가 복사되었습니다."
                )
              }
              title="상품 링크 복사"
            >
              <img src="/images/icons/icon_share.svg" alt="공유" />
            </button>
          </div>

          <h1 className="detail-title">
            {product.detailName || product.name}
          </h1>

          <div className="detail-tags">
            {product.originalPrice && <span>오늘만 할인</span>}
            <span>무료 배송</span>

            <button
              className="review-button"
              onClick={() =>
                window.alert("리뷰 페이지는 다음 단계에서 연결합니다.")
              }
            >
              <img src="/images/icons/icon_review.svg" alt="" />
              {product.rating} 리뷰 {product.reviewCount}
            </button>
          </div>

          <div className="price-area">
            {product.originalPrice && (
              <>
                <span className="original-price">
                  {formatNumber(product.originalPrice)}
                </span>
                <span className="price-divider">/</span>
              </>
            )}

            <strong>{formatNumber(product.price)}</strong>

            {product.discount && (
              <span className="discount">{product.discount}%</span>
            )}
          </div>

          {product.originalPrice && (
            <p className="discount-info">
              총 {formatNumber(product.originalPrice - product.price)}원 할인
            </p>
          )}

          <hr />

          {product.colors?.length > 0 && (
            <div className="option-section">
              <div className="option-title">
                <h3>옵션</h3>
                <p className={selectedColorData ? "selected-option" : ""}>
                  {selectedColorData
                    ? selectedColorData.name
                    : "색상을 선택해주세요"}
                </p>
              </div>

              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color.key}
                    className={selectedColor === color.key ? "selected" : ""}
                    onClick={() => setSelectedColor(color.key)}
                    title={color.name}
                  >
                    <img
                      src={color.image}
                      alt={color.name}
                      onError={(e) => {
                        e.currentTarget.src = product.image;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="size-section">
            <div className="option-title">
              <h3>사이즈</h3>
              <p className={selectedSize ? "selected-option" : ""}>
                {selectedSize ? selectedSize : "사이즈를 선택해주세요"}
              </p>
            </div>

            <div className="size-buttons">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={selectedSize === size ? "selected" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-area">
            <strong>수량</strong>
            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="total-area">
            <strong>총금액</strong>
            <span>{formatNumber(product.price * quantity)}원</span>
          </div>

          <button className="buy-button" onClick={handleBuy}>
            <img src="/images/icons/icon_delivery.svg" alt="" />
            구매하기
          </button>
        </div>
      </section>
    </main>
  );
}

function OrderPage({ orderData, onChange, onPayment }) {
  const { product, color, size, quantity, recipient, shippingRequest } = orderData;

  useEffect(() => {
    // 다음 우편번호 서비스를 주문 페이지에서 미리 불러옵니다.
    if (window.daum?.Postcode) return;

    const existingScript = document.querySelector(
      'script[data-daum-postcode="true"]'
    );

    if (existingScript) return;

    const script = document.createElement("script");
    script.src =
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.dataset.daumPostcode = "true";
    document.body.appendChild(script);

    return () => {
      // 다른 페이지로 이동해도 이미 로드된 스크립트는 그대로 사용합니다.
    };
  }, []);
  const salePrice = product.price;
  const originalPrice = product.originalPrice || product.price;
  const productAmount = originalPrice * quantity;
  const discountAmount = Math.max(0, originalPrice - salePrice) * quantity;
  const shippingFee = 3000;
  const paymentAmount = productAmount - discountAmount + shippingFee;

  const updateRecipient = (key, value) => {
    onChange((prev) => ({
      ...prev,
      recipient: {
        ...prev.recipient,
        [key]: value,
      },
    }));
  };

  const canPayment =
    recipient.name.trim() &&
    recipient.phone.trim() &&
    recipient.address.trim() &&
    recipient.zip.trim() &&
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
            data.addressType === "R"
              ? [data.bname, data.buildingName]
                  .filter(Boolean)
                  .join(", ")
              : "";

          updateRecipient("zip", data.zonecode || "");
          updateRecipient(
            "address",
            extraAddress ? `${address} (${extraAddress})` : address
          );
        },
      }).open();
    };

    if (window.daum?.Postcode) {
      open();
      return;
    }

    const script = document.querySelector(
      'script[data-daum-postcode="true"]'
    );

    if (script) {
      script.addEventListener("load", open, { once: true });
      return;
    }

    const newScript = document.createElement("script");
    newScript.src =
      "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    newScript.async = true;
    newScript.dataset.daumPostcode = "true";
    newScript.addEventListener("load", open, { once: true });
    newScript.addEventListener(
      "error",
      () => alert("우편번호 서비스를 불러오지 못했습니다. 인터넷 연결을 확인해주세요."),
      { once: true }
    );
    document.body.appendChild(newScript);
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
                <img src={product.image} alt={product.name} />
              </div>
              <div className="order-product-info">
                <strong>{product.detailName || product.name}</strong>
                <span>
                  옵션 : {color || "기본 옵션"}, {size}
                </span>
              </div>
              <strong className="order-unit-price">
                {formatPrice(salePrice)}
              </strong>
              <div className="order-quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1),
                    }))
                  }
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      quantity: prev.quantity + 1,
                    }))
                  }
                >
                  +
                </button>
              </div>
              <strong className="order-row-total">
                {formatPrice(salePrice * quantity)}
              </strong>
            </div>

            <div className="checkout-section receiver-section">
              <h2>받는 분 정보</h2>
              <div className="receiver-grid receiver-grid-first">
                <label>
                  <span>받는 분 성함</span>
                  <input
                    value={recipient.name}
                    onChange={(e) => updateRecipient("name", e.target.value)}
                  />
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
                  <input
                    value={recipient.address}
                    onChange={(e) => updateRecipient("address", e.target.value)}
                  />
                </label>
                <label className="zip-field">
                  <span>우편번호</span>
                  <input
                    value={recipient.zip}
                    onChange={(e) => updateRecipient("zip", e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="zip-button"
                  onClick={openPostcode}
                >
                  우편번호 찾기
                </button>
              </div>

              <input
                className="detail-address-input"
                value={recipient.detailAddress}
                onChange={(e) =>
                  updateRecipient("detailAddress", e.target.value)
                }
                placeholder="상세 주소를 입력해주세요."
              />
            </div>

            <div className="checkout-section shipping-request-section">
              <h2>배송 시 요청사항</h2>
              <select
                value={shippingRequest}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    shippingRequest: e.target.value,
                  }))
                }
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
            product={product}
            quantity={quantity}
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

function OrderSummaryCard({
  product,
  quantity,
  productAmount,
  discountAmount,
  shippingFee,
  paymentAmount,
  onPayment,
  disabled,
}) {
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
      <button
        type="button"
        className="summary-payment-button"
        disabled={disabled}
        onClick={onPayment}
      >
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

function PaymentPage({ orderData, paymentData, onChange, onComplete }) {
  const { product, color, size, quantity } = orderData;
  const originalPrice = product.originalPrice || product.price;
  const productAmount = originalPrice * quantity;
  const discountAmount = Math.max(0, originalPrice - product.price) * quantity;
  const shippingFee = 3000;
  const paymentAmount = productAmount - discountAmount + shippingFee;

  const methods = [
    { key: "card", icon: "▣", label: "신용 / 체크카드" },
    { key: "kakao", icon: "●", label: "카카오 페이" },
    { key: "naver", icon: "N", label: "네이버 페이" },
    { key: "toss", icon: "◐", label: "토스 페이" },
    { key: "bank", icon: "♜", label: "무통장 입금" },
  ];

  const canPay = paymentData.method && paymentData.agree;

  return (
    <main className="checkout-page payment-page">
      <div className="checkout-inner">
        <section className="checkout-heading">
          <div>
            <h1>주문 / 결제하기</h1>
            <p>원하시는 결제 방법을 선택해주세요.</p>
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
                  className={`payment-method ${
                    paymentData.method === method.key ? "selected" : ""
                  }`}
                  onClick={() =>
                    onChange((prev) => ({ ...prev, method: method.key }))
                  }
                >
                  <span className="payment-radio" />
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-label">{method.label}</span>
                </button>
              ))}
            </div>

            <div className="points-section">
              <h2>적립금 사용</h2>
              <div className="points-input-row">
                <input value="0원" readOnly />
                <button type="button" disabled>전액 사용</button>
              </div>
              <p>보유 적립금 0원</p>
            </div>
          </section>

          <aside className="payment-summary-card">
            <h2>주문 상품</h2>
            <div className="payment-product-row">
              <div className="payment-product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="payment-product-info">
                <strong>{product.detailName || product.name}</strong>
                <span>옵션 : {color || "기본 옵션"}, {size}</span>
                <span>수량 : {quantity}개</span>
              </div>
              <strong className="payment-product-price">
                {formatPrice(product.price * quantity)}
              </strong>
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
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, agree: e.target.checked }))
                }
              />
              <span>[필수] 결제 서비스 이용 약관, 개인정보 처리 동의</span>
              <b>›</b>
            </label>

            <button
              type="button"
              className="final-payment-button"
              disabled={!canPay}
              onClick={() => onComplete(paymentData.method)}
            >
              {formatPrice(paymentAmount)} 결제하기
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}


function MyPage({
  orderHistory,
  onOrderDetail,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 주문내역
        </div>

        <div className="mypage-layout">
          <aside className="mypage-sidebar">
            <div className="mypage-user">
              <img src="/images/icons/icon_mypage.svg" alt="" />
              <div>
                <span>안녕하세요,</span>
                <strong>admin1234님</strong>
              </div>
            </div>

            <nav className="mypage-nav">
              <button className="active" type="button">주문내역</button>
              <button type="button" onClick={onRefund}>환불내역</button>
              <button type="button" onClick={onCancelExchangeReturn}>취소/교환/반품 내역</button>
              <button type="button" onClick={onMemberInfo}>회원정보수정</button>
              <button type="button" onClick={onAddress}>배송지 관리</button>
            </nav>

            <button className="mypage-logout" type="button" onClick={onLogout}>
              LOGOUT
            </button>
          </aside>

          <section className="mypage-content">
            <div className="mypage-heading">
              <div>
                <h1>주문내역</h1>
                <p>지금까지 주문하신 내역을 확인하실 수 있습니다.</p>
              </div>
              <span>총 {orderHistory.length}건</span>
            </div>

            <div className="mypage-tabs">
              <button className="active" type="button">
                주문내역 조회 ({orderHistory.length})
              </button>
              <button type="button" onClick={onCancelExchangeReturn}>
                취소/교환/반품 내역
              </button>
            </div>

            {orderHistory.length === 0 ? (
              <div className="empty-order-history">
                <div className="empty-order-icon">⌁</div>
                <h2>주문내역이 없습니다.</h2>
                <p>아직 주문하신 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="order-history-list">
                {orderHistory.map((order) => (
                  <article className="history-order-card" key={order.orderNumber}>
                    <div className="history-order-head">
                      <span>{order.orderDate}</span>
                      <strong>주문번호 {order.orderNumber}</strong>
                      <button type="button" onClick={() => onOrderDetail(order)}>
                        상세보기 ›
                      </button>
                    </div>

                    <div className="history-order-body">
                      <div className="history-product-image">
                        <img src={order.product.image} alt={order.product.name} />
                      </div>

                      <div className="history-product-info">
                        <strong>{order.product.detailName || order.product.name}</strong>
                        <span>옵션 : {order.color || "기본 옵션"}, {order.size}</span>
                        <span>수량 : {order.quantity}개</span>
                      </div>

                      <strong className="history-product-price">
                        {formatPrice(order.product.price * order.quantity)}
                      </strong>

                      <div className="history-order-status">
                        <strong>주문완료</strong>
                        <button type="button" onClick={() => onOrderDetail(order)}>
                          주문상세보기
                        </button>
                      </div>
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

function OrderDetailPage({ order, onBack }) {
  const originalPrice = order.product.originalPrice || order.product.price;
  const productAmount = originalPrice * order.quantity;
  const discountAmount =
    Math.max(0, originalPrice - order.product.price) * order.quantity;
  const shippingFee = 3000;
  const paymentAmount = productAmount - discountAmount + shippingFee;

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
                <strong>{order.orderNumber}</strong>
              </div>
              <div>
                <span>주문상태</span>
                <strong>결제완료</strong>
              </div>
              <div>
                <span>결제방법</span>
                <strong>{paymentMethodLabel(order.paymentMethod)}</strong>
              </div>
            </div>

            <div className="order-detail-product">
              <div className="order-detail-image">
                <img src={order.product.image} alt={order.product.name} />
              </div>
              <div className="order-detail-info">
                <strong>{order.product.detailName || order.product.name}</strong>
                <span>상품번호 : {order.product.code}</span>
                <span>옵션 : {order.color || "기본 옵션"}, {order.size}</span>
                <span>수량 : {order.quantity}개</span>
              </div>
              <strong className="order-detail-price">
                {formatPrice(order.product.price * order.quantity)}
              </strong>
            </div>

            <div className="order-detail-delivery">
              <h2>배송 정보</h2>
              <div><span>받는 분</span><strong>{order.recipient?.name || "-"}</strong></div>
              <div><span>연락처</span><strong>{order.recipient?.phone || "-"}</strong></div>
              <div><span>주소</span><strong>{order.recipient?.address || "-"} {order.recipient?.detailAddress || ""}</strong></div>
              <div><span>배송 요청사항</span><strong>{order.shippingRequest || "-"}</strong></div>
            </div>

            <div className="order-detail-payment">
              <h2>결제 금액</h2>
              <div><span>상품 금액</span><strong>{formatPrice(productAmount)}</strong></div>
              <div><span>할인 금액</span><strong>- {formatPrice(discountAmount)}</strong></div>
              <div><span>배송비</span><strong>{formatPrice(shippingFee)}</strong></div>
              <div className="total"><span>최종 결제 금액</span><strong>{formatPrice(paymentAmount)}</strong></div>
            </div>
          </div>

          <button className="order-detail-back" type="button" onClick={onBack}>
            주문내역으로 돌아가기
          </button>
        </section>
      </div>
    </main>
  );
}

function RefundHistoryPage({
  refundHistory,
  onBack,
  onLogout,
  onOrderHistory,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
}) {
  return (
    <main className="mypage">
      <div className="mypage-inner refund-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 환불내역
        </div>

        <div className="mypage-layout">
          <aside className="mypage-sidebar">
            <div className="mypage-user">
              <img src="/images/icons/icon_mypage.svg" alt="" />
              <div>
                <span>안녕하세요,</span>
                <strong>admin1234님</strong>
              </div>
            </div>

            <nav className="mypage-nav">
              <button type="button" onClick={onOrderHistory}>주문내역</button>
              <button className="active" type="button">환불내역</button>
              <button type="button" onClick={onCancelExchangeReturn}>취소/교환/반품 내역</button>
              <button type="button" onClick={onMemberInfo}>회원정보수정</button>
              <button type="button" onClick={onAddress}>배송지 관리</button>
            </nav>

            <button className="mypage-logout" type="button" onClick={onLogout}>LOGOUT</button>
          </aside>

          <section className="mypage-content refund-content">
            <div className="mypage-heading">
              <div>
                <h1>환불내역</h1>
                <p>신청하신 환불 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <span>총 {refundHistory.length}건</span>
            </div>

            {refundHistory.length === 0 ? (
              <div className="refund-empty">
                <div className="refund-empty-icon">↩</div>
                <h2>환불내역이 없습니다.</h2>
                <p>아직 환불을 신청한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="refund-history-list">
                {refundHistory.map((refund) => (
                  <article className="refund-history-card" key={refund.refundNumber}>
                    <div className="refund-history-head">
                      <span>{refund.refundDate}</span>
                      <strong>환불번호 {refund.refundNumber}</strong>
                    </div>

                    <div className="refund-history-body">
                      <div className="refund-history-image">
                        <img src={refund.product.image} alt={refund.product.name} />
                      </div>

                      <div className="refund-history-info">
                        <strong>{refund.product.detailName || refund.product.name}</strong>
                        <span>옵션 : {refund.color || "기본 옵션"}, {refund.size}</span>
                        <span>수량 : {refund.quantity}개</span>
                        <span>환불 사유 : {refund.refundReason}</span>
                      </div>

                      <strong className="refund-history-price">
                        {formatPrice(refund.refundAmount)}
                      </strong>

                      <div className="refund-history-status">
                        <strong>{refund.refundStatus}</strong>
                        <span>상품 수거 예정</span>
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
                <li>환불 진행 상태는 마이페이지의 환불내역에서 확인하실 수 있습니다.</li>
                <li>상품 상태 및 환불 사유에 따라 처리 결과가 달라질 수 있습니다.</li>
                <li>보다 자세한 내용은 고객센터 또는 Q&amp;A를 이용해주세요.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MyPageSidebar({ active, onOrderHistory, onRefund, onCancelExchangeReturn, onMemberInfo, onAddress, onLogout }) {
  return (
    <aside className="mypage-sidebar">
      <div className="mypage-user">
        <img src="/images/icons/icon_mypage.svg" alt="" />
        <div>
          <span>안녕하세요,</span>
          <strong>admin1234님</strong>
        </div>
      </div>

      <nav className="mypage-nav">
        <button className={active === "order" ? "active" : ""} type="button" onClick={onOrderHistory}>주문내역</button>
        <button className={active === "refund" ? "active" : ""} type="button" onClick={onRefund}>환불내역</button>
        <button className={active === "cancel" ? "active" : ""} type="button" onClick={onCancelExchangeReturn}>취소/교환/반품 내역</button>
        <button className={active === "member" ? "active" : ""} type="button" onClick={onMemberInfo}>회원정보수정</button>
        <button className={active === "address" ? "active" : ""} type="button" onClick={onAddress}>배송지 관리</button>
      </nav>

      <button className="mypage-logout" type="button" onClick={onLogout}>LOGOUT</button>
    </aside>
  );
}

function CancelExchangeReturnPage({ onOrderHistory, onRefund, onMemberInfo, onAddress, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 취소/교환/반품 내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="cancel"
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
                <p>신청하신 취소, 교환, 반품 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <span>총 0건</span>
            </div>

            <div className="empty-status-box">
              <div className="empty-status-icon">↺</div>
              <h2>취소/교환/반품 내역이 없습니다.</h2>
              <p>아직 취소, 교환 또는 반품을 신청한 상품이 없습니다.</p>
            </div>

            <div className="empty-guide">
              <h2>안내</h2>
              <p>주문하신 상품에 대한 취소, 교환, 반품 신청 후 진행 상태가 이곳에 표시됩니다.</p>
              <p>자세한 신청 방법과 처리 기준은 각 신청 페이지에서 확인하실 수 있습니다.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MemberInfoPage({ onOrderHistory, onRefund, onCancelExchangeReturn, onAddress, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 회원정보 수정
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="member"
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

            <div className="setting-card">
              <div className="setting-row">
                <span>아이디</span>
                <strong>admin1234</strong>
              </div>
              <div className="setting-row">
                <span>이름</span>
                <strong>admin1234</strong>
              </div>
              <div className="setting-row">
                <span>비밀번호</span>
                <button type="button" className="small-setting-button">비밀번호 변경</button>
              </div>
              <div className="setting-row">
                <span>휴대전화</span>
                <strong>등록된 정보 없음</strong>
              </div>
              <div className="setting-row">
                <span>이메일</span>
                <strong>등록된 정보 없음</strong>
              </div>
            </div>

            <div className="setting-actions">
              <button type="button" className="setting-primary-button">수정하기</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AddressPage({ onOrderHistory, onRefund, onCancelExchangeReturn, onMemberInfo, onLogout }) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>›</span> 마이페이지 <span>›</span> 배송지 관리
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="address"
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

            <div className="address-empty-box">
              <div className="empty-status-icon">⌂</div>
              <h2>등록된 배송지가 없습니다.</h2>
              <p>배송지를 등록하면 주문할 때 편리하게 이용할 수 있습니다.</p>
              <button type="button" className="setting-primary-button">배송지 추가</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function OrderCompletePage({ orderData, orderNumber, onBestSeller, onMyPage }) {
  const { product, color, size, quantity } = orderData;
  const originalPrice = product.originalPrice || product.price;
  const productAmount = originalPrice * quantity;
  const discountAmount = Math.max(0, originalPrice - product.price) * quantity;
  const paymentAmount = productAmount - discountAmount + 3000;

  return (
    <main className="checkout-page complete-page">
      <div className="complete-inner">
        <div className="complete-icon">✓</div>
        <h1>상품 주문이 완료되었습니다.</h1>
        <p>BASEASON을 이용해주셔서 감사합니다.</p>
        <p>주문하신 상품은 빠르게 준비하여 안전하게 배송해드리겠습니다.</p>

        <div className="complete-order-card">
          <div className="complete-order-details">
            <div><span>주문번호</span><strong>{orderNumber}</strong></div>
            <div><span>주문일시</span><strong>{formatDateTime()}</strong></div>
            <div><span>결제방법</span><strong>{paymentMethodLabel(orderData.paymentMethod)}</strong></div>
            <div><span>주문금액</span><strong>{formatPrice(paymentAmount)}</strong></div>
          </div>

          <div className="complete-product">
            <div className="complete-product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="complete-product-info">
              <strong>{product.detailName || product.name}</strong>
              <span>옵션 : {color || "기본 옵션"}, {size}</span>
              <span>수량 : {quantity}개</span>
            </div>
            <strong className="complete-product-price">
              {formatPrice(product.price * quantity)}
            </strong>
          </div>
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

function formatDateTime() {
  const now = new Date();
  const date = `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. ${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

function formatNumber(value) {
  return Number(value).toLocaleString("ko-KR");
}

function formatPrice(value) {
  return `${formatNumber(value)}원`;
}

export default App;
