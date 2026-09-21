import React, { useEffect, useState } from "react";
import "./App.css";
import NoticeList from "./NoticeList";
import mainPhoto from "./assets/main-photo.jpg";
import { APP_PATHS } from "./config/paths";

// ============================================================
// 공통 스타일
// ============================================================

const box = {
  background: "#fff",
  padding: 24,
  borderRadius: 8,
  border: "1px solid #E2DCD5",
  marginBottom: 24,
};

const button = {
  background: "#6B5B52",
  color: "#fff",
  border: 0,
  borderRadius: 4,
  padding: "7px 11px",
  cursor: "pointer",
  fontSize: 12,
};

const input = {
  padding: 10,
  border: "1px solid #DED8D2",
  borderRadius: 4,
  fontSize: 12,
  boxSizing: "border-box",
  width: "100%",
  margin: "6px 0 14px",
};

// ============================================================
// App
// ============================================================

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [loginInputId, setLoginInputId] = useState("admin01");
  const [loginInputPw, setLoginInputPw] = useState("1234");

  const [activeTab, setActiveTab] = useState("admin");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    org_code: "",
    org_name: "",
    phone: "",
    email: "",
    address1: "",
  });

  const [modal, setModal] = useState(null);
  const [page, setPage] = useState("dashboard");

  const [inquiryCategory, setInquiryCategory] = useState("전체");

  // ============================================================
  // 브라우저 뒤로가기
  // ============================================================

  useEffect(() => {
    const initialState = {
      baseseason: true,
      page: "dashboard",
      activeTab: "admin",
    };

    if (!window.history.state?.baseseason) {
      window.history.replaceState(initialState, "");
    }

    const handlePopState = (event) => {
      const state = event.state;

      if (!state?.baseseason) return;

      setPage(state.page || "dashboard");
      setActiveTab(state.activeTab || "admin");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function navigatePage(nextPage) {
    setPage(nextPage);

    window.history.pushState(
      {
        baseseason: true,
        page: nextPage,
        activeTab,
      },
      "",
    );
  }

  function navigateTab(nextTab) {
    setPage("dashboard");
    setActiveTab(nextTab);

    window.history.pushState(
      {
        baseseason: true,
        page: "dashboard",
        activeTab: nextTab,
      },
      "",
    );
  }

  // ============================================================
  // 1:1 문의 페이지
  // ============================================================

  const [inquiryPage, setInquiryPage] = useState(1);
  const INQUIRIES_PER_PAGE = 10;

  // ============================================================
  // 조직 데이터
  // ============================================================

  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/org-units")
      .then((response) => {
        if (!response.ok) {
          throw new Error("조직 데이터를 가져오지 못했습니다.");
        }

        return response.json();
      })
      .then((data) => {
        console.log("shopdb3jo 조직 데이터:", data);
        setOrgs(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("shopdb3jo 조직 조회 오류:", error);
        setOrgs([]);
      });
  }, []);

  // ============================================================
  // 회원 데이터
  // ============================================================

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("회원 데이터를 가져오지 못했습니다.");
        }

        return response.json();
      })
      .then((data) => {
        console.log("shopdb3jo 회원 데이터:", data);
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("shopdb3jo 회원 조회 오류:", error);
        setUsers([]);
      });
  }, []);

  // ============================================================
  // 상품 데이터
  // ============================================================

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("상품 데이터를 가져오지 못했습니다.");
        }

        return response.json();
      })
      .then((data) => {
        console.log("실제 DB products:", data);

        const convertedProducts = (Array.isArray(data) ? data : []).map(
          (item) => ({
            product_id: item.product_id,
            product_name: item.product_name,

            seller: item.seller_user_id
              ? `판매자 ${item.seller_user_id}`
              : "-",

            price: Number(
              item.price ??
                item.sale_price ??
                item.base_price ??
                0,
            ),

            stock: Number(item.stock ?? 0),

            safety_stock: Number(item.safety_stock ?? 0),

            image_url:
              item.image_url ??
              item.product_image ??
              "",
          }),
        );

        setProducts(convertedProducts);
      })
      .catch((error) => {
        console.error("상품 DB 연결 오류:", error);
        setProducts([]);
      });
  }, []);

  // ============================================================
  // 주문 데이터
  // ============================================================

  const [orders, setOrders] = useState([]);

  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 10;

  const totalOrderPages = Math.ceil(
    orders.length / ordersPerPage,
  );

  const paginatedOrders = orders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage,
  );

  useEffect(() => {
   Promise.all([
  fetch("http://127.0.0.1:8000/api/orders").then((res) =>
    res.json(),
  ),
  fetch("http://127.0.0.1:8000/api/order-items").then((res) =>
    res.json(),
  ),
  fetch("http://127.0.0.1:8000/api/product-images").then((res) =>
    res.json(),
  ),
  fetch("http://127.0.0.1:8000/api/file-assets").then((res) =>
    res.json(),
  ),
])
      .then(
  ([
    ordersData,
    orderItemsData,
    productImagesData,
    fileAssetsData,
  ]) => {
        console.log("실제 orders:", ordersData);
        console.log("실제 order_items:", orderItemsData);

        const safeOrders = Array.isArray(ordersData)
          ? ordersData
          : [];

        const safeOrderItems = Array.isArray(orderItemsData)
          ? orderItemsData
          : [];

        const convertedOrders = safeOrderItems.map((item) => {
          const order = safeOrders.find(
            (o) =>
              Number(o.order_id) === Number(item.order_id),
          );
const productImage = productImagesData.find(
  (img) =>
    Number(img.product_id) === Number(item.product_id) &&
    img.image_type === "MAIN" &&
    img.active_yn === "Y",
);

const fileAsset = fileAssetsData.find(
  (file) =>
    Number(file.file_id) === Number(productImage?.file_id),
);

let productImageUrl =
  fileAsset?.thumbnail_url ||
  fileAsset?.public_url ||
  "";

if (
  productImageUrl &&
  productImageUrl.startsWith("/")
) {
  productImageUrl =
    "http://127.0.0.1:8000" + productImageUrl;
}
          return {
            order_id: item.order_id,
product_id: item.product_id,
  product_image: productImageUrl,
            buyer: order?.buyer_user_id
              ? `구매자 ${order.buyer_user_id}`
              : "-",

            product_name:
              item.product_name_snapshot || "-",

            qty: Number(item.quantity || 0),

            total_amount:
              Number(item.quantity || 0) *
              Number(item.unit_price || 0),

            payment_status:
              order?.payment_status || "-",

            order_status:
              order?.order_status || "-",

            org_id: order?.org_id ?? null,
          };
        });

        console.log(
          "화면용 실제 주문:",
          convertedOrders,
        );

        setOrders(convertedOrders);
      })
      .catch((error) => {
        console.error(
          "주문/주문상품 DB 연결 오류:",
          error,
        );

        setOrders([]);
      });
  }, []);

  // ============================================================
  // 1:1 문의 데이터
  // ============================================================

  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/buyer-inquiries")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "1:1 문의 데이터를 가져오지 못했습니다.",
          );
        }

        return response.json();
      })
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];

        const convertedData = safeData.map((item) => {
          const categoryMap = {
            "1)상품문의": "상품 문의",
            "2)주문및결제": "주문·결제",
            "3)배송": "배송",
            "4)교환반품": "교환/반품",
          };

          const statusMap = {
            ANSWERED: "답변완료",
            RECEIVED: "미답변",
          };

          return {
            inquiry_id: item.inquiry_id,

            author: `구매자 ${item.user_id}`,

            title: item.title,
            content: item.content,

            category:
              categoryMap[item.category_code] || "기타",

            status:
              statusMap[item.inquiry_status] ||
              item.inquiry_status,

            created_at: item.created_at
              ? String(item.created_at).slice(0, 10)
              : "-",

            answer_content: item.answer_content,

            org_id: item.org_id,

            user_id: item.user_id,
          };
        });

        console.log(
          "실제 DB 1:1 문의:",
          convertedData,
        );

        setInquiries(convertedData);
      })
      .catch((error) => {
        console.error(
          "1:1 문의 DB 연결 오류:",
          error,
        );

        setInquiries([]);
      });
  }, []);

  // ============================================================
  // 문의 필터
  // ============================================================

  const filteredInquiries =
    inquiryCategory === "전체"
      ? inquiries
      : inquiries.filter(
          (item) =>
            item.category === inquiryCategory,
        );

  const totalInquiryPages = Math.max(
    1,
    Math.ceil(
      filteredInquiries.length /
        INQUIRIES_PER_PAGE,
    ),
  );

  const paginatedInquiries =
    filteredInquiries.slice(
      (inquiryPage - 1) *
        INQUIRIES_PER_PAGE,
      inquiryPage *
        INQUIRIES_PER_PAGE,
    );

  // ============================================================
  // 로그인
  // ============================================================

  function processLogin(loginId) {
    if (!loginId.trim()) {
      return setMessage(
        "아이디를 입력해주세요.",
      );
    }

    const isAdmin =
      loginId.includes("admin");

    const isSeller =
      loginId.includes("seller");

    const tab = isAdmin
      ? "admin"
      : isSeller
        ? "seller"
        : "customer";

    const role = isAdmin
      ? "관리자"
      : isSeller
        ? "판매자"
        : "구매자";

    const name = isAdmin
      ? "본사관리자"
      : isSeller
        ? loginId === "seller01"
          ? "전자판매자"
          : "패션판매자"
        : loginId === "buyer01"
          ? "구매자A"
          : loginId === "buyer02"
            ? "구매자B"
            : "구매자C";

    setCurrentUser({
      login_id: loginId,
      user_name: name,
      role,
    });

    setActiveTab(tab);
    setPage("dashboard");
    setIsLoggedIn(true);

    window.history.pushState(
      {
        baseseason: true,
        page: "dashboard",
        activeTab: tab,
      },
      "",
    );

    setMessage(
      `[로그인 성공] ${name} (${role})님 환영합니다!`,
    );
  }

  function submitLogin(e) {
    e.preventDefault();

    if (!loginInputPw.trim()) {
      return setMessage(
        "비밀번호를 입력해주세요.",
      );
    }

    processLogin(loginInputId);
  }

  function logout() {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMessage("안전하게 로그아웃되었습니다.");
  }

  // ============================================================
  // 지사 등록
  // ============================================================

  function addOrg(e) {
    e.preventDefault();

    if (
      !form.org_code.trim() ||
      !form.org_name.trim()
    ) {
      return setMessage(
        "조직 코드와 조직명은 반드시 입력해야 합니다.",
      );
    }

    setOrgs([
      ...orgs,
      {
        org_id: Date.now(),
        org_code: form.org_code,
        org_name: form.org_name,
        org_type: "BRANCH",
        phone: form.phone || "-",
      },
    ]);

    setForm({
      org_code: "",
      org_name: "",
      phone: "",
      email: "",
      address1: "",
    });

    setMessage(
      "지사가 성공적으로 등록되었습니다.",
    );
  }

  const th = {
    padding: 8,
    borderBottom: "2px solid #E2DCD5",
    color: "#7E7670",
    fontSize: 11,
    textAlign: "left",
  };

  const td = {
    padding: 8,
    borderBottom: "1px solid #F4F1ED",
    fontSize: 12,
  };

  // ============================================================
  // 로그인 전
  // ============================================================

  if (!isLoggedIn) {
    return (
      <BrandLogin
        loginId={loginInputId}
        setLoginId={setLoginInputId}
        password={loginInputPw}
        setPassword={setLoginInputPw}
        message={message}
        onSubmit={submitLogin}
        onLogin={processLogin}
        products={products}
        onOpenNotices={() => {
          processLogin("admin01");
          setPage("notices");
        }}
      />
    );
  }

  // ============================================================
  // 본사 데이터
  // ============================================================

  if (page === "hqData") {
  return (
    <>
      <CommonTopBar
        onOpenNotices={() => navigatePage("notices")}
        onGoSeller={() => navigateTab("seller")}
      />

      <HeadquartersData
        currentUser={currentUser}
        onBack={() => window.history.back()}
      />
    </>
  );
}

  // ============================================================
  // 공지사항
  // ============================================================

 if (page === "notices") {
  return (
    <>
      <CommonTopBar
        onOpenNotices={() => navigatePage("notices")}
        onGoSeller={() => navigateTab("seller")}
      />

      <NoticeList
        currentUser={currentUser}
        onBack={() => window.history.back()}
      />
    </>
  );
}

  // ============================================================
  // 지점 운영 관리
  // ============================================================

  if (activeTab === "seller") {
  return (
    <>
    
      

      <BranchAnalytics
        orgs={orgs}
        products={products}
        currentUser={currentUser}
        onLogout={logout}
        onData={() => navigatePage("hqData")}
        onNotices={() => navigatePage("notices")}
      />
    </>
  );
}
  // ============================================================
  // 관리자 / 고객 화면
  // ============================================================

  return (
    <main
      style={{
        padding: 30,
        minHeight: "100vh",
        background: "#EFECE6",
        fontFamily: "Arial, sans-serif",
        color: "#3A3532",
      }}
    >
      <header
        style={{
          background: "#6B5B52",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
          marginBottom: 25,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <b style={{ letterSpacing: 2 }}>
          BASESEASON
        </b>

        <div>
          {currentUser?.role === "관리자" && (
            <button
              onClick={() =>
                navigatePage("hqData")
              }
              style={{
                ...button,
                background: "#C86B2B",
              }}
            >
              본사 데이터 관리
            </button>
          )}{" "}

          <button
            onClick={() =>
              navigateTab("admin")
            }
            style={{
              ...button,
              background:
                activeTab === "admin"
                  ? "#A56A63"
                  : "#6B5B52",
              outline:
                activeTab === "admin"
                  ? "2px solid #F3C49D"
                  : "none",
            }}
          >
            관리자
          </button>{" "}

          <button
            onClick={() =>
              navigateTab("seller")
            }
            style={{
              ...button,
              background:
                activeTab === "seller"
                  ? "#2F7AB8"
                  : "#6B5B52",
              outline:
                activeTab === "seller"
                  ? "2px solid #BEE2FF"
                  : "none",
            }}
          >
            지점 운영 관리
          </button>{" "}

          <button
            onClick={() =>
              navigateTab("customer")
            }
            style={{
              ...button,
              background:
                activeTab === "customer"
                  ? "#2D7B59"
                  : "#6B5B52",
              outline:
                activeTab === "customer"
                  ? "2px solid #BCE5D2"
                  : "none",
            }}
          >
            고객 관리
          </button>

         　👤 {currentUser?.user_name}{" "}

          <button
            onClick={logout}
            style={{
              ...button,
              background: "#A56A63",
            }}
          >
            로그아웃
          </button>
        </div>
      </header>
      <CommonTopBar
        onOpenNotices={() => navigatePage("notices")}
        onGoAdmin={() => navigateTab("admin")}
        onGoSeller={() => navigateTab("seller")}
        onGoCustomer={() => navigateTab("customer")}
        onGoHqData={() => navigatePage("hqData")}
      />
      <h1
        style={{
          fontSize: 22,
          fontWeight: "normal",
        }}
      >
        {activeTab === "admin"
          ? "A BETTER SEASON - 통합 관리자 대시보드"
          : activeTab === "seller"
            ? "A BETTER SEASON - 파트너 상품·재고 관리"
            : "A BETTER SEASON - 주문·결제 및 고객 센터"}
      </h1>

      {message && <Notice text={message} />}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(180px,1fr))",
          gap: 15,
          margin: "25px 0",
        }}
      >
        {[
          [
            "운영 조직",
            `지사 ${
  orgs.filter(
    (o) => o.org_type === "BRANCH"
  ).length
}개`,
          ],

          [
            "전체 회원",
            `${users.length}명`,
          ],

          [
            "등록 상품",
            `${products.length}개`,
          ],

          [
            "전체 주문",
            `${orders.length}건`,
          ],

          [
            "결제 완료",
            `${
              orders.filter(
                (o) =>
                  o.payment_status ===
                  "결제완료",
              ).length
            }건`,
          ],

          [
            "안전재고 부족",
            `${
              products.filter(
                (p) =>
                  p.stock <=
                  p.safety_stock,
              ).length
            }건`,
          ],
        ].map(([a, b]) => (
          <div
            key={a}
            style={{
              ...box,
              margin: 0,
            }}
          >
            <div
              style={{
                color: "#7E7670",
                fontSize: 12,
              }}
            >
              {a}
            </div>

            <b
              style={{
                fontSize: 20,
              }}
            >
              {b}
            </b>
          </div>
        ))}
      </section>

      {/* ========================================================
          관리자
      ======================================================== */}

      {activeTab === "admin" && (
        <>
          <section style={box}>
            <h2>지사 추가 등록</h2>

            <form
              onSubmit={addOrg}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {[
                [
                  "org_code",
                  "조직 코드 (예: BR007)",
                ],
                [
                  "org_name",
                  "조직명 (예: 인천지사)",
                ],
                ["phone", "전화번호"],
                ["email", "이메일"],
              ].map(([n, p]) => (
                <input
                  key={n}
                  name={n}
                  value={form[n]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [n]: e.target.value,
                    })
                  }
                  placeholder={p}
                  style={input}
                />
              ))}

              <input
                name="address1"
                value={form.address1}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address1: e.target.value,
                  })
                }
                placeholder="주소 입력"
                style={input}
              />

              <button style={button}>
                등록하기
              </button>
            </form>
          </section>

          <section style={box}>
            <table
              style={{
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  {[
                    "코드",
                    "조직명",
                    "유형",
                    "연락처",
                    "상태",
                  ].map((x) => (
                    <th
                      key={x}
                      style={th}
                    >
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orgs
                  .filter(
                    (o) =>
                      o.org_type ===
                      "BRANCH",
                  )
                  .map((o) => (
                    <tr key={o.org_id}>
                      <td style={td}>
                        {o.org_code}
                      </td>

                      <td style={td}>
                        {o.org_name}
                      </td>

                      <td style={td}>
                        {o.org_type}
                      </td>

                      <td style={td}>
                        {o.phone}
                      </td>

                      <td
                        style={{
                          ...td,
                          color: "#276749",
                        }}
                      >
                        운영중
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>

          {/* 기존 회원 관리 영역은 화면에서 숨김 */}
          <section
            style={{
              ...box,
              display: "none",
            }}
          >
            <h2>
              회원 목록 및 권한
            </h2>

            <table
              style={{
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  {[
                    "아이디",
                    "이름",
                    "이메일",
                    "권한",
                    "프로필/주소",
                  ].map((x) => (
                    <th
                      key={x}
                      style={th}
                    >
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td style={td}>
                      {u.login_id}
                    </td>

                    <td style={td}>
                      {u.user_name}
                    </td>

                    <td style={td}>
                      {u.email}
                    </td>

                    <td style={td}>
                      {u.role}{" "}

                      <button
                        onClick={() => {
                          const r =
                            prompt(
                              "변경할 권한을 입력하세요",
                              u.role,
                            );

                          if (r) {
                            setUsers(
                              users.map(
                                (x) =>
                                  x.user_id ===
                                  u.user_id
                                    ? {
                                        ...x,
                                        role: r,
                                      }
                                    : x,
                              ),
                            );
                          }
                        }}
                        style={button}
                      >
                        변경
                      </button>
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          setModal({
                            title:
                              "판매자 프로필",
                            body:
                              "상호명: 베이스존 패션\n사업자번호: 222-11-11111",
                          })
                        }
                        style={button}
                      >
                        프로필
                      </button>{" "}

                      <button
                        onClick={() =>
                          setModal({
                            title:
                              "배송지 주소",
                            body:
                              "자택 · 서울특별시 강남구 테헤란로 123\n스튜디오 · 경기도 성남시 분당구 판교역로 456",
                          })
                        }
                        style={button}
                      >
                        주소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* ========================================================
          판매자
      ======================================================== */}

      {activeTab === "seller" && (
        <section style={box}>
          <h2>
            B 담당 의류 상품 및 재고 현황
          </h2>

          <table
            style={{
              width: "100%",
            }}
          >
            <thead>
              <tr>
                {[
                  "상품명",
                  "판매자",
                  "가격",
                  "재고",
                  "안전재고",
                  "상태",
                  "관리",
                ].map((x) => (
                  <th
                    key={x}
                    style={th}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const low =
                  p.stock <=
                  p.safety_stock;

                return (
                  <tr
                    key={
                      p.product_id
                    }
                  >
                    <td style={td}>
                      {p.product_name}
                    </td>

                    <td style={td}>
                      {p.seller}
                    </td>

                    <td style={td}>
                      {p.price.toLocaleString()}
                      원
                    </td>

                    <td
                      style={{
                        ...td,
                        color: low
                          ? "#A53730"
                          : "inherit",
                      }}
                    >
                      {p.stock}개
                    </td>

                    <td style={td}>
                      {p.safety_stock}개
                    </td>

                    <td style={td}>
                      {low
                        ? "재고부족"
                        : "판매중"}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          setModal({
                            title:
                              "상품 이미지 파일",
                            body:
                              p.image_url,
                          })
                        }
                        style={button}
                      >
                        이미지
                      </button>{" "}

                      <button
                        onClick={() => {
                          const v =
                            Number(
                              prompt(
                                "변경할 재고 수량",
                                p.stock,
                              ),
                            );

                          if (
                            Number.isFinite(
                              v,
                            )
                          ) {
                            setProducts(
                              products.map(
                                (x) =>
                                  x.product_id ===
                                  p.product_id
                                    ? {
                                        ...x,
                                        stock: v,
                                      }
                                    : x,
                              ),
                            );
                          }
                        }}
                        style={button}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* ========================================================
          고객 관리
      ======================================================== */}

      {activeTab === "customer" && (
        <>
         
      {/* =====================================================
          C 담당 주문 및 결제 관리
      ===================================================== */}
      <section style={box}>
        <h2>C 담당 주문 및 결제 관리</h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#F3F5F8",
                }}
              >
                {[
                  "주문번호",
                  "구매자",
                  "상품명",
                  "결제금액",
                  "결제상태",
                  "주문상태",
                  "관리",
                ].map((title) => (
                  <th
                    key={title}
                    style={{
                      padding: 10,
                      textAlign: "left",
                      borderBottom: "1px solid #DDD",
                      fontSize: 12,
                    }}
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.order_id}>
                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    #{order.order_id}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    {order.buyer_name ||
                      order.user_name ||
                      `구매자 ${order.buyer_id || order.user_id || "-"}`}
                  </td>

                  <td
  style={{
    padding: 10,
    borderBottom: "1px solid #EEE",
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    {order.product_image && (
      <img
        src={order.product_image}
        alt={order.product_name || "상품 이미지"}
        style={{
          width: 55,
          height: 55,
          objectFit: "cover",
          borderRadius: 6,
          border: "1px solid #DDD",
        }}
      />
    )}

    <span>{order.product_name || "-"}</span>
  </div>
</td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    {Number(
                      order.total_amount ||
                        order.payment_amount ||
                        0
                    ).toLocaleString()}
                    원
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    {order.payment_status || "-"}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    {order.order_status || "-"}
                  </td>

                  <td
                    style={{
                      padding: 10,
                      borderBottom: "1px solid #EEE",
                    }}
                  >
                    
                    <button
                      style={{
                        ...button,
                        marginLeft: 6,
                      }}
                    >
                      상태변경
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 주문 페이지 번호 */}
        {totalOrderPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 20,
            }}
          >
            {Array.from(
              { length: totalOrderPages },
              (_, index) => index + 1
            ).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setOrderPage(pageNumber)}
                style={{
                  ...button,
                  background:
                    orderPage === pageNumber
                      ? "#796252"
                      : "#FFFFFF",
                  color:
                    orderPage === pageNumber
                      ? "#FFFFFF"
                      : "#796252",
                  border: "1px solid #796252",
                }}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}
      </section>
          <section style={box}>
            <h2>1:1 문의 내역</h2>

            <div
              style={{
                display: "flex",
                gap: 8,
                margin: "0 0 18px",
                flexWrap: "wrap",
              }}
            >
              {[
                "전체",
                "상품 문의",
                "주문·결제",
                "배송",
                "교환/반품",
                "기타",
              ].map((category) => {
                const count =
                  category === "전체"
                    ? inquiries.length
                    : inquiries.filter(
                        (item) =>
                          item.category ===
                          category,
                      ).length;

                const isActive =
                  inquiryCategory ===
                  category;

                return (
                  <button
                    key={category}
                    onClick={() => {
                      setInquiryCategory(
                        category,
                      );

                      setInquiryPage(1);
                    }}
                    style={{
                      padding:
                        "10px 15px",
                      cursor:
                        "pointer",
                      border: `1px solid ${
                        isActive
                          ? "#796252"
                          : "#D8CFC5"
                      }`,
                      background:
                        isActive
                          ? "#796252"
                          : "#FAF9F6",
                      color:
                        isActive
                          ? "#fff"
                          : "#3A3532",
                      fontWeight:
                        "bold",
                    }}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>

            <table
              style={{
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  {[
                    "작성자",
                    "분류",
                    "제목",
                    "상태",
                    "작성일",
                    "관리",
                  ].map((x) => (
                    <th
                      key={x}
                      style={th}
                    >
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedInquiries.map(
                  (i) => (
                    <tr
                      key={
                        i.inquiry_id
                      }
                    >
                      <td style={td}>
                        {i.author}
                      </td>

                      <td style={td}>
                        {i.category}
                      </td>

                      <td style={td}>
                        <button
                          onClick={() =>
                            setModal({
                              title: `[${i.category}] ${i.title}`,
                              body: `작성자: ${i.author}
작성일: ${i.created_at}
처리 상태: ${i.status}

문의 내용
${i.content}

답변 내용
${
  i.status ===
  "답변완료"
    ? "문의하신 내용은 확인 후 안내드렸습니다."
    : "아직 답변을 준비하고 있습니다."
}`,
                            })
                          }
                          style={{
                            background:
                              "none",
                            border: 0,
                            padding: 0,
                            color:
                              "#3A3532",
                            fontWeight:
                              "bold",
                            textDecoration:
                              "underline",
                            cursor:
                              "pointer",
                            textAlign:
                              "left",
                          }}
                        >
                          {i.title}
                        </button>
                      </td>

                      <td style={td}>
                        {i.status}
                      </td>

                      <td style={td}>
                        {i.created_at}
                      </td>

                      <td style={td}>
                        <button
                          onClick={() => {
                            if (
                              prompt(
                                "답변 내용을 입력하세요",
                              )
                            ) {
                              setInquiries(
                                inquiries.map(
                                  (x) =>
                                    x.inquiry_id ===
                                    i.inquiry_id
                                      ? {
                                          ...x,
                                          status:
                                            "답변완료",
                                        }
                                      : x,
                                ),
                              );
                            }
                          }}
                          style={button}
                        >
                          답변
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {totalInquiryPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems:
                    "center",
                  gap: 8,
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  disabled={
                    inquiryPage === 1
                  }
                  onClick={() =>
                    setInquiryPage(
                      inquiryPage - 1,
                    )
                  }
                  style={button}
                >
                  이전
                </button>

                {Array.from(
                  {
                    length:
                      totalInquiryPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map(
                  (pageNumber) => (
                    <button
                      key={
                        pageNumber
                      }
                      type="button"
                      onClick={() =>
                        setInquiryPage(
                          pageNumber,
                        )
                      }
                      style={{
                        ...button,
                        opacity:
                          inquiryPage ===
                          pageNumber
                            ? 1
                            : 0.65,
                        fontWeight:
                          inquiryPage ===
                          pageNumber
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    inquiryPage ===
                    totalInquiryPages
                  }
                  onClick={() =>
                    setInquiryPage(
                      inquiryPage + 1,
                    )
                  }
                  style={button}
                >
                  다음
                </button>
              </div>
            )}
          </section>

          <ShoppingPolicy />
        </>
      )}

      {/* ========================================================
          공통 모달
      ======================================================== */}

      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,.35)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              ...box,
              width: 350,
              whiteSpace:
                "pre-line",
            }}
          >
            <h3>{modal.title}</h3>

            <p>{modal.body}</p>

            <button
              onClick={() =>
                setModal(null)
              }
              style={button}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================
// 지사 운영 대시보드
// ============================================================

function BranchAnalytics({
  orgs,
  products,
  currentUser,
  onLogout,
  onData,
  onNotices,
}) {
  // ----------------------------------------------------------
  // 선택 지사
  // ----------------------------------------------------------

  const branchOrgs = orgs.filter(
    (o) =>
      o.org_type === "BRANCH",
  );

  const [selected, setSelected] = useState("");
const [supportCategory, setSupportCategory] = useState(null);
// C 담당 주문 및 결제 관리 페이지 번호
const [orderPage, setOrderPage] = useState(1);

// 한 페이지에 주문 10개씩 표시
const ORDERS_PER_PAGE = 10;
useEffect(() => {
  const branches = orgs.filter((o) => o.org_type === "BRANCH");

  if (branches.length > 0 && !selected) {
    setSelected(branches[0].org_code);
  }
}, [orgs, selected]);
  // ----------------------------------------------------------
  // 실제 데이터
  // ----------------------------------------------------------

  const [analyticsProducts, setAnalyticsProducts] =
    useState([]);

  const [analyticsOrders, setAnalyticsOrders] =
    useState([]);

  const [analyticsOrderItems, setAnalyticsOrderItems] =
    useState([]);

  const [
    branchPurchaseOrders,
    setBranchPurchaseOrders,
  ] = useState([]);

  const [
    branchPurchaseOrderItems,
    setBranchPurchaseOrderItems,
  ] = useState([]);

  const [
    requestProducts,
    setRequestProducts,
  ] = useState([]);

  // ----------------------------------------------------------
  // 지사 목록이 들어오면 첫 번째 지사를 선택
  // ★ 본사는 절대로 선택하지 않음
  // ----------------------------------------------------------

  useEffect(() => {
    if (
      branchOrgs.length > 0 &&
      !branchOrgs.some(
        (org) =>
          org.org_code ===
          selected,
      )
    ) {
      setSelected(
        branchOrgs[0].org_code,
      );
    }
  }, [orgs, selected, branchOrgs]);

  // ----------------------------------------------------------
  // products
  // ----------------------------------------------------------

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/api/products",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setAnalyticsProducts(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "운영 현황 products 연결 오류:",
          error,
        );

        setAnalyticsProducts([]);
      });
  }, []);

  // ----------------------------------------------------------
  // orders
  // ----------------------------------------------------------

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/api/orders",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setAnalyticsOrders(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "운영 현황 orders 연결 오류:",
          error,
        );

        setAnalyticsOrders([]);
      });

    fetch(
      "http://127.0.0.1:8000/api/order-items",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setAnalyticsOrderItems(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "운영 현황 order_items 연결 오류:",
          error,
        );

        setAnalyticsOrderItems([]);
      });
  }, []);

  // ----------------------------------------------------------
  // branch_purchase_orders
  // 현재 백엔드가 8001에서 제공하는 기존 구조 유지
  // ----------------------------------------------------------

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8001/api/branch-purchase-orders",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "branch_purchase_orders API 오류",
          );
        }

        return response.json();
      })
      .then((data) => {
        setBranchPurchaseOrders(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "branch_purchase_orders 연결 오류:",
          error,
        );

        setBranchPurchaseOrders([]);
      });

    fetch(
      "http://127.0.0.1:8001/api/branch-purchase-order-items",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "branch_purchase_order_items API 오류",
          );
        }

        return response.json();
      })
      .then((data) => {
        setBranchPurchaseOrderItems(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "branch_purchase_order_items 연결 오류:",
          error,
        );

        setBranchPurchaseOrderItems([]);
      });

    fetch(
      "http://127.0.0.1:8001/api/products",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setRequestProducts(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "지사 발주 products 연결 오류:",
          error,
        );

        setRequestProducts([]);
      });
  }, []);

  // ----------------------------------------------------------
  // 선택된 조직
  // ----------------------------------------------------------

  const sel =
    branchOrgs.find(
      (o) =>
        o.org_code === selected,
    ) ||
    branchOrgs[0] ||
    null;

  const selectedOrgId =
    sel?.org_id ?? null;

  // ----------------------------------------------------------
  // 실제 판매량 계산
  // ----------------------------------------------------------

  const validOrderIds =
    new Set(
      analyticsOrders
        .filter((order) => {
          const status =
            String(
              order.order_status ||
                "",
            );

          return (
            !status.includes("취소") &&
            !status.includes("환불")
          );
        })
        .map((order) =>
          Number(order.order_id),
        ),
    );

  const productSales = {};

  analyticsOrderItems.forEach(
    (item) => {
      if (
        !validOrderIds.has(
          Number(item.order_id),
        )
      ) {
        return;
      }

      const productId =
        Number(item.product_id);

      if (
        !productSales[productId]
      ) {
        productSales[productId] = 0;
      }

      productSales[productId] +=
        Number(
          item.quantity || 0,
        );
    },
  );

  const productPerformance =
    analyticsProducts
      .map((product) => ({
        ...product,

        soldQuantity:
          productSales[
            Number(
              product.product_id,
            )
          ] || 0,
      }))
      .sort(
        (a, b) =>
          b.soldQuantity -
          a.soldQuantity,
      );

  const bestProduct =
    productPerformance.length >
    0
      ? productPerformance[0]
      : null;

  const slowProduct =
    productPerformance.length >
    0
      ? [
          ...productPerformance,
        ].sort(
          (a, b) =>
            a.soldQuantity -
            b.soldQuantity,
        )[0]
      : null;

  // ----------------------------------------------------------
  // 선택 지사의 실제 주문
  // ----------------------------------------------------------

  const selectedBranchOrders =
    selectedOrgId === null
      ? []
      : analyticsOrders.filter(
          (order) =>
            Number(order.org_id) ===
            Number(selectedOrgId),
        );

  const validSelectedBranchOrders =
    selectedBranchOrders.filter(
      (order) => {
        const status =
          String(
            order.order_status ||
              "",
          );

        return (
          !status.includes("취소") &&
          !status.includes("환불")
        );
      },
    );

  // ----------------------------------------------------------
  // 선택 지사의 신규 주문
  // ----------------------------------------------------------

  const newOrderCount =
    selectedBranchOrders.filter(
      (order) => {
        const status =
          String(
            order.order_status ||
              "",
          );

        return (
          !status.includes("취소") &&
          !status.includes("환불")
        );
      },
    ).length;

  // ----------------------------------------------------------
  // 선택 지사의 주문 상품
  // ----------------------------------------------------------

  const selectedOrderIds =
    new Set(
      validSelectedBranchOrders.map(
        (order) =>
          Number(
            order.order_id,
          ),
      ),
    );

  const selectedBranchOrderItems =
    analyticsOrderItems.filter(
      (item) =>
        selectedOrderIds.has(
          Number(item.order_id),
        ),
    );

  // ----------------------------------------------------------
  // 선택 지사의 상품별 판매량
  // ----------------------------------------------------------

  const selectedSalesMap = {};

  selectedBranchOrderItems.forEach(
    (item) => {
      const productId =
        Number(item.product_id);

      if (
        !selectedSalesMap[
          productId
        ]
      ) {
        selectedSalesMap[
          productId
        ] = {
          product_id:
            productId,

          product_name:
            item.product_name_snapshot ||
            `상품 ${productId}`,

          soldQuantity: 0,
        };
      }

      selectedSalesMap[
        productId
      ].soldQuantity +=
        Number(
          item.quantity || 0,
        );
    },
  );

  const selectedPerformance =
    Object.values(
      selectedSalesMap,
    ).sort(
      (a, b) =>
        b.soldQuantity -
        a.soldQuantity,
    );

  const selectedBestProduct =
    selectedPerformance[0] ||
    null;

  const selectedSlowProduct =
    selectedPerformance[
      selectedPerformance.length -
        1
    ] || null;

  // ----------------------------------------------------------
  // 안전재고 부족
  // ----------------------------------------------------------

  const selectedInventoryRows =
    analyticsProducts.filter(
      (product) =>
        Number(product.org_id) ===
        Number(selectedOrgId),
    );

  const selectedLowStockCount =
    selectedInventoryRows.filter(
      (product) =>
        Number(
          product.stock ??
            0,
        ) <=
        Number(
          product.safety_stock ??
            0,
        ),
    ).length;

  // ----------------------------------------------------------
  // 지사 발주 신청 내역
  // ----------------------------------------------------------

  const selectedPurchaseOrders =
    branchPurchaseOrders.filter(
      (order) =>
        Number(order.org_id) ===
        Number(selectedOrgId),
    );

  const selectedPurchaseOrderIds =
    new Set(
      selectedPurchaseOrders.map(
        (order) =>
          Number(
            order.branch_order_id,
          ),
      ),
    );

  const selectedPurchaseItems =
    branchPurchaseOrderItems.filter(
      (item) =>
        selectedPurchaseOrderIds.has(
          Number(
            item.branch_order_id,
          ),
        ),
    );

  const purchaseRows =
    selectedPurchaseItems.map(
      (item) => {
        const order =
          selectedPurchaseOrders.find(
            (o) =>
              Number(
                o.branch_order_id,
              ) ===
              Number(
                item.branch_order_id,
              ),
          );

        const product =
          requestProducts.find(
            (p) =>
              Number(
                p.product_id,
              ) ===
              Number(
                item.product_id,
              ),
          );

        return {
          id:
            item.branch_order_item_id,

          code:
            item.sku_code ||
            `P${String(
              item.product_id,
            ).padStart(6, "0")}`,

          product:
            product?.product_name ||
            `상품번호 ${item.product_id}`,

          date:
            order?.requested_at
              ? String(
                  order.requested_at,
                ).slice(
                  0,
                  10,
                )
              : item.created_at
                ? String(
                    item.created_at,
                  ).slice(
                    0,
                    10,
                  )
                : "-",

          price: Number(
            item.unit_price ||
              0,
          ),

          qty: Number(
            item.order_quantity ||
              0,
          ),

          status:
            order?.order_status ||
            "-",
        };
      },
    );

  // ----------------------------------------------------------
  // 상태 색상
  // ----------------------------------------------------------

  function getPurchaseStatusStyle(
    status,
  ) {
    const value =
      String(status || "");

    if (
      value.includes("승인") &&
      !value.includes("대기")
    ) {
      return {
        background:
          "#E7F4EC",
        color:
          "#276749",
      };
    }

    if (
      value.includes("반려")
    ) {
      return {
        background:
          "#FDECEC",
        color:
          "#A53730",
      };
    }

    if (
      value.includes("출고")
    ) {
      return {
        background:
          "#EAF2FA",
        color:
          "#2F5F8F",
      };
    }

    return {
      background:
        "#FFF6E3",
      color:
        "#8A6518",
    };
  }

  // ----------------------------------------------------------
  // 본사 문의 상세
  // ----------------------------------------------------------

  useEffect(() => {
    const handleSupportBack =
      (event) => {
        if (
          event.state?.baseseason &&
          !event.state
            ?.supportCategory
        ) {
          setSupportCategory(
            null,
          );
        }
      };

    window.addEventListener(
      "popstate",
      handleSupportBack,
    );

    return () =>
      window.removeEventListener(
        "popstate",
        handleSupportBack,
      );
  }, []);

  function openSupportCategory(
    category,
  ) {
    setSupportCategory(category);

    window.history.pushState(
      {
        baseseason: true,
        page: "dashboard",
        activeTab: "admin",
        supportCategory:
          category,
      },
      "",
    );
  }

  // ----------------------------------------------------------
  // 문의 상세 화면
  // ----------------------------------------------------------

  if (supportCategory) {
    return (
      <HeadquartersSupport
        category={
          supportCategory
        }
        currentUser={
          currentUser
        }
        onBack={() =>
          window.history.back()
        }
        onLogout={onLogout}
      />
    );
  }

  // ----------------------------------------------------------
  // 지사 대시보드
  // ----------------------------------------------------------

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EDE7DC",
        padding: 28,
        fontFamily:
          "Arial,sans-serif",
        color: "#1D1A18",
        boxSizing:
          "border-box",
      }}
    >
      <header
        style={{
          background:
            "#796252",
          color: "#fff",
          padding:
            "16px 24px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          flexWrap:
            "wrap",
          gap: 10,
        }}
      >
        <b
          style={{
            letterSpacing: 2,
          }}
        >
          BASESEASON · HQ
          ANALYTICS
        </b>

        <span>
          <button
            onClick={
              onNotices
            }
            style={{
              marginRight: 12,
              border: 0,
              padding:
                "6px 10px",
              cursor:
                "pointer",
            }}
          >
            공지사항 목록
          </button>

          <button
            onClick={onData}
            style={{
              marginRight: 12,
              border: 0,
              padding:
                "6px 10px",
              cursor:
                "pointer",
            }}
          >
            본사 데이터 관리
          </button>

          👤{" "}
          {currentUser?.user_name}

          <button
            onClick={
              onLogout
            }
            style={{
              marginLeft: 12,
              border: 0,
              padding:
                "6px 10px",
              cursor:
                "pointer",
            }}
          >
            로그아웃
          </button>
        </span>
      </header>
      <CommonTopBar
        onOpenNotices={onNotices}
        onGoSeller={() => {}}
      />
      <div
        style={{
          maxWidth: 1400,
          margin:
            "22px auto",
        }}
      >
        <h1
          style={{
            fontSize: 24,
          }}
        >
          {sel
            ? `${sel.org_name.replace(
                "BASESEASON ",
                "",
              )} 운영 현황`
            : "지사 운영 현황"}
        </h1>

        <p
          style={{
            color: "#6F6259",
            fontSize: 13,
          }}
        >
          조직 목록에서 지사를 선택하면
          해당 지사의 데이터와 대시보드가
          표시됩니다.
        </p>

        {/* =====================================================
            조직 목록
            ★ 본사 제거
        ===================================================== */}

        <section
          style={{
            background:
              "#FAF9F6",
            padding: 18,
            margin:
              "18px 0",
          }}
        >
          <b>조직 목록</b>

          <div
            style={{
              display: "flex",
              gap: 9,
              flexWrap:
                "wrap",
              marginTop: 12,
            }}
          >
            {branchOrgs.map(
              (o) => (
                <button
                  key={
                    o.org_id
                  }
                  onClick={() =>
                    setSelected(
                      o.org_code,
                    )
                  }
                  style={{
                    padding:
                      "10px 14px",
                    cursor:
                      "pointer",
                    border: `1px solid ${
                      selected ===
                      o.org_code
                        ? "#796252"
                        : "#CDBFAF"
                    }`,
                    background:
                      selected ===
                      o.org_code
                        ? "#796252"
                        : "#fff",
                    color:
                      selected ===
                      o.org_code
                        ? "#fff"
                        : "#1D1A18",
                  }}
                >
                  <b>
                    {o.org_name.replace(
                      "BASESEASON ",
                      "",
                    )}
                  </b>

                  <br />

                  <span
                    style={{
                      fontSize: 11,
                      opacity:
                        0.9,
                    }}
                  >
                    {o.phone ||
                      "-"}
                  </span>
                </button>
              ),
            )}
          </div>
        </section>

        {/* =====================================================
            지사 관리 대시보드
        ===================================================== */}

        <section
          style={{
            background:
              "#F5F2EC",
            padding: 24,
            marginTop: 16,
            boxSizing:
              "border-box",
          }}
        >
          {false && (
  <>
         <h2
            style={{
              margin:
                "0 0 18px 0",
              fontSize: 20,
              fontWeight:
                "normal",
              color:
                "#3A3532",
            }}
          >
            {sel?.org_name
              ? `${sel.org_name.replace(
                  "BASESEASON ",
                  "",
                )} 관리 대시보드`
              : "지사 관리 대시보드"}
          </h2>

          {/* ===================================================
              대시보드 카드
          =================================================== */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: 16,
              marginBottom:
                22,
            }}
          >
            <div
              style={{
                background:
                  "#FFFFFF",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color:
                    "#6F6259",
                }}
              >
                {sel
                  ? `${sel.org_name.replace(
                      "BASESEASON ",
                      "",
                    )} 신규 주문`
                  : "신규 주문"}
              </div>

              <b
                style={{
                  display:
                    "block",
                  marginTop: 10,
                  fontSize: 26,
                }}
              >
                {newOrderCount}건
              </b>
            </div>

            <div
              style={{
                background:
                  "#FFFFFF",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color:
                    "#6F6259",
                }}
              >
                미답변 문의
              </div>

              <b
                style={{
                  display:
                    "block",
                  marginTop: 10,
                  fontSize: 26,
                  color:
                    "#E44D45",
                }}
              >
                0건
              </b>
            </div>

            <div
              style={{
                background:
                  "#FFFFFF",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color:
                    "#6F6259",
                }}
              >
                안전재고 부족
              </div>

              <b
                style={{
                  display:
                    "block",
                  marginTop: 10,
                  fontSize: 26,
                  color:
                    "#E44D45",
                }}
              >
                {selectedLowStockCount}건
              </b>
            </div>
          </div>

          {/* ===================================================
              실제 지사 판매 상품
          =================================================== */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 16,
              marginBottom:
                22,
            }}
          >
            <div
              style={{
                background:
                  "#FFFFFF",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  color:
                    "#6F6259",
                  fontSize: 12,
                }}
              >
                선택 지사 베스트 상품
              </div>

              <b
                style={{
                  display:
                    "block",
                  marginTop: 10,
                  fontSize: 18,
                }}
              >
                {selectedBestProduct
                  ?.product_name ||
                  bestProduct
                    ?.product_name ||
                  "-"}
              </b>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color:
                    "#796252",
                }}
              >
                판매 수량{" "}
                {selectedBestProduct
                  ?.soldQuantity ||
                  0}
                개
              </div>
            </div>

            <div
              style={{
                background:
                  "#FFFFFF",
                padding: 20,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  color:
                    "#6F6259",
                  fontSize: 12,
                }}
              >
                선택 지사 판매 부진 상품
              </div>

              <b
                style={{
                  display:
                    "block",
                  marginTop: 10,
                  fontSize: 18,
                }}
              >
                {selectedSlowProduct
                  ?.product_name ||
                  slowProduct
                    ?.product_name ||
                  "-"}
              </b>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color:
                    "#796252",
                }}
              >
                판매 수량{" "}
                {selectedSlowProduct
                  ?.soldQuantity ||
                  0}
                개
              </div>
            </div>
          </div>
                        </>
        )}
          {/* ===================================================
              지사 발주 신청 내역
          =================================================== */}

          <div
            style={{
              background:
                "#FFFFFF",
              padding: 24,
              borderRadius: 8,
            }}
          >
            <h3
              style={{
                textAlign:
                  "center",
                margin:
                  "0 0 18px 0",
                fontSize: 18,
                fontWeight:
                  "normal",
              }}
            >
              📋{" "}
              {sel
                ? `${sel.org_name.replace(
                    "BASESEASON ",
                    "",
                  )} 발주 신청 내역`
                : "지사 발주 신청 내역"}
            </h3>

            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#F5F6F7",
                  }}
                >
                  {[
                    "고유코드",
                    "본사 상품명",
                    "신청 일자",
                    "도매가(공급가)",
                    "신청 수량",
                    "진행 상태",
                  ].map(
                    (
                      title,
                    ) => (
                      <th
                        key={
                          title
                        }
                        style={{
                          padding:
                            12,
                          textAlign:
                            "left",
                          borderBottom:
                            "1px solid #E2DCD5",
                        }}
                      >
                        {
                          title
                        }
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {purchaseRows.length >
                0 ? (
                  purchaseRows.map(
                    (
                      row,
                    ) => {
                      const statusStyle =
                        getPurchaseStatusStyle(
                          row.status,
                        );

                      return (
                        <tr
                          key={
                            row.id
                          }
                        >
                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            {
                              row.code
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            {
                              row.product
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            {
                              row.date
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            {row.price.toLocaleString()}
                            원
                          </td>

                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            <b>
                              {
                                row.qty
                              }
                            </b>{" "}
                            개
                          </td>

                          <td
                            style={{
                              padding:
                                12,
                            }}
                          >
                            <span
                              style={{
                                ...statusStyle,
                                display:
                                  "inline-block",
                                padding:
                                  "7px 12px",
                                borderRadius:
                                  15,
                                fontWeight:
                                  "bold",
                              }}
                            >
                              {
                                row.status
                              }
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={
                        6
                      }
                      style={{
                        padding:
                          30,
                        textAlign:
                          "center",
                        color:
                          "#8A7B70",
                      }}
                    >
                      선택한 지사의
                      발주 신청 내역이
                      없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {/* 본사 재고 요청 / 할인 설정 */}
      <RequestDiscountPanel
        products={products}
      />
    </main>
  );
}

// ============================================================
// 본사 고객 문의
// ============================================================

function HeadquartersSupport({
  category,
  currentUser,
  onBack,
  onLogout,
}) {
  const [
    buyerInquiries,
    setBuyerInquiries,
  ] = useState([]);

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/api/buyer-inquiries",
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "구매자 문의 데이터를 가져오지 못했습니다.",
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log(
          "실제 buyer_inquiries 데이터:",
          data,
        );

        setBuyerInquiries(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "buyer_inquiries 연결 오류:",
          error,
        );

        setBuyerInquiries([]);
      });
  }, []);

  const categoryMap = {
    "상품 문의":
      "1)상품문의",

    "주문·결제":
      "2)주문및결제",

    배송:
      "3)배송",

    "교환/반품":
      "4)교환반품",
  };

  const rows =
    buyerInquiries
      .filter((inquiry) => {
        if (category === "기타") {
          return !Object.values(
            categoryMap,
          ).includes(
            inquiry.category_code,
          );
        }

        return (
          inquiry.category_code ===
          categoryMap[category]
        );
      })
      .map((inquiry) => {
        let status =
          inquiry.inquiry_status;

        if (
          inquiry.inquiry_status ===
          "ANSWERED"
        ) {
          status = "답변완료";
        } else if (
          inquiry.inquiry_status ===
          "RECEIVED"
        ) {
          status = "답변대기";
        }

        const author = `구매자 ${inquiry.user_id}`;

        const date =
          inquiry.created_at
            ? String(
                inquiry.created_at,
              ).slice(
                0,
                10,
              )
            : "-";

        return [
          author,
          inquiry.title || "-",
          inquiry.content || "-",
          status,
          date,
        ];
      });

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "#EDE7DC",
        padding: 28,
        fontFamily:
          "Arial,sans-serif",
        color: "#1D1A18",
        boxSizing:
          "border-box",
      }}
    >
      <header
        style={{
          background:
            "#796252",
          color: "#fff",
          padding:
            "16px 24px",
          display: "flex",
          justifyContent:
            "space-between",
        }}
      >
        <b
          style={{
            letterSpacing: 2,
          }}
        >
          BASESEASON · HQ
          CUSTOMER SUPPORT
        </b>

        <span>
          👤{" "}
          {currentUser?.user_name}

          <button
            onClick={
              onLogout
            }
            style={{
              marginLeft: 12,
              border: 0,
              padding:
                "6px 10px",
              cursor:
                "pointer",
            }}
          >
            로그아웃
          </button>
        </span>
      </header>

      <div
        style={{
          maxWidth: 1400,
          margin:
            "22px auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background:
              "#fff",
            border:
              "1px solid #CDBFAF",
            padding:
              "9px 13px",
            cursor:
              "pointer",
            color:
              "#3A3532",
          }}
        >
          ← 본사 현황으로 돌아가기
        </button>

        <section
          style={{
            background:
              "#FAF9F6",
            padding: 24,
            marginTop: 16,
            borderTop:
              "4px solid #796252",
          }}
        >
          <p
            style={{
              color:
                "#796252",
              fontSize: 11,
              fontWeight:
                "bold",
              letterSpacing: 1,
              margin: 0,
            }}
          >
            INQUIRY CATEGORY
          </p>

          <h1
            style={{
              fontSize: 25,
              margin:
                "8px 0",
            }}
          >
            {category} 문의 관리
          </h1>

          <p
            style={{
              color:
                "#6F6259",
              fontSize: 13,
              margin: 0,
            }}
          >
            총 {rows.length}건의
            문의가 표시됩니다.
          </p>
        </section>

        <section
          style={{
            background:
              "#FAF9F6",
            padding: 24,
            marginTop: 16,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                {[
                  "작성자",
                  "제목",
                  "문의 내용",
                  "상태",
                  "접수일",
                  "관리",
                ].map(
                  (title) => (
                    <th
                      key={
                        title
                      }
                      style={{
                        padding:
                          12,
                        textAlign:
                          "left",
                        borderBottom:
                          "1px solid #CDBFAF",
                        fontSize: 12,
                      }}
                    >
                      {
                        title
                      }
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (
                  [
                    author,
                    title,
                    content,
                    status,
                    date,
                  ],
                  index,
                ) => (
                  <tr
                    key={`${author}-${title}`}
                  >
                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                        fontSize: 13,
                      }}
                    >
                      {
                        author
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                        fontSize: 13,
                        fontWeight:
                          "bold",
                      }}
                    >
                      {
                        title
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                        fontSize: 13,
                      }}
                    >
                      {
                        content
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                        fontSize: 13,
                        color:
                          status ===
                          "답변대기"
                            ? "#A24D32"
                            : "#35735B",
                      }}
                    >
                      {
                        status
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                        fontSize: 13,
                      }}
                    >
                      {
                        date
                      }
                    </td>

                    <td
                      style={{
                        padding:
                          12,
                        borderBottom:
                          "1px solid #E5DDD4",
                      }}
                    >
                      <button
                        onClick={() =>
                          alert(
                            `${index + 1}번 문의 답변 화면입니다.`,
                          )
                        }
                        style={{
                          background:
                            "#796252",
                          color:
                            "#fff",
                          border: 0,
                          padding:
                            "7px 10px",
                          cursor:
                            "pointer",
                        }}
                      >
                        답변
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

// ============================================================
// 지사 재고 요청 / 할인율
// ============================================================

function RequestDiscountPanel({
  products,
}) {
  const [tab, setTab] =
    useState("requests");

  const [
    dbBranchOrders,
    setDbBranchOrders,
  ] = useState([]);

  const [
    dbBranchOrderItems,
    setDbBranchOrderItems,
  ] = useState([]);

  const [
    dbRequestProducts,
    setDbRequestProducts,
  ] = useState([]);

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8001/api/branch-purchase-orders",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setDbBranchOrders(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "branch_purchase_orders 연결 오류:",
          error,
        );
      });

    fetch(
      "http://127.0.0.1:8001/api/branch-purchase-order-items",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setDbBranchOrderItems(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "branch_purchase_order_items 연결 오류:",
          error,
        );
      });

    fetch(
      "http://127.0.0.1:8001/api/products",
    )
      .then((response) =>
        response.json(),
      )
      .then((data) => {
        setDbRequestProducts(
          Array.isArray(data)
            ? data
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "products 연결 오류:",
          error,
        );
      });
  }, []);

  const [
    requests,
    setRequests,
  ] = useState([]);

  useEffect(() => {
    if (
      dbBranchOrders.length ===
        0 ||
      dbBranchOrderItems.length ===
        0
    ) {
      return;
    }

    const realRequests =
      dbBranchOrderItems.map(
        (item) => {
          const order =
            dbBranchOrders.find(
              (order) =>
                Number(
                  order.branch_order_id,
                ) ===
                Number(
                  item.branch_order_id,
                ),
            );

          const product =
            dbRequestProducts.find(
              (product) =>
                Number(
                  product.product_id,
                ) ===
                Number(
                  item.product_id,
                ),
            );

          let branch =
            `지사 ${
              order?.org_id ??
              "-"
            }`;

          if (
            Number(
              order?.org_id,
            ) === 2
          ) {
            branch =
              "전주지사";
          } else if (
            Number(
              order?.org_id,
            ) === 3
          ) {
            branch =
              "부산지사";
          }

          return {
            id:
              item.branch_order_item_id,

            branch,

            product:
              product?.product_name ??
              `상품번호 ${item.product_id}`,

            qty:
              Number(
                item.order_quantity ||
                  0,
              ),

            reason:
              order?.request_note ??
              "-",

            status:
              order?.order_status ??
              "-",
          };
        },
      );

    setRequests(
      realRequests,
    );
  }, [
    dbBranchOrders,
    dbBranchOrderItems,
    dbRequestProducts,
  ]);

  const [
    discounts,
    setDiscounts,
  ] = useState([]);

  const [
    productId,
    setProductId,
  ] = useState(
    products[0]
      ?.product_id ?? 1,
  );

  const [
    rate,
    setRate,
  ] = useState(10);

  const update = (
    id,
    status,
  ) =>
    setRequests(
      requests.map(
        (r) =>
          r.id === id
            ? {
                ...r,
                status,
              }
            : r,
      ),
    );

  const p =
    products.find(
      (x) =>
        Number(
          x.product_id,
        ) ===
        Number(productId),
    ) ||
    products[0] ||
    null;

  function addDiscount() {
    if (!p) {
      return;
    }

    setDiscounts([
      ...discounts,
      {
        id: Date.now(),

        name:
          p.product_name,

        price:
          Number(
            p.price || 0,
          ),

        rate:
          Number(rate),

        active: true,
      },
    ]);
  }

  return (
    <section
      style={{
        maxWidth: 1400,
        margin:
          "18px auto",
        background:
          "#FAF9F6",
        padding: 20,
        borderTop:
          "4px solid #796252",
      }}
    >
      <div
        style={{
          display:
            "flex",
          gap: 8,
          marginBottom:
            16,
        }}
      >
        <button
          onClick={() =>
            setTab(
              "requests",
            )
          }
          style={{
            ...button,
            background:
              tab ===
              "requests"
                ? "#796252"
                : "#A68F79",
          }}
        >
          지사 재고 요청 관리
        </button>

        <button
          onClick={() =>
            setTab(
              "discounts",
            )
          }
          style={{
            ...button,
            background:
              tab ===
              "discounts"
                ? "#796252"
                : "#A68F79",
          }}
        >
          할인율 직접 설정
        </button>
      </div>

      {tab ===
      "requests" ? (
        <>
          <h2
            style={{
              fontSize: 17,
            }}
          >
            지사 재고 요청
          </h2>

          <table
            style={{
              width:
                "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr>
                {[
                  "요청 지사",
                  "상품",
                  "수량",
                  "사유",
                  "상태",
                  "처리",
                ].map(
                  (x) => (
                    <th
                      key={
                        x
                      }
                      style={{
                        padding:
                          9,
                        textAlign:
                          "left",
                        borderBottom:
                          "1px solid #CDBFAF",
                      }}
                    >
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {requests.map(
                (r) => (
                  <tr
                    key={
                      r.id
                    }
                  >
                    <td
                      style={{
                        padding:
                          9,
                      }}
                    >
                      {
                        r.branch
                      }
                    </td>

                    <td>
                      {
                        r.product
                      }
                    </td>

                    <td>
                      {
                        r.qty
                      }
                      개
                    </td>

                    <td>
                      {
                        r.reason
                      }
                    </td>

                    <td>
                      <b>
                        {
                          r.status
                        }
                      </b>
                    </td>

                    <td>
                      {r.status ===
                        "요청대기" && (
                        <>
                          <button
                            onClick={() =>
                              update(
                                r.id,
                                "승인",
                              )
                            }
                            style={
                              button
                            }
                          >
                            승인
                          </button>{" "}

                          <button
                            onClick={() =>
                              update(
                                r.id,
                                "반려",
                              )
                            }
                            style={
                              button
                            }
                          >
                            반려
                          </button>
                        </>
                      )}

                      {r.status ===
                        "승인" && (
                        <button
                          onClick={() =>
                            update(
                              r.id,
                              "출고완료",
                            )
                          }
                          style={
                            button
                          }
                        >
                          출고완료
                        </button>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <h2
            style={{
              fontSize: 17,
            }}
          >
            상품 할인 설정
          </h2>

          <div
            style={{
              display:
                "flex",
              gap: 10,
              alignItems:
                "end",
              marginBottom:
                18,
            }}
          >
            <label>
              상품

              <select
                value={
                  productId
                }
                onChange={(
                  e,
                ) =>
                  setProductId(
                    e.target.value,
                  )
                }
                style={{
                  display:
                    "block",
                  padding: 8,
                }}
              >
                {products.map(
                  (x) => (
                    <option
                      key={
                        x.product_id
                      }
                      value={
                        x.product_id
                      }
                    >
                      {
                        x.product_name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              할인율(%)

              <input
                type="number"
                value={rate}
                onChange={(
                  e,
                ) =>
                  setRate(
                    e.target
                      .value,
                  )
                }
                style={{
                  display:
                    "block",
                  padding: 8,
                  width: 90,
                }}
              />
            </label>

            <div>
              할인 판매가
              <br />

              <b>
                {p
                  ? Math.round(
                      Number(
                        p.price ||
                          0,
                      ) *
                        (1 -
                          Number(
                            rate,
                          ) /
                            100),
                    ).toLocaleString()
                  : "0"}
                원
              </b>
            </div>

            <button
              onClick={
                addDiscount
              }
              style={button}
            >
              할인 적용
            </button>
          </div>

          <table
            style={{
              width:
                "100%",
            }}
          >
            <thead>
              <tr>
                {[
                  "상품",
                  "정상가",
                  "할인율",
                  "할인 판매가",
                  "상태",
                  "관리",
                ].map(
                  (x) => (
                    <th
                      key={
                        x
                      }
                      style={{
                        textAlign:
                          "left",
                        padding:
                          9,
                        borderBottom:
                          "1px solid #CDBFAF",
                      }}
                    >
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {discounts.map(
                (d) => (
                  <tr
                    key={
                      d.id
                    }
                  >
                    <td
                      style={{
                        padding:
                          9,
                      }}
                    >
                      {
                        d.name
                      }
                    </td>

                    <td>
                      {d.price.toLocaleString()}
                      원
                    </td>

                    <td>
                      {
                        d.rate
                      }
                      %
                    </td>

                    <td>
                      {Math.round(
                        d.price *
                          (1 -
                            d.rate /
                              100),
                      ).toLocaleString()}
                      원
                    </td>

                    <td>
                      {d.active
                        ? "진행중"
                        : "중지"}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          setDiscounts(
                            discounts.map(
                              (
                                x,
                              ) =>
                                x.id ===
                                d.id
                                  ? {
                                      ...x,
                                      active:
                                        !x.active,
                                    }
                                  : x,
                            ),
                          )
                        }
                        style={
                          button
                        }
                      >
                        {d.active
                          ? "중지"
                          : "재개"}
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

// ============================================================
// 로그인 화면
// ============================================================
// ============================================================
// ============================================================
// 모든 페이지 공통 상단 메뉴
// ============================================================
function CommonTopBar({
  onOpenNotices,
  onLogin,
  onGoAdmin,
  onGoSeller,
  onGoCustomer,
  onGoHqData,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  return (
    <>
      {/* 상단 갈색 메뉴 */}
      <div
        
  style={{
    height: 60,
    background: "#8A7567",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 18,
    padding: "0 28px",
    margin: "24px 30px",
    boxSizing: "border-box",
    color: "#FFFFFF",
    position: "relative",
  }}
>
        {/* SEARCH */}
        <span
          onClick={() => setSearchOpen((prev) => !prev)}
          style={{
            fontSize: 11,
            fontWeight: "bold",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          SEARCH
        </span>

        {/* 검색창 */}
        {searchOpen && (
          <div
            style={{
              position: "absolute",
              top: 70,
              right: 120,
              width: 300,
              background: "#FFFFFF",
              color: "#1D1A18",
              border: "1px solid #D8CEC7",
              padding: 12,
              zIndex: 10000,
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            }}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                boxSizing: "border-box",
                border: "1px solid #D8CEC7",
                outline: "none",
              }}
            />
          </div>
        )}

        <span style={{ fontSize: 22 }}>○</span>

        <span style={{ fontSize: 22 }}>⌕</span>

        {/* 알림 */}
        <span
          onClick={() => setMenuOpen(true)}
          style={{
            fontSize: 22,
            borderLeft: "1px solid #D8CEC7",
            paddingLeft: 18,
            cursor: "pointer",
          }}
        >
          ♙
        </span>

        {/* 햄버거 메뉴 */}
        <span
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            fontSize: 24,
            borderLeft: "1px solid #D8CEC7",
            paddingLeft: 18,
            cursor: "pointer",
          }}
        >
          ☰
        </span>
      </div>

      {/* 왼쪽 사이드 메뉴 */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 290,
            height: "100vh",
            background: "#E8CFA5",
            zIndex: 99999,
            boxShadow: "4px 0 15px rgba(0,0,0,0.18)",
            padding: "18px 20px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {/* 사이드 메뉴 상단 */}
          <div
            style={{
              background: "#796252",
              color: "#FFFFFF",
              padding: "18px 14px",
              margin: "-18px -20px 0",
              borderBottom: "1px solid #BDA98A",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              BASESEASON
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 6,
                opacity: 0.9,
              }}
            >
              본사 관리자
            </div>
          </div>

          {/* 알림 */}
          <div
            style={{
              padding: "16px 4px",
              borderBottom: "1px solid #BDA98A",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔔 알림 <span style={{ marginLeft: 6 }}>3</span>
          </div>

          {/* 메뉴 목록 */}
          <div
            style={{
              marginTop: 14,
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            <div
              onClick={() => {
                setMenuOpen(false);

                if (onOpenNotices) {
                  onOpenNotices();
                }
              }}
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              📢 본사 공지사항
            </div>

            <div
             onClick={() => {
  setMenuOpen(false);

  if (onGoSeller) {
    onGoSeller();
  }
}}
            >
              📦 재고 및 할인율 관리
            </div>

            <div
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              📝 고객 주문 관리
            </div>

            <div
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              💬 고객 문의 관리
            </div>

            <div
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              🏢 본사 상품 발주
            </div>

            <div
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              📋 발주 신청 내역
            </div>

            <div
              style={{
                padding: "13px 6px",
                cursor: "pointer",
              }}
            >
              🔥 지사 인기 상품
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 12,
                borderTop: "1px solid #BDA98A",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  alert("관리자 모드에서 로그아웃 되었습니다.");
                  window.location.href = APP_PATHS.BUYER;
                }}
                style={{
                  width: "100%",
                  padding: "11px",
                  backgroundColor: "#796252",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                🚪 로그아웃
              </button>
            </div>

            <div
              onClick={() => setMenuOpen(false)}
              style={{
                marginTop: 10,
                padding: "10px 6px",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "12px",
                color: "#796252",
              }}
            >
              ✕ 메뉴 닫기
            </div>
          </div>
        </div>
      )}
    </>
  );
}
function BrandLogin({
  loginId,
  setLoginId,
  password,
  setPassword,
  message,
  onSubmit,
  onLogin,
  onOpenNotices,
  products,
}) {
  const p = "#796252";
  const bg = "#EDE7DC";
  const text = "#1D1A18";

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  const searchResults =
    safeProducts.filter(
      (product) =>
        String(
          product.product_name ||
            "",
        )
          .toLowerCase()
          .includes(
            searchText
              .toLowerCase(),
          ),
    );

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background: bg,
        padding:
          "34px 30px",
        boxSizing:
          "border-box",
        fontFamily:
          "Arial, sans-serif",
        color: text,
      }}
    >
      {/* ======================================================
          상단 메뉴
      ====================================================== */}

      <div
        style={{
          height: 60,
          background:
            "#8A7567",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "flex-end",
          gap: 18,
          padding:
            "0 28px",
          margin:
            "0 0 24px 0",
          boxSizing:
            "border-box",
          color:
            "#FFFFFF",
          position:
            "relative",
        }}
      >
        <span
          onClick={() =>
            setSearchOpen(
              (prev) =>
                !prev,
            )
          }
          style={{
            fontSize: 11,
            fontWeight:
              "bold",
            textDecoration:
              "underline",
            cursor:
              "pointer",
          }}
        >
          SEARCH
        </span>

        {searchOpen && (
          <div
            style={{
              position:
                "absolute",
              top: 70,
              right: 120,
              width: 300,
              background:
                "#FFFFFF",
              border:
                "1px solid #D8CEC7",
              padding: 12,
              zIndex:
                10000,
              boxShadow:
                "0 4px 15px rgba(0,0,0,0.15)",
            }}
          >
            <input
              type="text"
              placeholder="검색어를 입력하세요"
              value={
                searchText
              }
              onChange={(
                e,
              ) =>
                setSearchText(
                  e.target
                    .value,
                )
              }
              style={{
                width:
                  "100%",
                padding: 10,
                boxSizing:
                  "border-box",
                border:
                  "1px solid #D8CEC7",
                outline:
                  "none",
              }}
            />

            {searchText.trim() !==
              "" && (
              <div
                style={{
                  marginTop: 8,
                  borderTop:
                    "1px solid #E2DCD5",
                  paddingTop:
                    8,
                }}
              >
                {searchResults.length >
                0 ? (
                  searchResults.map(
                    (
                      product,
                    ) => (
                      <div
                        key={
                          product.product_id
                        }
                        onClick={() =>
                          setSelectedProduct(
                            product,
                          )
                        }
                        style={{
                          padding:
                            "9px 4px",
                          borderBottom:
                            "1px solid #EDE7DC",
                          fontSize: 12,
                          cursor:
                            "pointer",
                        }}
                      >
                        <b>
                          {
                            product.product_name
                          }
                        </b>

                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 11,
                            color:
                              "#796252",
                          }}
                        >
                          {Number(
                            product.price ||
                              0,
                          ).toLocaleString()}
                          원
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div
                    style={{
                      padding:
                        "10px 4px",
                      fontSize: 12,
                      color:
                        "#796252",
                    }}
                  >
                    검색 결과가
                    없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <span
          style={{
            fontSize: 22,
          }}
        >
          ○
        </span>

        <span
          style={{
            fontSize: 22,
          }}
        >
          ⌕
        </span>

        <span
          onClick={() =>
            onLogin(
              "seller01",
            )
          }
          style={{
            fontSize: 22,
            borderLeft:
              "1px solid #D8CEC7",
            paddingLeft: 18,
            cursor:
              "pointer",
          }}
        >
          ♙
        </span>

        <span
          onClick={() =>
            setMenuOpen(
              (prev) =>
                !prev,
            )
          }
          style={{
            fontSize: 24,
            borderLeft:
              "1px solid #D8CEC7",
            paddingLeft: 18,
            cursor:
              "pointer",
          }}
        >
          ☰
        </span>
      </div>

      {/* ======================================================
          검색 상품 상세
      ====================================================== */}

      {selectedProduct && (
        <div
          style={{
            maxWidth: 1120,
            margin:
              "0 auto 20px",
            padding: 16,
            background:
              "#FAF9F6",
            border:
              "1px solid #D8CEC7",
            fontSize: 12,
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                10,
            }}
          >
            <b>
              상품 상세정보
            </b>

            <button
              onClick={() =>
                setSelectedProduct(
                  null,
                )
              }
              style={{
                border:
                  "none",
                background:
                  "transparent",
                cursor:
                  "pointer",
                fontSize: 16,
              }}
            >
              ×
            </button>
          </div>

          <div>
            상품명 :{" "}
            {
              selectedProduct.product_name
            }
          </div>

          <div>
            가격 :{" "}
            {Number(
              selectedProduct.price ||
                0,
            ).toLocaleString()}
            원
          </div>

          <div>
            재고 :{" "}
            {selectedProduct.stock ??
              "-"}
            개
          </div>

          <div>
            안전재고 :{" "}
            {selectedProduct.safety_stock ??
              "-"}
            개
          </div>
        </div>
      )}

      {/* ======================================================
          사이드 메뉴
      ====================================================== */}

      {menuOpen && (
        <div
          style={{
            position:
              "fixed",
            top: 0,
            left: 0,
            width: 290,
            height:
              "100vh",
            background:
              "#E8CFA5",
            zIndex:
              9999,
            boxShadow:
              "4px 0 15px rgba(0,0,0,0.18)",
            padding:
              "18px 20px",
            boxSizing:
              "border-box",
          }}
        >
          <div
            style={{
              background:
                "#796252",
              color:
                "#FFFFFF",
              padding:
                "18px 14px",
              margin:
                "-18px -20px 0",
              borderBottom:
                "1px solid #BDA98A",
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight:
                  "bold",
                letterSpacing:
                  1,
              }}
            >
              BASESEASON
            </div>

            <div
              style={{
                fontSize: 12,
                marginTop: 6,
                opacity: 0.9,
              }}
            >
              본사 관리자
            </div>
          </div>

          <div
            style={{
              padding:
                "16px 4px",
              borderBottom:
                "1px solid #BDA98A",
              fontWeight:
                "bold",
              cursor:
                "pointer",
            }}
          >
            🔔 알림{" "}
            <span
              style={{
                marginLeft: 6,
              }}
            >
              3
            </span>
          </div>

          <div
            style={{
              marginTop: 14,
              fontSize: 14,
              fontWeight:
                "bold",
            }}
          >
            <div
              onClick={() => {
                setMenuOpen(
                  false,
                );
                onOpenNotices();
              }}
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              📢 본사 공지사항
            </div>

            <div
              onClick={() => {
                setMenuOpen(
                  false,
                );
                onLogin(
                  "seller01",
                );
              }}
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              📦 재고 및 할인율 관리
            </div>

            <div
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              📝 고객 주문 관리
            </div>

            <div
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              💬 고객 문의 관리
            </div>

            <div
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              🏢 본사 상품 발주
            </div>

            <div
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              📋 발주 신청 내역
            </div>

            <div
              style={{
                padding:
                  "13px 6px",
                cursor:
                  "pointer",
              }}
            >
              🔥 지사 인기 상품
            </div>

            {/* 공통 메인 복귀 로그아웃 버튼 (사이드바 하단) */}
            <div
              style={{
                marginTop: "24px",
                paddingTop: "16px",
                borderTop: "1px solid #BDA98A",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  alert("관리자 모드에서 로그아웃 되었습니다.");
                  window.location.href = APP_PATHS.BUYER;
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#796252",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
                }}
              >
                🚪 로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          로그인 메인
      ====================================================== */}

      <div
        style={{
          maxWidth: 1120,
          margin:
            "0 auto",
          display:
            "grid",
          gridTemplateColumns:
            "1fr",
          gap: 28,
        }}
      >
        <section
          style={{
            minHeight:
              1100,
            background:
              "#FAF9F6",
            padding: 34,
            boxSizing:
              "border-box",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              borderBottom:
                `1px solid ${p}`,
              paddingBottom:
                16,
            }}
          >
            <b
              style={{
                letterSpacing: 2,
              }}
            >
              BASESEASON
            </b>

            <span
              style={{
                fontSize: 11,
                color: p,
              }}
            >
              COLLECTION CONTROL
            </span>
          </div>

          <p
            style={{
              color: p,
              fontSize: 11,
              fontWeight:
                "bold",
              marginTop: 30,
            }}
          >
            2026 FALL / WINTER
          </p>

          <h1
            style={{
              fontSize: 44,
              lineHeight:
                1.15,
              margin:
                "10px 0 16px",
            }}
          >
            A BETTER
            <br />
            SEASON FOR WORK.
          </h1>

          <p
            style={{
              fontSize: 13,
              lineHeight:
                1.7,
              color:
                "#6F6259",
            }}
          >
            본사와 지점의 상품,
            재고, 주문 흐름을 한
            곳에서 확인하고 관리합니다.
          </p>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: 12,
              marginTop:
                34,
              maxWidth: 650,
              marginLeft:
                "auto",
              marginRight:
                "auto",
            }}
          >
            {[
              [
                "지점 운영 관리",
                "seller01",
              ],
              [
                "고객 관리",
                "buyer01",
              ],
            ].map(
              ([title, id]) => (
                <button
                  key={id}
                  onClick={() =>
                    onLogin(id)
                  }
                  style={{
                    padding: 18,
                    textAlign:
                      "left",
                    background:
                      bg,
                    border: `1px solid ${p}`,
                    color:
                      text,
                    cursor:
                      "pointer",
                  }}
                >
                  <b>
                    {title}
                  </b>

                  <span
                    style={{
                      display:
                        "block",
                      fontSize: 11,
                      color: p,
                      marginTop: 8,
                    }}
                  >
                    {id} 바로 로그인
                  </span>
                </button>
              ),
            )}
          </div>

          <div
            style={{
              marginTop:
                46,
              paddingTop:
                22,
              borderTop:
                `1px solid ${p}`,
              textAlign:
                "center",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 14px",
                fontSize: 11,
                fontWeight:
                  "bold",
                letterSpacing:
                  1.2,
                color: p,
              }}
            >
              BASESEASON
              COLLECTION
            </p>

            <img
              src={mainPhoto}
              alt="BASESEASON 메인 컬렉션"
              style={{
                display:
                  "block",
                width:
                  "100%",
                height: 520,
                objectFit:
                  "contain",
                margin:
                  "0 auto",
              }}
            />
          </div>
        </section>

        {/* 관리자 로그인 영역은 기존처럼 숨김 */}
        <section
          style={{
            display:
              "none",
            minHeight:
              550,
            background:
              "#FAF9F6",
            padding: 34,
            boxSizing:
              "border-box",
            borderLeft:
              `4px solid ${p}`,
          }}
        >
          <p
            style={{
              color: p,
              fontSize: 11,
              fontWeight:
                "bold",
            }}
          >
            ADMIN ACCESS
          </p>

          <h2
            style={{
              fontSize: 26,
            }}
          >
            본사 관리자 로그인
          </h2>

          <p
            style={{
              fontSize: 12,
              color:
                "#6F6259",
              lineHeight:
                1.7,
            }}
          >
            데모 계정이 입력되어
            있습니다.
            <br />
            로그인 버튼을 누르면
            바로 시작합니다.
          </p>

          {message && (
            <Notice
              text={message}
            />
          )}

          <form
            onSubmit={
              onSubmit
            }
          >
            <label>
              아이디
            </label>

            <input
              value={
                loginId
              }
              onChange={(
                e,
              ) =>
                setLoginId(
                  e.target
                    .value,
                )
              }
              style={{
                ...input,
                borderRadius: 0,
              }}
            />

            <label>
              비밀번호
            </label>

            <input
              type="password"
              value={
                password
              }
              onChange={(
                e,
              ) =>
                setPassword(
                  e.target
                    .value,
                )
              }
              style={{
                ...input,
                borderRadius: 0,
              }}
            />

            <button
              style={{
                width:
                  "100%",
                padding: 14,
                border: 0,
                background:
                  p,
                color:
                  "#fff",
                fontWeight:
                  "bold",
                cursor:
                  "pointer",
              }}
            >
              관리자 로그인
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// 알림
// ============================================================

function Notice({ text }) {
  return (
    <div
      style={{
        background:
          "#E6F0EB",
        color:
          "#276749",
        padding: 10,
        borderRadius: 5,
        margin:
          "12px 0",
        fontSize: 12,
      }}
    >
      {text}
    </div>
  );
}

// ============================================================
// 쇼핑 정책
// ============================================================

function ShoppingPolicy() {
  const policyItems = [
    {
      title:
        "교환·반품 신청",
      text:
        "상품을 받은 날부터 7일 이내에 주문 상세에서 신청해 주세요.",
    },
    {
      title:
        "교환·반품이 어려운 경우",
      text:
        "착용·세탁·수선·향수·오염 등으로 상품 가치가 훼손되면 처리가 어려울 수 있습니다.",
    },
    {
      title:
        "배송 안내",
      text:
        "결제 완료 상품은 영업일 기준으로 순차 출고되며, 연휴·천재지변에는 일정이 달라질 수 있습니다.",
    },
    {
      title:
        "환불 처리",
      text:
        "반품 상품 확인 후 환불이 진행되며, 결제수단에 따라 반영 시점이 달라질 수 있습니다.",
    },
  ];

  return (
    <section
      style={{
        ...box,
        background:
          "#FAF9F6",
        borderTop:
          "4px solid #796252",
      }}
    >
      <p
        style={{
          color:
            "#796252",
          fontSize: 11,
          fontWeight:
            "bold",
          letterSpacing: 1,
          margin: 0,
        }}
      >
        SHOPPING GUIDE
      </p>

      <h2
        style={{
          margin:
            "7px 0 8px",
        }}
      >
        인터넷 쇼핑몰 이용 안내
      </h2>

      <p
        style={{
          color:
            "#6F6259",
          fontSize: 12,
          margin:
            "0 0 18px",
          lineHeight:
            1.6,
        }}
      >
        구매 전 상품 상세의
        사이즈·소재·색상 정보를
        확인해 주세요.
      </p>

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(2, minmax(230px, 1fr))",
          gap: 12,
        }}
      >
        {policyItems.map(
          (item) => (
            <div
              key={
                item.title
              }
              style={{
                background:
                  "#FFFFFF",
                border:
                  "1px solid #E2DCD5",
                padding:
                  "14px 16px",
              }}
            >
              <b
                style={{
                  color:
                    "#3A3532",
                  fontSize: 13,
                }}
              >
                {
                  item.title
                }
              </b>

              <p
                style={{
                  color:
                    "#6F6259",
                  fontSize: 12,
                  lineHeight:
                    1.6,
                  margin:
                    "7px 0 0",
                }}
              >
                {
                  item.text
                }
              </p>
            </div>
          ),
        )}
      </div>

      <p
        style={{
          color:
            "#8A7B70",
          fontSize: 11,
          margin:
            "16px 0 0",
          lineHeight:
            1.6,
        }}
      >
        ※ 실제 교환·반품
        가능 여부와 배송 일정은
        상품별 상세 안내 및 판매자
        정책에 따라 달라질 수 있습니다.
      </p>
    </section>
  );
}

// ============================================================
// 본사 데이터 관리
// ============================================================

function HeadquartersData({
  currentUser,
  onBack,
}) {
  const [
    selectedTable,
    setSelectedTable,
  ] = useState(
    "org_units",
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    isTableListOpen,
    setIsTableListOpen,
  ] = useState(
    false,
  );

  const [
    dbOrgUnits,
    setDbOrgUnits,
  ] = useState([]);

  const [
    dbUsers,
    setDbUsers,
  ] = useState([]);

  const [
    dbProducts,
    setDbProducts,
  ] = useState([]);

  const [
    dbOrders,
    setDbOrders,
  ] = useState([]);

  const [
    dbOrderItems,
    setDbOrderItems,
  ] = useState([]);

  const [
    dbPayments,
    setDbPayments,
  ] = useState([]);

  const [
    dbPaymentTransactions,
    setDbPaymentTransactions,
  ] = useState([]);

  const [
    dbPaymentWebhookEvents,
    setDbPaymentWebhookEvents,
  ] = useState([]);

  const [
    dbRefundPolicies,
    setDbRefundPolicies,
  ] = useState([]);

  const [
    dbRefundRequests,
    setDbRefundRequests,
  ] = useState([]);

  const [
    dbRefundItems,
    setDbRefundItems,
  ] = useState([]);

  const [
    dbBuyerInquiries,
    setDbBuyerInquiries,
  ] = useState([]);

  const [
    dbInquiryFiles,
    setDbInquiryFiles,
  ] = useState([]);

  const [
    dbCompanyPolicies,
    setDbCompanyPolicies,
  ] = useState([]);

  const [
    dbPolicyFiles,
    setDbPolicyFiles,
  ] = useState([]);

  const [
    dbCategories,
    setDbCategories,
  ] = useState([]);

  const [
    dbProductVariants,
    setDbProductVariants,
  ] = useState([]);

  const [
    dbInventories,
    setDbInventories,
  ] = useState([]);

  const [
    dbFileAssets,
    setDbFileAssets,
  ] = useState([]);

  const [
    dbProductImages,
    setDbProductImages,
  ] = useState([]);

  const [
    dbProductFiles,
    setDbProductFiles,
  ] = useState([]);

  const [
    dbAiProviders,
    setDbAiProviders,
  ] = useState([]);

  const [
    dbRagDocuments,
    setDbRagDocuments,
  ] = useState([]);

  const [
    dbRagDocumentFiles,
    setDbRagDocumentFiles,
  ] = useState([]);

  const [
    dbRagChunks,
    setDbRagChunks,
  ] = useState([]);

  const [
    dbRagEmbeddings,
    setDbRagEmbeddings,
  ] = useState([]);

  const [
    dbRagQueryLogs,
    setDbRagQueryLogs,
  ] = useState([]);

  const [
    dbBranchPurchaseOrderItems,
    setDbBranchPurchaseOrderItems,
  ] = useState([]);

  const [
    dbBranchPurchaseOrders,
    setDbBranchPurchaseOrders,
  ] = useState([]);

  const [
    dbCustomerShipments,
    setDbCustomerShipments,
  ] = useState([]);

  const [
    dbHgInventory,
    setDbHgInventory,
  ] = useState([]);

  const [
    dbNotices,
    setDbNotices,
  ] = useState([]);

  const [
    dbSellerProfiles,
    setDbSellerProfiles,
  ] = useState([]);

  const [
    dbUserAddresses,
    setDbUserAddresses,
  ] = useState([]);

  // ==========================================================
  // 실제 DB 데이터 조회
  // ==========================================================

  useEffect(() => {
    const apiList = [
      [
        "org-units",
        setDbOrgUnits,
      ],
      [
        "users",
        setDbUsers,
      ],
      [
        "products",
        setDbProducts,
      ],
      [
        "orders",
        setDbOrders,
      ],
      [
        "order-items",
        setDbOrderItems,
      ],
      [
        "payments",
        setDbPayments,
      ],
      [
        "payment-transactions",
        setDbPaymentTransactions,
      ],
      [
        "payment-webhook-events",
        setDbPaymentWebhookEvents,
      ],
      [
        "refund-policies",
        setDbRefundPolicies,
      ],
      [
        "refund-requests",
        setDbRefundRequests,
      ],
      [
        "refund-items",
        setDbRefundItems,
      ],
      [
        "buyer-inquiries",
        setDbBuyerInquiries,
      ],
      [
        "inquiry-files",
        setDbInquiryFiles,
      ],
      [
        "company-policies",
        setDbCompanyPolicies,
      ],
      [
        "policy-files",
        setDbPolicyFiles,
      ],
      [
        "categories",
        setDbCategories,
      ],
      [
        "product-variants",
        setDbProductVariants,
      ],
      [
        "inventories",
        setDbInventories,
      ],
      [
        "file-assets",
        setDbFileAssets,
      ],
      [
        "product-images",
        setDbProductImages,
      ],
      [
        "product-files",
        setDbProductFiles,
      ],
      [
        "ai-providers",
        setDbAiProviders,
      ],
      [
        "rag-documents",
        setDbRagDocuments,
      ],
      [
        "rag-document-files",
        setDbRagDocumentFiles,
      ],
      [
        "rag-chunks",
        setDbRagChunks,
      ],
      [
        "rag-embeddings",
        setDbRagEmbeddings,
      ],
      [
        "rag-query-logs",
        setDbRagQueryLogs,
      ],
      [
        "branch-purchase-order-items",
        setDbBranchPurchaseOrderItems,
      ],
      [
        "branch-purchase-orders",
        setDbBranchPurchaseOrders,
      ],
      [
        "customer-shipments",
        setDbCustomerShipments,
      ],
      [
        "hg-inventory",
        setDbHgInventory,
      ],
      [
        "notices",
        setDbNotices,
      ],
      [
        "seller-profiles",
        setDbSellerProfiles,
      ],
      [
        "user-addresses",
        setDbUserAddresses,
      ],
    ];

    apiList.forEach(
      ([endpoint, setter]) => {
        fetch(
          `http://127.0.0.1:8000/api/${endpoint}`,
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `${endpoint} API 오류`,
              );
            }

            return response.json();
          })
          .then((data) => {
            setter(
              Array.isArray(data)
                ? data
                : [],
            );
          })
          .catch((error) => {
            console.error(
              `${endpoint} 연결 오류:`,
              error,
            );

            setter([]);
          });
      },
    );
  }, []);

  // ==========================================================
  // 테이블 목록
  // ==========================================================

  const coreTables = [
    {
      id: "org_units",
      label: "org_units",
      count:
        dbOrgUnits.length,
      columns: [
        "org_id",
        "org_code",
        "org_name",
        "org_type",
        "phone",
      ],
      rows:
        dbOrgUnits.map(
          (org) => [
            org.org_id,
            org.org_code,
            org.org_name,
            org.org_type,
            org.phone,
          ],
        ),
    },

    {
      id: "users",
      label: "users",
      count:
        dbUsers.length,
      columns: [
        "user_id",
        "login_id",
        "user_name",
        "email",
        "status",
      ],
      rows:
        dbUsers.map(
          (user) => [
            user.user_id,
            user.login_id,
            user.user_name,
            user.email,
            user.user_status,
          ],
        ),
    },

    {
      id: "roles",
      label: "roles",
      count: 3,
      columns: [
        "role_id",
        "role_name",
        "description",
      ],
      rows: [
        [
          1,
          "관리자",
          "본사 통합 운영 권한",
        ],
        [
          2,
          "판매자",
          "상품·재고 관리 권한",
        ],
        [
          3,
          "구매자",
          "주문 조회 권한",
        ],
      ],
    },

    {
      id: "user_roles",
      label: "user_roles",
      count: 3,
      columns: [
        "user_role_id",
        "user_id",
        "role_id",
        "assigned_at",
      ],
      rows: [
        [
          1,
          1,
          1,
          "2026-09-15",
        ],
        [
          2,
          2,
          2,
          "2026-09-15",
        ],
        [
          3,
          3,
          2,
          "2026-09-15",
        ],
      ],
    },

    {
      id: "products",
      label: "products",
      count:
        dbProducts.length,
      columns: [
        "product_id",
        "product_name",
        "price",
        "status",
      ],
      rows:
        dbProducts.map(
          (product) => [
            product.product_id,
            product.product_name,
            product.price,
            product.status,
          ],
        ),
    },

    {
      id: "orders",
      label: "orders",
      count:
        dbOrders.length,
      columns: [
        "order_id",
        "order_no",
        "total_amount",
        "order_status",
        "process_status",
      ],
      rows:
        dbOrders.map(
          (order) => [
            order.order_id,
            order.order_no,
            order.total_amount,
            order.order_status,
            order.process_status,
          ],
        ),
    },

    {
      id: "order_items",
      label: "order_items",
      count:
        dbOrderItems.length,
      columns: [
        "order_item_id",
        "order_id",
        "product_id",
        "product_name",
        "quantity",
        "unit_price",
        "item_amount",
        "item_status",
      ],
      rows:
        dbOrderItems.map(
          (item) => [
            item.order_item_id,
            item.order_id,
            item.product_id,
            item.product_name_snapshot,
            item.quantity,
            item.unit_price,
            item.item_amount,
            item.item_status,
          ],
        ),
    },

    {
      id: "payments",
      label: "payments",
      count:
        dbPayments.length,
      columns: [
        "payment_id",
        "order_id",
        "payment_method",
        "payment_status",
        "requested_amount",
        "approved_amount",
      ],
      rows:
        dbPayments.map(
          (payment) => [
            payment.payment_id,
            payment.order_id,
            payment.payment_method,
            payment.payment_status,
            payment.requested_amount,
            payment.approved_amount,
          ],
        ),
    },

    {
      id: "payment_transactions",
      label:
        "payment_transactions",
      count:
        dbPaymentTransactions.length,
      columns: [
        "transaction_id",
        "payment_id",
        "transaction_key",
        "transaction_type",
        "transaction_status",
        "transaction_amount",
        "pg_transaction_id",
        "created_at",
      ],
      rows:
        dbPaymentTransactions.map(
          (transaction) => [
            transaction.transaction_id,
            transaction.payment_id,
            transaction.transaction_key,
            transaction.transaction_type,
            transaction.transaction_status,
            transaction.transaction_amount,
            transaction.pg_transaction_id,
            transaction.created_at,
          ],
        ),
    },

    {
      id: "payment_webhook_events",
      label:
        "payment_webhook_events",
      count:
        dbPaymentWebhookEvents.length,
      columns: [
        "webhook_id",
        "payment_id",
        "pg_provider",
        "event_type",
        "event_id",
        "processed_yn",
        "received_at",
        "processed_at",
      ],
      rows:
        dbPaymentWebhookEvents.map(
          (webhook) => [
            webhook.webhook_id,
            webhook.payment_id,
            webhook.pg_provider,
            webhook.event_type,
            webhook.event_id,
            webhook.processed_yn,
            webhook.received_at,
            webhook.processed_at,
          ],
        ),
    },

    {
      id: "refund_policies",
      label:
        "refund_policies",
      count:
        dbRefundPolicies.length,
      columns: [
        "refund_policy_id",
        "org_id",
        "policy_name",
        "allowed_days",
        "unopened_refund_yn",
        "opened_refund_yn",
        "defective_refund_yn",
        "shipping_fee_payer",
        "effective_from",
        "effective_to",
        "active_yn",
      ],
      rows:
        dbRefundPolicies.map(
          (policy) => [
            policy.refund_policy_id,
            policy.org_id,
            policy.policy_name,
            policy.allowed_days,
            policy.unopened_refund_yn,
            policy.opened_refund_yn,
            policy.defective_refund_yn,
            policy.shipping_fee_payer,
            policy.effective_from,
            policy.effective_to,
            policy.active_yn,
          ],
        ),
    },

    {
      id: "refund_requests",
      label:
        "refund_requests",
      count:
        dbRefundRequests.length,
      columns: [
        "refund_request_id",
        "org_id",
        "order_id",
        "buyer_user_id",
        "refund_policy_id",
        "refund_reason",
        "requested_amount",
        "approved_amount",
        "refund_status",
        "requested_at",
        "approved_at",
        "completed_at",
      ],
      rows:
        dbRefundRequests.map(
          (refund) => [
            refund.refund_request_id,
            refund.org_id,
            refund.order_id,
            refund.buyer_user_id,
            refund.refund_policy_id,
            refund.refund_reason,
            refund.requested_amount,
            refund.approved_amount,
            refund.refund_status,
            refund.requested_at,
            refund.approved_at,
            refund.completed_at,
          ],
        ),
    },

    {
      id: "refund_items",
      label:
        "refund_items",
      count:
        dbRefundItems.length,
      columns: [
        "refund_item_id",
        "org_id",
        "refund_request_id",
        "order_item_id",
        "refund_quantity",
        "refund_amount",
      ],
      rows:
        dbRefundItems.map(
          (item) => [
            item.refund_item_id,
            item.org_id,
            item.refund_request_id,
            item.order_item_id,
            item.refund_quantity,
            item.refund_amount,
          ],
        ),
    },

    {
      id: "buyer_inquiries",
      label:
        "buyer_inquiries",
      count:
        dbBuyerInquiries.length,
      columns: [
        "inquiry_id",
        "user_id",
        "org_id",
        "category_code",
        "title",
        "content",
        "inquiry_status",
        "secret_yn",
        "answer_content",
        "answered_by_user_id",
        "created_at",
        "updated_at",
        "answered_at",
      ],
      rows:
        dbBuyerInquiries.map(
          (inquiry) => [
            inquiry.inquiry_id,
            inquiry.user_id,
            inquiry.org_id,
            inquiry.category_code,
            inquiry.title,
            inquiry.content,
            inquiry.inquiry_status,
            inquiry.secret_yn,
            inquiry.answer_content,
            inquiry.answered_by_user_id,
            inquiry.created_at,
            inquiry.updated_at,
            inquiry.answered_at,
          ],
        ),
    },

    {
      id: "inquiry_files",
      label:
        "inquiry_files",
      count:
        dbInquiryFiles.length,
      columns: [
        "inquiry_file_id",
        "org_id",
        "inquiry_id",
        "file_id",
        "created_at",
      ],
      rows:
        dbInquiryFiles.map(
          (file) => [
            file.inquiry_file_id,
            file.org_id,
            file.inquiry_id,
            file.file_id,
            file.created_at,
          ],
        ),
    },

    {
      id: "company_policies",
      label:
        "company_policies",
      count:
        dbCompanyPolicies.length,
      columns: [
        "policy_id",
        "org_id",
        "org_name",
        "policy_code",
        "policy_name",
        "policy_version",
        "policy_content",
        "effective_from",
        "active_yn",
      ],
      rows:
        dbCompanyPolicies.map(
          (policy) => [
            policy.policy_id,
            policy.org_id,
            policy.org_name,
            policy.policy_code,
            policy.policy_name,
            policy.policy_version,
            policy.policy_content,
            policy.effective_from,
            policy.active_yn,
          ],
        ),
    },

    {
      id: "policy_files",
      label:
        "policy_files",
      count:
        dbPolicyFiles.length,
      columns: [
        "policy_file_id",
        "org_id",
        "policy_id",
        "file_id",
        "display_order",
      ],
      rows:
        dbPolicyFiles.map(
          (file) => [
            file.policy_file_id,
            file.org_id,
            file.policy_id,
            file.file_id,
            file.display_order,
          ],
        ),
    },

    {
      id: "categories",
      label: "categories",
      count:
        dbCategories.length,
      columns: [
        "category_id",
        "parent_category_id",
        "category_name",
        "category_level",
        "display_order",
        "active_yn",
      ],
      rows:
        dbCategories.map(
          (category) => [
            category.category_id,
            category.parent_category_id,
            category.category_name,
            category.category_level,
            category.display_order,
            category.active_yn,
          ],
        ),
    },

    {
      id: "product_variants",
      label:
        "product_variants",
      count:
        dbProductVariants.length,
      columns: [
        "variant_id",
        "org_id",
        "product_id",
        "sku_code",
        "option_name1",
        "option_value1",
        "option_name2",
        "option_value2",
        "additional_price",
        "active_yn",
      ],
      rows:
        dbProductVariants.map(
          (variant) => [
            variant.variant_id,
            variant.org_id,
            variant.product_id,
            variant.sku_code,
            variant.option_name1,
            variant.option_value1,
            variant.option_name2,
            variant.option_value2,
            variant.additional_price,
            variant.active_yn,
          ],
        ),
    },

    {
      id: "inventories",
      label:
        "inventories",
      count:
        dbInventories.length,
      columns: [
        "inventory_id",
        "org_id",
        "variant_id",
        "stock_quantity",
        "reserved_quantity",
        "safety_stock",
        "updated_at",
      ],
      rows:
        dbInventories.map(
          (inventory) => [
            inventory.inventory_id,
            inventory.org_id,
            inventory.variant_id,
            inventory.stock_quantity,
            inventory.reserved_quantity,
            inventory.safety_stock,
            inventory.updated_at,
          ],
        ),
    },

    {
      id: "file_assets",
      label:
        "file_assets",
      count:
        dbFileAssets.length,
      columns: [
        "file_id",
        "org_id",
        "file_type",
        "storage_type",
        "original_file_name",
        "stored_file_name",
        "file_extension",
        "mime_type",
        "file_size",
        "storage_path",
        "public_url",
        "thumbnail_url",
        "checksum_sha256",
        "active_yn",
        "created_at",
      ],
      rows:
        dbFileAssets.map(
          (file) => [
            file.file_id,
            file.org_id,
            file.file_type,
            file.storage_type,
            file.original_file_name,
            file.stored_file_name,
            file.file_extension,
            file.mime_type,
            file.file_size,
            file.storage_path,
            file.public_url,
            file.thumbnail_url,
            file.checksum_sha256,
            file.active_yn,
            file.created_at,
          ],
        ),
    },

    {
      id: "product_images",
      label:
        "product_images",
      count:
        dbProductImages.length,
      columns: [
        "product_image_id",
        "org_id",
        "product_id",
        "file_id",
        "image_type",
        "alt_text",
        "display_order",
        "active_yn",
        "created_at",
      ],
      rows:
        dbProductImages.map(
          (image) => [
            image.product_image_id,
            image.org_id,
            image.product_id,
            image.file_id,
            image.image_type,
            image.alt_text,
            image.display_order,
            image.active_yn,
            image.created_at,
          ],
        ),
    },

    {
      id: "product_files",
      label:
        "product_files",
      count:
        dbProductFiles.length,
      columns: [
        "product_file_id",
        "org_id",
        "product_id",
        "file_id",
        "file_category",
        "file_description",
        "display_order",
        "created_at",
      ],
      rows:
        dbProductFiles.map(
          (file) => [
            file.product_file_id,
            file.org_id,
            file.product_id,
            file.file_id,
            file.file_category,
            file.file_description,
            file.display_order,
            file.created_at,
          ],
        ),
    },

    {
      id: "ai_providers",
      label:
        "ai_providers",
      count:
        dbAiProviders.length,
      columns: [
        "provider_id",
        "provider_code",
        "provider_name",
        "provider_type",
        "base_url",
        "chat_model",
        "embedding_model",
        "active_yn",
        "created_at",
      ],
      rows:
        dbAiProviders.map(
          (provider) => [
            provider.provider_id,
            provider.provider_code,
            provider.provider_name,
            provider.provider_type,
            provider.base_url,
            provider.chat_model,
            provider.embedding_model,
            provider.active_yn,
            provider.created_at,
          ],
        ),
    },

    {
      id: "rag_documents",
      label:
        "rag_documents",
      count:
        dbRagDocuments.length,
      columns: [
        "document_id",
        "provider_id",
        "org_id",
        "document_type",
        "document_name",
        "source_type",
        "source_uri",
        "content_text",
        "version",
        "document_status",
        "created_at",
        "updated_at",
      ],
      rows:
        dbRagDocuments.map(
          (document) => [
            document.document_id,
            document.provider_id,
            document.org_id,
            document.document_type,
            document.document_name,
            document.source_type,
            document.source_uri,
            document.content_text,
            document.version,
            document.document_status,
            document.created_at,
            document.updated_at,
          ],
        ),
    },

    {
      id: "rag_document_files",
      label:
        "rag_document_files",
      count:
        dbRagDocumentFiles.length,
      columns: [
        "rag_document_file_id",
        "org_id",
        "document_id",
        "file_id",
      ],
      rows:
        dbRagDocumentFiles.map(
          (file) => [
            file.rag_document_file_id,
            file.org_id,
            file.document_id,
            file.file_id,
          ],
        ),
    },

    {
      id: "rag_chunks",
      label:
        "rag_chunks",
      count:
        dbRagChunks.length,
      columns: [
        "chunk_id",
        "org_id",
        "document_id",
        "chunk_no",
        "chunk_text",
        "token_count",
        "metadata_json",
        "created_at",
      ],
      rows:
        dbRagChunks.map(
          (chunk) => [
            chunk.chunk_id,
            chunk.org_id,
            chunk.document_id,
            chunk.chunk_no,
            chunk.chunk_text,
            chunk.token_count,
            chunk.metadata_json,
            chunk.created_at,
          ],
        ),
    },

    {
      id: "rag_embeddings",
      label:
        "rag_embeddings",
      count:
        dbRagEmbeddings.length,
      columns: [
        "embedding_id",
        "org_id",
        "chunk_id",
        "embedding_provider",
        "embedding_model",
        "embedding_dimension",
        "embedding_json",
        "vector_db_type",
        "vector_collection",
        "vector_external_id",
        "created_at",
      ],
      rows:
        dbRagEmbeddings.map(
          (embedding) => [
            embedding.embedding_id,
            embedding.org_id,
            embedding.chunk_id,
            embedding.embedding_provider,
            embedding.embedding_model,
            embedding.embedding_dimension,
            embedding.embedding_json,
            embedding.vector_db_type,
            embedding.vector_collection,
            embedding.vector_external_id,
            embedding.created_at,
          ],
        ),
    },

    {
      id: "rag_query_logs",
      label:
        "rag_query_logs",
      count:
        dbRagQueryLogs.length,
      columns: [
        "query_log_id",
        "org_id",
        "user_id",
        "provider_id",
        "question_text",
        "response_text",
        "retrieved_chunk_ids",
        "prompt_tokens",
        "completion_tokens",
        "response_time_ms",
        "created_at",
      ],
      rows:
        dbRagQueryLogs.map(
          (log) => [
            log.query_log_id,
            log.org_id,
            log.user_id,
            log.provider_id,
            log.question_text,
            log.response_text,
            log.retrieved_chunk_ids,
            log.prompt_tokens,
            log.completion_tokens,
            log.response_time_ms,
            log.created_at,
          ],
        ),
    },

    {
      id:
        "branch_purchase_order_items",
      label:
        "branch_purchase_order_items",
      count:
        dbBranchPurchaseOrderItems.length,
      columns: [
        "branch_order_item_id",
        "org_id",
        "branch_order_id",
        "product_id",
        "variant_id",
        "order_quantity",
        "approved_quantity",
        "received_quantity",
        "unit_price",
        "item_amount",
        "created_at",
      ],
      rows:
        dbBranchPurchaseOrderItems.map(
          (item) => [
            item.branch_order_item_id,
            item.org_id,
            item.branch_order_id,
            item.product_id,
            item.variant_id,
            item.order_quantity,
            item.approved_quantity,
            item.received_quantity,
            item.unit_price,
            item.item_amount,
            item.created_at,
          ],
        ),
    },

    {
      id:
        "branch_purchase_orders",
      label:
        "branch_purchase_orders",
      count:
        dbBranchPurchaseOrders.length,
      columns: [
        "branch_order_id",
        "branch_order_no",
        "org_id",
        "head_org_id",
        "requested_by_user_id",
        "approved_by_user_id",
        "order_status",
        "request_note",
        "requested_at",
        "approved_at",
        "shipped_at",
        "received_at",
        "updated_at",
      ],
      rows:
        dbBranchPurchaseOrders.map(
          (order) => [
            order.branch_order_id,
            order.branch_order_no,
            order.org_id,
            order.head_org_id,
            order.requested_by_user_id,
            order.approved_by_user_id,
            order.order_status,
            order.request_note,
            order.requested_at,
            order.approved_at,
            order.shipped_at,
            order.received_at,
            order.updated_at,
          ],
        ),
    },

    {
      id: "customer_shipments",
      label:
        "customer_shipments",
      count:
        dbCustomerShipments.length,
      columns: [
        "shipment_id",
        "org_id",
        "order_id",
        "shipment_no",
        "shipment_status",
        "carrier_name",
        "tracking_number",
        "receiver_name",
        "receiver_phone",
        "zipcode",
        "shipping_address1",
        "shipping_address2",
        "prepared_at",
        "shipped_at",
        "delivered_at",
        "created_at",
        "updated_at",
      ],
      rows:
        dbCustomerShipments.map(
          (shipment) => [
            shipment.shipment_id,
            shipment.org_id,
            shipment.order_id,
            shipment.shipment_no,
            shipment.shipment_status,
            shipment.carrier_name,
            shipment.tracking_number,
            shipment.receiver_name,
            shipment.receiver_phone,
            shipment.zipcode,
            shipment.shipping_address1,
            shipment.shipping_address2,
            shipment.prepared_at,
            shipment.shipped_at,
            shipment.delivered_at,
            shipment.created_at,
            shipment.updated_at,
          ],
        ),
    },

    {
      id: "hg_inventory",
      label:
        "hg_inventory",
      count:
        Array.isArray(
          dbHgInventory,
        )
          ? dbHgInventory.length
          : 0,
      columns: [
        "hg_inventory_id",
        "org_id",
        "product_id",
        "variant_id",
        "stock_quantity",
        "reserved_quantity",
        "safety_stock",
        "available_quantity",
        "updated_at",
      ],
      rows:
        (
          Array.isArray(
            dbHgInventory,
          )
            ? dbHgInventory
            : []
        ).map(
          (item) => [
            item.hg_inventory_id,
            item.org_id,
            item.product_id,
            item.variant_id,
            item.stock_quantity,
            item.reserved_quantity,
            item.safety_stock,
            item.available_quantity,
            item.updated_at,
          ],
        ),
    },

    {
      id: "notices",
      label: "notices",
      count:
        dbNotices.length,
      columns: [
        "notice_id",
        "title",
        "created_at",
        "updated_at",
        "view_count",
        "is_pinned",
        "image",
        "author_name",
        "org_name",
      ],
      rows:
        dbNotices.map(
          (notice) => [
            notice.notice_id,
            notice.title,
            notice.created_at,
            notice.updated_at,
            notice.view_count,
            notice.is_pinned,
            notice.image,
            notice.author_name,
            notice.org_name,
          ],
        ),
    },

    {
      id:
        "seller_profiles",
      label:
        "seller_profiles",
      count:
        Array.isArray(
          dbSellerProfiles,
        )
          ? dbSellerProfiles.length
          : 0,
      columns: [
        "seller_id",
        "org_id",
        "user_id",
        "company_name",
        "business_number",
        "representative_name",
        "settlement_bank",
        "settlement_account",
        "seller_status",
        "created_at",
      ],
      rows:
        (
          Array.isArray(
            dbSellerProfiles,
          )
            ? dbSellerProfiles
            : []
        ).map(
          (item) => [
            item.seller_id,
            item.org_id,
            item.user_id,
            item.company_name,
            item.business_number,
            item.representative_name,
            item.settlement_bank,
            item.settlement_account,
            item.seller_status,
            item.created_at,
          ],
        ),
    },

    {
      id:
        "user_addresses",
      label:
        "user_addresses",
      count:
        Array.isArray(
          dbUserAddresses,
        )
          ? dbUserAddresses.length
          : 0,
      columns: [
        "address_id",
        "org_id",
        "user_id",
        "address_name",
        "receiver_name",
        "receiver_phone",
        "zipcode",
        "address1",
        "address2",
        "default_yn",
        "created_at",
      ],
      rows:
        (
          Array.isArray(
            dbUserAddresses,
          )
            ? dbUserAddresses
            : []
        ).map(
          (item) => [
            item.address_id,
            item.org_id,
            item.user_id,
            item.address_name,
            item.receiver_name,
            item.receiver_phone,
            item.zipcode,
            item.address1,
            item.address2,
            item.default_yn,
            item.created_at,
          ],
        ),
    },
  ];

  const tables =
    coreTables;

  const table =
    tables.find(
      (item) =>
        item.id ===
        selectedTable,
    ) ||
    tables[0];

  const rows =
    table.rows.filter(
      (row) =>
        row
          .join(" ")
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (
    <main
      style={{
        minHeight:
          "100vh",
        background:
          "linear-gradient(135deg,#F7EBDD,#EEF5F3)",
        padding: 30,
        fontFamily:
          "Arial, sans-serif",
        color:
          "#283444",
        boxSizing:
          "border-box",
      }}
    >
      <header
        style={{
          maxWidth: 1400,
          margin:
            "0 auto 18px",
          background:
            "rgba(255,255,255,.85)",
          padding:
            "18px 24px",
          borderRadius: 14,
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          boxShadow:
            "0 5px 18px rgba(70,55,40,.08)",
        }}
      >
        <div>
          <b
            style={{
              letterSpacing: 2,
              color:
                "#A74D20",
            }}
          >
            BASESEASON
          </b>

          <span
            style={{
              marginLeft: 12,
              fontSize: 12,
              color:
                "#758092",
            }}
          >
            본사 관리자 전용
          </span>
        </div>

        <div>
          👤{" "}
          <b>
            {
              currentUser?.user_name
            }
          </b>{" "}

          <button
            onClick={onBack}
            style={{
              ...button,
              marginLeft: 14,
              background:
                "#C45F20",
            }}
          >
            운영 콘솔로 돌아가기
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1400,
          margin: "auto",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(110deg,#fff,#F2F6FF)",
            border:
              "1px solid #D3DEF6",
            borderRadius: 18,
            padding:
              "24px 28px",
            marginBottom:
              18,
          }}
        >
          <p
            style={{
              color:
                "#16837D",
              fontWeight:
                "bold",
              fontSize: 11,
              letterSpacing:
                1,
            }}
          >
            본사 · 데이터 운영
          </p>

          <h1
            style={{
              fontSize: 24,
              margin:
                "6px 0",
            }}
          >
            본사 원본 데이터 관리
          </h1>

          <p
            style={{
              fontSize: 13,
              color:
                "#526176",
              margin: 0,
            }}
          >
            테이블을 선택하고
            데이터를 검색·확인하는
            본사 관리자 전용 화면입니다.
          </p>
        </section>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "290px 1fr",
            gap: 18,
          }}
        >
          <aside
            style={{
              background:
                "rgba(255,255,255,.92)",
              borderRadius: 16,
              padding: 18,
              boxShadow:
                "0 5px 18px rgba(70,55,40,.08)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color:
                  "#16837D",
                fontWeight:
                  "bold",
                letterSpacing:
                  1,
              }}
            >
              DATA CATALOG
            </div>

            <h2
              style={{
                fontSize: 18,
                margin:
                  "6px 0 12px",
              }}
            >
              테이블 탐색기{" "}
              <span
                style={{
                  float:
                    "right",
                  color:
                    "#5C51A4",
                }}
              >
                {tables.length}개
              </span>
            </h2>

            <p
              style={{
                fontSize: 12,
                color:
                  "#667085",
                lineHeight:
                  1.6,
                margin:
                  "0 0 12px",
              }}
            >
              현재 선택:{" "}
              <b
                style={{
                  color:
                    "#173B5F",
                }}
              >
                {table.label}
              </b>
            </p>

            <button
              onClick={() =>
                setIsTableListOpen(
                  (open) =>
                    !open,
                )
              }
              style={{
                width:
                  "100%",
                padding:
                  "11px 12px",
                cursor:
                  "pointer",
                textAlign:
                  "left",
                background:
                  isTableListOpen
                    ? "#173B5F"
                    : "#F4F7FB",
                color:
                  isTableListOpen
                    ? "#fff"
                    : "#173B5F",
                border:
                  "1px solid #B8C8DA",
                borderRadius: 8,
                fontWeight:
                  "bold",
              }}
            >
              {isTableListOpen
                ? "⌃ 테이블 목록 닫기"
                : "⌄ 테이블 목록 펼치기"}
            </button>

            {isTableListOpen && (
              <div
                style={{
                  marginTop:
                    12,
                }}
              >
                <input
                  placeholder="테이블 이름 검색"
                  value={
                    search
                  }
                  style={{
                    ...input,
                    margin:
                      "0 0 12px",
                  }}
                  onChange={(
                    e,
                  ) =>
                    setSearch(
                      e.target
                        .value,
                    )
                  }
                />

                <div
                  style={{
                    maxHeight:
                      460,
                    overflowY:
                      "auto",
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr",
                    gap: 8,
                  }}
                >
                  {tables
                    .filter(
                      (
                        item,
                      ) =>
                        item.label
                          .toLowerCase()
                          .includes(
                            search
                              .toLowerCase(),
                          ),
                    )
                    .map(
                      (
                        item,
                      ) => (
                        <button
                          key={
                            item.id
                          }
                          onClick={() => {
                            setSelectedTable(
                              item.id,
                            );

                            setSearch(
                              "",
                            );

                            setIsTableListOpen(
                              false,
                            );
                          }}
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            textAlign:
                              "left",
                            background:
                              item.id ===
                              selectedTable
                                ? "#173B5F"
                                : "#F8FAFC",
                            border:
                              item.id ===
                              selectedTable
                                ? "1px solid #173B5F"
                                : "1px solid #D8E0E8",
                            borderRadius: 9,
                            padding: 10,
                            cursor:
                              "pointer",
                            color:
                              item.id ===
                              selectedTable
                                ? "#fff"
                                : "#334155",
                          }}
                        >
                          <b
                            style={{
                              fontSize: 12,
                            }}
                          >
                            {
                              item.label
                            }
                          </b>

                          <span
                            style={{
                              float:
                                "right",
                              fontSize: 11,
                              opacity:
                                0.85,
                            }}
                          >
                            {
                              item.count
                            }{" "}
                            records
                          </span>
                        </button>
                      ),
                    )}
                </div>
              </div>
            )}
          </aside>

          <section
            style={{
              background:
                "rgba(255,255,255,.96)",
              borderRadius: 16,
              padding: 24,
              overflow:
                "auto",
              boxShadow:
                "0 5px 18px rgba(70,55,40,.08)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color:
                  "#16837D",
                fontWeight:
                  "bold",
                margin: 0,
              }}
            >
              테이블 작업 영역
            </p>

            <h2
              style={{
                margin:
                  "7px 0",
                fontSize: 21,
              }}
            >
              {
                table.label
              }
            </h2>

            <p
              style={{
                fontSize: 13,
                color:
                  "#667085",
                margin:
                  "0 0 20px",
              }}
            >
              기본키:{" "}
              {
                table.columns[0]
              }{" "}
              · 현재{" "}
              {rows.length}
              개 결과
            </p>

            <div
              style={{
                display:
                  "flex",
                gap: 12,
                marginBottom:
                  18,
              }}
            >
              <select
                style={{
                  padding: 10,
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: 8,
                }}
              >
                <option>
                  전체 컬럼
                </option>
              </select>

              <input
                value={
                  search
                }
                onChange={(
                  e,
                ) =>
                  setSearch(
                    e.target
                      .value,
                  )
                }
                placeholder="선택한 테이블 검색"
                style={{
                  ...input,
                  margin: 0,
                  flex: 1,
                }}
              />
            </div>

            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  650,
              }}
            >
              <thead>
                <tr>
                  {table.columns.map(
                    (
                      column,
                    ) => (
                      <th
                        key={
                          column
                        }
                        style={{
                          padding:
                            12,
                          textAlign:
                            "left",
                          background:
                            "#F4F7FB",
                          borderBottom:
                            "1px solid #DCE4EE",
                          fontSize: 12,
                        }}
                      >
                        {
                          column
                        }
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {rows.map(
                  (
                    row,
                    index,
                  ) => (
                    <tr
                      key={
                        index
                      }
                    >
                      {row.map(
                        (
                          cell,
                          cellIndex,
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                            style={{
                              padding:
                                13,
                              borderBottom:
                                "1px solid #E7ECF2",
                              fontSize: 13,
                            }}
                          >
                            {cell ===
                              null ||
                            cell ===
                              undefined
                              ? "-"
                              : typeof cell ===
                                  "object"
                                ? JSON.stringify(
                                    cell,
                                  )
                                : String(
                                    cell,
                                  )}
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </main>
  );
}