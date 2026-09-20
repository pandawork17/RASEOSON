import React, { useEffect, useState } from "react";
import "./App.css";
import NoticeList from "./NoticeList";
// 이미 src/assets 폴더에 있는 hero.png를 메인 사진으로 사용합니다.
import mainPhoto from "./assets/main-photo.jpg";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginInputId, setLoginInputId] = useState("admin01");
  // 로그인 전 화면에서 비밀번호가 입력된 것처럼 보이게 하는 데모용 값입니다.
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

  // 브라우저의 ← / → 버튼과 React 내부 화면 상태를 연결합니다.
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
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 화면 이동은 반드시 이 함수를 사용해서 브라우저 방문 기록에도 남깁니다.
  function navigatePage(nextPage) {
    setPage(nextPage);
    window.history.pushState(
      { baseseason: true, page: nextPage, activeTab },
      "",
    );
  }

  function navigateTab(nextTab) {
    setPage("dashboard");
    setActiveTab(nextTab);
    window.history.pushState(
      { baseseason: true, page: "dashboard", activeTab: nextTab },
      "",
    );
  }

  // ==========================================
  // 💡 1:1 문의 페이지 번호
  // ==========================================
  const [inquiryPage, setInquiryPage] = useState(1);
  const INQUIRIES_PER_PAGE = 10;

  // ==========================================
// 💡 shopdb3jo 실제 조직 데이터
// ==========================================

// 처음에는 빈 배열로 시작합니다.
// 잠시 후 FastAPI에서 실제 shopdb3jo 데이터를 받아옵니다.
const [orgs, setOrgs] = useState([]);

// ==========================================
// 💡 FastAPI → MySQL shopdb3jo 조직 조회
// ==========================================
useEffect(() => {
  fetch("http://127.0.0.1:8000/api/org-units")
    .then((response) => {
      // 백엔드에서 오류가 발생했는지 확인
      if (!response.ok) {
        throw new Error("조직 데이터를 가져오지 못했습니다.");
      }

      // FastAPI가 보내준 JSON 데이터를 읽습니다.
      return response.json();
    })
    .then((data) => {
      // 확인용: F12 → Console에서 실제 데이터를 볼 수 있습니다.
      console.log("shopdb3jo 조직 데이터:", data);

      // 받아온 실제 DB 데이터를 orgs에 저장합니다.
      setOrgs(data);
    })
    .catch((error) => {
      console.error("shopdb3jo 조직 조회 오류:", error);
    });
}, []);
  // ==========================================
// 💡 shopdb3jo 실제 회원 데이터
// ==========================================
const [users, setUsers] = useState([]);

// ==========================================
// 💡 FastAPI → MySQL shopdb3jo 회원 조회
// ==========================================
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
      setUsers(data);
    })
    .catch((error) => {
      console.error("shopdb3jo 회원 조회 오류:", error);
    });
}, []);
  const [products, setProducts] = useState([
    {
      product_id: 1,
      product_name: "미니멀 싱글 코트_브라운",
      seller: "패션판매자",
      price: 159000,
      stock: 150,
      safety_stock: 20,
      image_url: "coat_brown.jpg",
    },
    {
      product_id: 2,
      product_name: "미니멀 더블 울 코트_블랙",
      seller: "패션판매자",
      price: 179000,
      stock: 6,
      safety_stock: 10,
      image_url: "coat_black.jpg",
    },
    {
      product_id: 3,
      product_name: "울 블렌드 코트_차콜",
      seller: "패션판매자",
      price: 169000,
      stock: 45,
      safety_stock: 15,
      image_url: "coat_charcoal.jpg",
    },
    {
      product_id: 4,
      product_name: "클래식 더블 코트_아이보리",
      seller: "패션판매자",
      price: 169000,
      stock: 30,
      safety_stock: 10,
      image_url: "coat_ivory.jpg",
    },
  ]);
  const [orders, setOrders] = useState([
    {
      order_id: 101,
      buyer: "구매자A",
      product_name: "미니멀 싱글 코트_브라운",
      qty: 1,
      total_amount: 159000,
      payment_status: "결제완료",
      order_status: "배송준비중",
    },
    {
      order_id: 102,
      buyer: "구매자B",
      product_name: "미니멀 더블 울 코트_블랙",
      qty: 1,
      total_amount: 179000,
      payment_status: "결제완료",
      order_status: "배송중",
    },
    {
      order_id: 103,
      buyer: "구매자C",
      product_name: "울 블렌드 코트_차콜",
      qty: 1,
      total_amount: 169000,
      payment_status: "환불요청",
      order_status: "환불진행중",
    },
  ]);

  // ==========================================
  // 💡 1:1 문의 데이터
  // ==========================================
  const [inquiries, setInquiries] = useState([
    {
      inquiry_id: 1,
      author: "구매자A",
      title: "배송 언제 시작되나요?",
      content: "어제 주문했는데 아직 배송 준비 중이네요.",
      category: "배송",
      status: "미답변",
      created_at: "2026-09-16",
    },
    {
      inquiry_id: 2,
      author: "구매자B",
      title: "사이즈 교환 문의합니다.",
      content: "M사이즈로 변경 가능한가요?",
      category: "교환/반품",
      status: "답변완료",
      created_at: "2026-09-15",
    },
    {
      inquiry_id: 3,
      author: "구매자C",
      title: "블랙 코트 소재를 알려주세요.",
      content: "울 함량과 세탁 방법이 궁금합니다.",
      category: "상품 문의",
      status: "미답변",
      created_at: "2026-09-16",
    },
    {
      inquiry_id: 4,
      author: "구매자A",
      title: "결제 취소가 가능한가요?",
      content: "결제 완료 후 주문 취소 가능 시간을 알고 싶습니다.",
      category: "주문·결제",
      status: "답변완료",
      created_at: "2026-09-14",
    },
    {
      inquiry_id: 5,
      author: "구매자B",
      title: "회원 정보 변경 문의",
      content: "휴대전화 번호를 변경하고 싶습니다.",
      category: "기타",
      status: "미답변",
      created_at: "2026-09-13",
    },
    {
      inquiry_id: 6,
      author: "구매자A",
      title: "브라운 코트 실제 색상 문의",
      content: "상세 이미지와 실제 상품의 색상 차이가 큰지 궁금합니다.",
      category: "상품 문의",
      status: "답변완료",
      created_at: "2026-09-12",
    },
    {
      inquiry_id: 7,
      author: "구매자C",
      title: "사이즈 추천 부탁드립니다.",
      content: "키 175cm, 체중 70kg인데 어떤 사이즈가 적당한가요?",
      category: "상품 문의",
      status: "미답변",
      created_at: "2026-09-11",
    },
    {
      inquiry_id: 8,
      author: "구매자B",
      title: "무통장 입금 확인 문의",
      content: "입금 후 주문 상태가 언제 결제 완료로 바뀌나요?",
      category: "주문·결제",
      status: "미답변",
      created_at: "2026-09-12",
    },
    {
      inquiry_id: 9,
      author: "구매자C",
      title: "쿠폰과 적립금 동시 사용",
      content: "할인 쿠폰 사용 시 적립금도 함께 사용할 수 있나요?",
      category: "주문·결제",
      status: "답변완료",
      created_at: "2026-09-10",
    },
    {
      inquiry_id: 10,
      author: "구매자B",
      title: "배송 조회가 되지 않습니다.",
      content: "송장 번호를 받았는데 택배사 조회 화면에서 확인되지 않습니다.",
      category: "배송",
      status: "미답변",
      created_at: "2026-09-15",
    },
    {
      inquiry_id: 11,
      author: "구매자C",
      title: "제주도 추가 배송비 문의",
      content: "제주 지역 주문 시 추가 배송비가 있는지 알고 싶습니다.",
      category: "배송",
      status: "답변완료",
      created_at: "2026-09-12",
    },
    {
      inquiry_id: 12,
      author: "구매자A",
      title: "반품 배송비 확인 요청",
      content: "단순 변심 반품 시 배송비가 얼마인지 확인 부탁드립니다.",
      category: "교환/반품",
      status: "미답변",
      created_at: "2026-09-14",
    },
    {
      inquiry_id: 13,
      author: "구매자C",
      title: "교환 상품 재고 문의",
      content: "교환하려는 블랙 M 사이즈의 재고가 남아 있나요?",
      category: "교환/반품",
      status: "답변완료",
      created_at: "2026-09-11",
    },
    {
      inquiry_id: 14,
      author: "구매자A",
      title: "회원 탈퇴 방법 문의",
      content: "회원 탈퇴 메뉴 위치를 알려주세요.",
      category: "기타",
      status: "답변완료",
      created_at: "2026-09-10",
    },
    {
      inquiry_id: 15,
      author: "구매자C",
      title: "앱 알림 수신 설정 문의",
      content: "주문 알림을 받지 않도록 설정할 수 있나요?",
      category: "기타",
      status: "미답변",
      created_at: "2026-09-09",
    },
  ]);

  // ==========================================
  // 💡 1:1 문의 카테고리 필터 + 페이지 계산
  // ==========================================
  const filteredInquiries =
    inquiryCategory === "전체"
      ? inquiries
      : inquiries.filter((item) => item.category === inquiryCategory);

  const totalInquiryPages = Math.max(
    1,
    Math.ceil(filteredInquiries.length / INQUIRIES_PER_PAGE),
  );

  const paginatedInquiries = filteredInquiries.slice(
    (inquiryPage - 1) * INQUIRIES_PER_PAGE,
    inquiryPage * INQUIRIES_PER_PAGE,
  );

  function processLogin(loginId) {
    if (!loginId.trim()) return setMessage("아이디를 입력해주세요.");
    const isAdmin = loginId.includes("admin");
    const isSeller = loginId.includes("seller");
    const tab = isAdmin ? "admin" : isSeller ? "seller" : "customer";
    const role = isAdmin ? "관리자" : isSeller ? "판매자" : "구매자";
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
    setCurrentUser({ login_id: loginId, user_name: name, role });
    setActiveTab(tab);
    setPage("dashboard");
    setIsLoggedIn(true);
    window.history.pushState(
      { baseseason: true, page: "dashboard", activeTab: tab },
      "",
    );
    setMessage(`[로그인 성공] ${name} (${role})님 환영합니다!`);
  }
  function submitLogin(e) {
    e.preventDefault();
    if (!loginInputPw.trim()) return setMessage("비밀번호를 입력해주세요.");
    processLogin(loginInputId);
  }
  function logout() {
    setIsLoggedIn(false);
    setMessage("안전하게 로그아웃되었습니다.");
  }
  function addOrg(e) {
    e.preventDefault();
    if (!form.org_code.trim() || !form.org_name.trim())
      return setMessage("조직 코드와 조직명은 반드시 입력해야 합니다.");
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
    setForm({ org_code: "", org_name: "", phone: "", email: "", address1: "" });
    setMessage("지사가 성공적으로 등록되었습니다.");
  }
  const th = {
    padding: 8,
    borderBottom: "2px solid #E2DCD5",
    color: "#7E7670",
    fontSize: 11,
    textAlign: "left",
  };
  const td = { padding: 8, borderBottom: "1px solid #F4F1ED", fontSize: 12 };

  if (!isLoggedIn)
    return (
      <BrandLogin
        loginId={loginInputId}
        setLoginId={setLoginInputId}
        password={loginInputPw}
        setPassword={setLoginInputPw}
        message={message}
        onSubmit={submitLogin}
        onLogin={processLogin}
      />
    );

  if (page === "hqData")
    return (
      <HeadquartersData
        currentUser={currentUser}
        onBack={() => window.history.back()}
      />
    );

  if (page === "notices")
    return (
      <NoticeList
        currentUser={currentUser}
        onBack={() => window.history.back()}
      />
    );
  if (activeTab === "admin")
    return (
      <BranchAnalytics
  orgs={orgs}
  products={products}
  currentUser={currentUser}
  onLogout={logout}
  onData={() => navigatePage("hqData")}
  onNotices={() => navigatePage("notices")}
/>
    );

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
        <b style={{ letterSpacing: 2 }}>BASESEASON</b>
        <div>
          {currentUser.role === "관리자" && (
            <button
              onClick={() => navigatePage("hqData")}
              style={{ ...button, background: "#C86B2B" }}
            >
              본사 데이터 관리
            </button>
          )}{" "}
          <button
            onClick={() => navigateTab("admin")}
            style={{
              ...button,
              background: activeTab === "admin" ? "#A56A63" : "#6B5B52",
              outline: activeTab === "admin" ? "2px solid #F3C49D" : "none",
            }}
          >
            관리자
          </button>{" "}
          <button
            onClick={() => navigateTab("seller")}
            style={{
              ...button,
              background: activeTab === "seller" ? "#2F7AB8" : "#6B5B52",
              outline: activeTab === "seller" ? "2px solid #BEE2FF" : "none",
            }}
          >
            판매자
          </button>{" "}
          <button
            onClick={() => navigateTab("customer")}
            style={{
              ...button,
              background: activeTab === "customer" ? "#2D7B59" : "#6B5B52",
              outline: activeTab === "customer" ? "2px solid #BCE5D2" : "none",
            }}
          >
            고객센터
          </button>
          　👤 {currentUser.user_name}{" "}
          <button onClick={logout} style={{ ...button, background: "#A56A63" }}>
            로그아웃
          </button>
        </div>
      </header>
      <h1 style={{ fontSize: 22, fontWeight: "normal" }}>
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
          gridTemplateColumns: "repeat(3, minmax(180px,1fr))",
          gap: 15,
          margin: "25px 0",
        }}
      >
        {[
          [
            "운영 조직",
            `본사 ${orgs.filter((o) => o.org_type === "HQ").length}개, 지사 ${orgs.filter((o) => o.org_type === "BRANCH").length}개`,
          ],
          ["전체 회원", `${users.length}명`],
          ["등록 상품", `${products.length}개`],
          ["전체 주문", `${orders.length}건`],
          [
            "결제 완료",
            `${orders.filter((o) => o.payment_status === "결제완료").length}건`,
          ],
          [
            "안전재고 부족",
            `${products.filter((p) => p.stock <= p.safety_stock).length}건`,
          ],
        ].map(([a, b]) => (
          <div key={a} style={{ ...box, margin: 0 }}>
            <div style={{ color: "#7E7670", fontSize: 12 }}>{a}</div>
            <b style={{ fontSize: 20 }}>{b}</b>
          </div>
        ))}
      </section>
      {activeTab === "admin" && (
        <>
          <section style={box}>
            <h2>지사 추가 등록</h2>
            <form
              onSubmit={addOrg}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {[
                ["org_code", "조직 코드 (예: BR007)"],
                ["org_name", "조직명 (예: 인천지사)"],
                ["phone", "전화번호"],
                ["email", "이메일"],
              ].map(([n, p]) => (
                <input
                  key={n}
                  name={n}
                  value={form[n]}
                  onChange={(e) => setForm({ ...form, [n]: e.target.value })}
                  placeholder={p}
                  style={input}
                />
              ))}
              <input
                name="address1"
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                placeholder="주소 입력"
                style={input}
              />
              <button style={button}>등록하기</button>
            </form>
          </section>
          <section style={box}>
            <h2>조직 목록</h2>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  {["코드", "조직명", "유형", "연락처", "상태"].map((x) => (
                    <th key={x} style={th}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgs.map((o) => (
                  <tr key={o.org_id}>
                    <td style={td}>{o.org_code}</td>
                    <td style={td}>{o.org_name}</td>
                    <td style={td}>{o.org_type}</td>
                    <td style={td}>{o.phone}</td>
                    <td style={{ ...td, color: "#276749" }}>운영중</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section style={box}>
            <h2>회원 목록 및 권한</h2>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  {["아이디", "이름", "이메일", "권한", "프로필/주소"].map(
                    (x) => (
                      <th key={x} style={th}>
                        {x}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td style={td}>{u.login_id}</td>
                    <td style={td}>{u.user_name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>
                      {u.role}{" "}
                      <button
                        onClick={() => {
                          const r = prompt("변경할 권한을 입력하세요", u.role);
                          if (r)
                            setUsers(
                              users.map((x) =>
                                x.user_id === u.user_id ? { ...x, role: r } : x,
                              ),
                            );
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
                            title: "판매자 프로필",
                            body: "상호명: 베이스존 패션\n사업자번호: 222-11-11111",
                          })
                        }
                        style={button}
                      >
                        프로필
                      </button>{" "}
                      <button
                        onClick={() =>
                          setModal({
                            title: "배송지 주소",
                            body: "자택 · 서울특별시 강남구 테헤란로 123\n스튜디오 · 경기도 성남시 분당구 판교역로 456",
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
      {activeTab === "seller" && (
        <section style={box}>
          <h2>B 담당 의류 상품 및 재고 현황</h2>
          <table style={{ width: "100%" }}>
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
                  <th key={x} style={th}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.stock <= p.safety_stock;
                return (
                  <tr key={p.product_id}>
                    <td style={td}>{p.product_name}</td>
                    <td style={td}>{p.seller}</td>
                    <td style={td}>{p.price.toLocaleString()}원</td>
                    <td style={{ ...td, color: low ? "#A53730" : "inherit" }}>
                      {p.stock}개
                    </td>
                    <td style={td}>{p.safety_stock}개</td>
                    <td style={td}>{low ? "재고부족" : "판매중"}</td>
                    <td style={td}>
                      <button
                        onClick={() =>
                          setModal({
                            title: "상품 이미지 파일",
                            body: p.image_url,
                          })
                        }
                        style={button}
                      >
                        이미지
                      </button>{" "}
                      <button
                        onClick={() => {
                          const v = Number(prompt("변경할 재고 수량", p.stock));
                          if (Number.isFinite(v))
                            setProducts(
                              products.map((x) =>
                                x.product_id === p.product_id
                                  ? { ...x, stock: v }
                                  : x,
                              ),
                            );
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
      {activeTab === "customer" && (
        <>
          <section style={box}>
            <h2>C 담당 주문 및 결제 관리</h2>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  {[
                    "주문번호",
                    "구매자",
                    "상품명",
                    "결제금액",
                    "결제상태",
                    "주문상태",
                    "관리",
                  ].map((x) => (
                    <th key={x} style={th}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_id}>
                    <td style={td}>#{o.order_id}</td>
                    <td style={td}>{o.buyer}</td>
                    <td style={td}>{o.product_name}</td>
                    <td style={td}>{o.total_amount.toLocaleString()}원</td>
                    <td style={td}>{o.payment_status}</td>
                    <td style={td}>{o.order_status}</td>
                    <td style={td}>
                      <button
                        onClick={() =>
                          setModal({
                            title: `주문 상세 #${o.order_id}`,
                            body: `구매자: ${o.buyer}\n상품명: ${o.product_name}\n수량: ${o.qty}개\n금액: ${o.total_amount.toLocaleString()}원`,
                          })
                        }
                        style={button}
                      >
                        상세
                      </button>{" "}
                      <button
                        onClick={() => {
                          const s = prompt("주문 상태", o.order_status);
                          if (s)
                            setOrders(
                              orders.map((x) =>
                                x.order_id === o.order_id
                                  ? { ...x, order_status: s }
                                  : x,
                              ),
                            );
                        }}
                        style={button}
                      >
                        상태변경
                      </button>{" "}
                      {o.payment_status === "환불요청" && (
                        <button
                          onClick={() =>
                            setOrders(
                              orders.map((x) =>
                                x.order_id === o.order_id
                                  ? {
                                      ...x,
                                      payment_status: "환불완료",
                                      order_status: "환불종료",
                                    }
                                  : x,
                              ),
                            )
                          }
                          style={button}
                        >
                          환불승인
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    : inquiries.filter((item) => item.category === category)
                        .length;
                const isActive = inquiryCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setInquiryCategory(category);
                      setInquiryPage(1);
                    }}
                    style={{
                      padding: "10px 15px",
                      cursor: "pointer",
                      border: `1px solid ${isActive ? "#796252" : "#D8CFC5"}`,
                      background: isActive ? "#796252" : "#FAF9F6",
                      color: isActive ? "#fff" : "#3A3532",
                      fontWeight: "bold",
                    }}
                  >
                    {category} ({count})
                  </button>
                );
              })}
            </div>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  {["작성자", "분류", "제목", "상태", "작성일", "관리"].map(
                    (x) => (
                      <th key={x} style={th}>
                        {x}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedInquiries.map((i) => (
                    <tr key={i.inquiry_id}>
                      <td style={td}>{i.author}</td>
                      <td style={td}>{i.category}</td>
                      <td style={td}>
                        <button
                          onClick={() =>
                            setModal({
                              title: `[${i.category}] ${i.title}`,
                              body: `작성자: ${i.author}\n작성일: ${i.created_at}\n처리 상태: ${i.status}\n\n문의 내용\n${i.content}\n\n답변 내용\n${i.status === "답변완료" ? "문의하신 내용은 확인 후 안내드렸습니다." : "아직 답변을 준비하고 있습니다."}`,
                            })
                          }
                          style={{
                            background: "none",
                            border: 0,
                            padding: 0,
                            color: "#3A3532",
                            fontWeight: "bold",
                            textDecoration: "underline",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          {i.title}
                        </button>
                      </td>
                      <td style={td}>{i.status}</td>
                      <td style={td}>{i.created_at}</td>
                      <td style={td}>
                        <button
                          onClick={() => {
                            if (prompt("답변 내용을 입력하세요"))
                              setInquiries(
                                inquiries.map((x) =>
                                  x.inquiry_id === i.inquiry_id
                                    ? { ...x, status: "답변완료" }
                                    : x,
                                ),
                              );
                          }}
                          style={button}
                        >
                          답변
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

           {/* 1:1 문의 페이지 이동 버튼 */}
  {totalInquiryPages > 1 && (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: 20,
      }}
    >
      {/* 이전 버튼 */}
      <button
        type="button"
        disabled={inquiryPage === 1}
        onClick={() => setInquiryPage(inquiryPage - 1)}
        style={button}
      >
        이전
      </button>

      {/* 페이지 번호 */}
      {Array.from(
        { length: totalInquiryPages },
        (_, index) => index + 1
      ).map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => setInquiryPage(pageNumber)}
          style={{
            ...button,
            opacity: inquiryPage === pageNumber ? 1 : 0.65,
            fontWeight:
              inquiryPage === pageNumber ? "bold" : "normal",
          }}
        >
          {pageNumber}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        type="button"
        disabled={inquiryPage === totalInquiryPages}
        onClick={() => setInquiryPage(inquiryPage + 1)}
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
      {modal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ ...box, width: 350, whiteSpace: "pre-line" }}>
            <h3>{modal.title}</h3>
            <p>{modal.body}</p>
            <button onClick={() => setModal(null)} style={button}>
              닫기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function BranchAnalytics({
  orgs,
  products,
  currentUser,
  onLogout,
  onData,
  onNotices,
}) {
  const [selected, setSelected] = useState("HQ001");
  const [supportCategory, setSupportCategory] = useState(null);

  // 본사 문의 상세 화면도 브라우저 뒤로가기와 연결합니다.
  useEffect(() => {
    const handleSupportBack = (event) => {
      if (event.state?.baseseason && !event.state?.supportCategory) {
        setSupportCategory(null);
      }
    };

    window.addEventListener("popstate", handleSupportBack);
    return () => window.removeEventListener("popstate", handleSupportBack);
  }, []);

  function openSupportCategory(category) {
    setSupportCategory(category);
    window.history.pushState(
      {
        baseseason: true,
        page: "dashboard",
        activeTab: "admin",
        supportCategory: category,
      },
      "",
    );
  }
  const data = {
    HQ001: {
      today: 5820000,
      month: 82450000,
      rate: 76,
      best: "미니멀 싱글 코트",
      slow: "울 블렌드 코트",
      stock: "부산지사 블랙 코트",
    },
    BR003: {
      today: 1240000,
      month: 18670000,
      rate: 78,
      best: "미니멀 싱글 코트",
      slow: "클래식 더블 코트",
      stock: "없음",
    },
    BR005: {
      today: 1080000,
      month: 15420000,
      rate: 74,
      best: "울 블렌드 코트",
      slow: "더블 울 코트",
      stock: "더블 울 코트",
    },
    BR002: {
      today: 860000,
      month: 12100000,
      rate: 61,
      best: "클래식 더블 코트",
      slow: "더블 울 코트",
      stock: "더블 울 코트",
    },
    BR006: {
      today: 970000,
      month: 13690000,
      rate: 69,
      best: "울 블렌드 코트",
      slow: "싱글 코트",
      stock: "없음",
    },
    BR001: {
      today: 1100000,
      month: 16570000,
      rate: 73,
      best: "미니멀 싱글 코트",
      slow: "클래식 더블 코트",
      stock: "없음",
    },
  };
  const sel = orgs.find((o) => o.org_code === selected) || orgs[0],
    m = data[selected];
  const audience = {
    HQ001: {
      bestShare: 50,
      slowShare: 8,
      bestAge: "20대",
      bestAgeRate: 40,
      lowAge: "10대",
      lowAgeRate: 3,
    },
    BR003: {
      bestShare: 48,
      slowShare: 9,
      bestAge: "20대",
      bestAgeRate: 42,
      lowAge: "10대",
      lowAgeRate: 4,
    },
    BR005: {
      bestShare: 44,
      slowShare: 11,
      bestAge: "30대",
      bestAgeRate: 38,
      lowAge: "10대",
      lowAgeRate: 5,
    },
    BR002: {
      bestShare: 41,
      slowShare: 7,
      bestAge: "40대",
      bestAgeRate: 36,
      lowAge: "20대",
      lowAgeRate: 6,
    },
    BR006: {
      bestShare: 46,
      slowShare: 10,
      bestAge: "30대",
      bestAgeRate: 40,
      lowAge: "10대",
      lowAgeRate: 4,
    },
    BR001: {
      bestShare: 49,
      slowShare: 9,
      bestAge: "20대",
      bestAgeRate: 39,
      lowAge: "50대",
      lowAgeRate: 5,
    },
  };
  const a = audience[selected];
  const fmt = (n) => n.toLocaleString() + "원";
  const visitorMetrics = {
    HQ001: { today: 1284, online: 36, change: 12.4 },
    BR003: { today: 312, online: 11, change: 8.1 },
    BR005: { today: 286, online: 9, change: 5.6 },
    BR002: { today: 201, online: 7, change: -2.3 },
    BR006: { today: 228, online: 8, change: 3.4 },
    BR001: { today: 257, online: 10, change: 6.8 },
  };
  const visitors = visitorMetrics[selected];
  const daily = [
    52,
    68,
    43,
    76,
    61,
    88,
    Math.min(88, Math.round(m.today / 100000)),
  ];
  if (supportCategory) {
    return (
      <HeadquartersSupport
        category={supportCategory}
        currentUser={currentUser}
        onBack={() => window.history.back()}
        onLogout={onLogout}
      />
    );
  }
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EDE7DC",
        padding: 28,
        fontFamily: "Arial,sans-serif",
        color: "#1D1A18",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          background: "#796252",
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <b style={{ letterSpacing: 2 }}>BASESEASON · HQ ANALYTICS</b>
        <span>
          <button
            onClick={onNotices}
            style={{
              marginRight: 12,
              border: 0,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            공지사항 목록
          </button>
          <button
            onClick={onData}
            style={{
              marginRight: 12,
              border: 0,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            본사 데이터 관리
          </button>
          👤 {currentUser.user_name}{" "}
          <button
            onClick={onLogout}
            style={{
              marginLeft: 12,
              border: 0,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </span>
      </header>
      <RequestDiscountPanel products={products} />
      <aside
        style={{
          position: "fixed",
          top: 96,
          right: 24,
          width: 190,
          zIndex: 30,
          background: "#FAF9F6",
          border: "1px solid #CDBFAF",
          borderTop: "4px solid #796252",
          boxShadow: "0 8px 22px rgba(73,55,40,.14)",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            color: "#796252",
            fontSize: 10,
            fontWeight: "bold",
            letterSpacing: 1,
            margin: 0,
          }}
        >
          TODAY VISITORS
        </p>
        <b style={{ display: "block", fontSize: 16, margin: "7px 0 3px" }}>
          {sel.org_name.replace("BASESEASON ", "")}
        </b>
        <div
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#1D1A18",
            margin: "12px 0 4px",
          }}
        >
          {visitors.today.toLocaleString()}명
        </div>
        <div
          style={{
            fontSize: 11,
            color: visitors.change >= 0 ? "#35735B" : "#A24D32",
          }}
        >
          전일 대비 {visitors.change >= 0 ? "+" : ""}
          {visitors.change}%
        </div>
        <div
          style={{
            borderTop: "1px solid #E2DCD5",
            marginTop: 13,
            paddingTop: 11,
            fontSize: 12,
            color: "#6F6259",
          }}
        >
          현재 접속 <b style={{ color: "#796252" }}>{visitors.online}명</b>
        </div>
        <p
          style={{
            color: "#9A8B80",
            fontSize: 10,
            lineHeight: 1.45,
            margin: "12px 0 0",
          }}
        >
          오늘 00:00부터 현재까지의 데모 집계입니다.
        </p>
      </aside>
      <div style={{ maxWidth: 1400, margin: "22px auto" }}>
        <h1 style={{ fontSize: 24 }}>
          {sel.org_type === "HQ"
            ? "본사 통합 실시간 현황"
            : `${sel.org_name} 운영 현황`}
        </h1>
        <p style={{ color: "#6F6259", fontSize: 13 }}>
          조직 목록을 누르면 해당 지사의 판매 데이터와 상품 성과가 바로
          바뀝니다.
        </p>
        <section
          style={{ background: "#FAF9F6", padding: 18, margin: "18px 0" }}
        >
          <b>조직 목록</b>
          <div
            style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 12 }}
          >
            {orgs.map((o) => (
              <button
                key={o.org_id}
                onClick={() => setSelected(o.org_code)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  border: `1px solid ${selected === o.org_code ? "#796252" : "#CDBFAF"}`,
                  background: selected === o.org_code ? "#796252" : "#fff",
                  color: selected === o.org_code ? "#fff" : "#1D1A18",
                }}
              >
                <b>{o.org_name.replace("BASESEASON ", "")}</b>
                <br />
                <a
                  href={`tel:${o.phone}`}
                  style={{
                    fontSize: 11,
                    opacity: 0.9,
                    color: "inherit",
                    textDecoration: "underline",
                  }}
                >
                  {o.phone}
                </a>
              </button>
            ))}
          </div>
        </section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 14,
          }}
        >
          {[
            ["오늘 매출", fmt(m.today)],
            ["이달 매출", fmt(m.month)],
            ["판매율", m.rate + "%"],
            ["재고 확인", m.stock],
          ].map(([a, b]) => (
            <div
              key={a}
              style={{
                background: "#FAF9F6",
                padding: 20,
                borderTop: "4px solid #796252",
              }}
            >
              <div style={{ fontSize: 12, color: "#6F6259" }}>{a}</div>
              <b style={{ fontSize: 23 }}>{b}</b>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr .7fr",
            gap: 16,
            marginTop: 16,
          }}
        >
          <section style={{ background: "#FAF9F6", padding: 22 }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>최근 7일 매출 추이</h2>
            <div
              style={{
                height: 190,
                display: "flex",
                alignItems: "end",
                gap: 12,
                borderBottom: "1px solid #CDBFAF",
                padding: "0 8px",
              }}
            >
              {daily.map((v, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      height: v * 1.6,
                      background: "#796252",
                      minHeight: 12,
                    }}
                  />
                  <span style={{ fontSize: 10 }}>D{i + 1}</span>
                </div>
              ))}
            </div>
          </section>
          <section style={{ background: "#FAF9F6", padding: 22 }}>
            <h2 style={{ fontSize: 16, marginTop: 0 }}>상품 성과</h2>
            <div
              style={{
                borderLeft: "4px solid #796252",
                paddingLeft: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, color: "#6F6259" }}>
                판매 우수 · 전체 판매 비중 {a.bestShare}%
              </div>
              <b style={{ fontSize: 18 }}>{m.best}</b>
              <div style={{ fontSize: 12, marginTop: 5 }}>
                주 구매 연령: <b>{a.bestAge}</b> ({a.bestAgeRate}%)
              </div>
            </div>
            <div style={{ borderLeft: "4px solid #A68F79", paddingLeft: 12 }}>
              <div style={{ fontSize: 12, color: "#6F6259" }}>
                판매 부진 · 전체 판매 비중 {a.slowShare}%
              </div>
              <b style={{ fontSize: 18 }}>{m.slow}</b>
              <div style={{ fontSize: 12, marginTop: 5 }}>
                구매가 가장 적은 연령: <b>{a.lowAge}</b> ({a.lowAgeRate}%)
              </div>
            </div>
          </section>
        </div>
        <section style={{ background: "#FAF9F6", padding: 22, marginTop: 16 }}>
          <h2 style={{ fontSize: 16, marginTop: 0 }}>
            {sel.org_type === "HQ" ? "지사별 판매 비교" : "선택 지사 상품 상세"}
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "조직",
                  "오늘 매출",
                  "이달 매출",
                  "판매율",
                  "베스트 상품",
                  "부진 상품",
                ].map((x) => (
                  <th
                    key={x}
                    style={{
                      padding: 10,
                      textAlign: "left",
                      borderBottom: "1px solid #CDBFAF",
                    }}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sel.org_type === "HQ"
                ? orgs.filter((o) => o.org_type === "BRANCH")
                : [sel]
              ).map((o) => {
                const d = data[o.org_code];
                return (
                  <tr key={o.org_id}>
                    <td style={{ padding: 10 }}>{o.org_name}</td>
                    <td>{fmt(d.today)}</td>
                    <td>{fmt(d.month)}</td>
                    <td>{d.rate}%</td>
                    <td>{d.best}</td>
                    <td>{d.slow}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <section
          style={{
            background: "#FAF9F6",
            padding: 22,
            marginTop: 16,
            borderTop: "4px solid #796252",
          }}
        >
          <p
            style={{
              color: "#796252",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 1,
              margin: 0,
            }}
          >
            CUSTOMER SUPPORT
          </p>
          <h2 style={{ fontSize: 18, margin: "7px 0" }}>고객 문의 관리</h2>
          <p style={{ color: "#6F6259", fontSize: 13, margin: "0 0 16px" }}>
            카테고리를 선택하면 해당 유형의 문의 목록과 처리 현황을 확인할 수
            있습니다.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(130px, 1fr))",
              gap: 10,
            }}
          >
            {["상품 문의", "주문·결제", "배송", "교환/반품", "기타"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => openSupportCategory(category)}
                  style={{
                    background: "#fff",
                    border: "1px solid #CDBFAF",
                    padding: "16px 12px",
                    cursor: "pointer",
                    color: "#3A3532",
                    fontWeight: "bold",
                  }}
                >
                  {category}
                  <br />
                  <span
                    style={{
                      color: "#796252",
                      fontSize: 11,
                      fontWeight: "normal",
                    }}
                  >
                    문의 보기 →
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function HeadquartersSupport({ category, currentUser, onBack, onLogout }) {
  const inquiryData = {
    "상품 문의": [
      [
        "구매자A",
        "미니멀 싱글 코트 사이즈 문의",
        "M 사이즈의 어깨 단면을 알고 싶습니다.",
        "답변대기",
        "2026-09-16",
      ],
      [
        "구매자B",
        "블랙 코트 소재 문의",
        "울 함량과 세탁 방법을 알려주세요.",
        "답변완료",
        "2026-09-15",
      ],
    ],
    "주문·결제": [
      [
        "구매자C",
        "결제 완료 여부 확인",
        "주문번호 #103의 결제가 정상 처리됐나요?",
        "답변대기",
        "2026-09-16",
      ],
      [
        "구매자A",
        "현금영수증 발급 문의",
        "현금영수증 신청 방법을 알려주세요.",
        "답변완료",
        "2026-09-14",
      ],
    ],
    배송: [
      [
        "구매자A",
        "배송 시작일 문의",
        "어제 주문한 상품은 언제 출고되나요?",
        "답변대기",
        "2026-09-16",
      ],
      [
        "구매자B",
        "배송지 변경 문의",
        "출고 전 배송지를 변경하고 싶습니다.",
        "답변완료",
        "2026-09-15",
      ],
    ],
    "교환/반품": [
      [
        "구매자C",
        "사이즈 교환 요청",
        "L 사이즈로 교환 가능한지 확인 부탁드립니다.",
        "답변대기",
        "2026-09-16",
      ],
      [
        "구매자B",
        "반품 절차 문의",
        "반품 접수 후 환불 일정이 궁금합니다.",
        "답변완료",
        "2026-09-14",
      ],
    ],
    기타: [
      [
        "구매자A",
        "회원 정보 수정 문의",
        "휴대전화 번호를 변경하고 싶습니다.",
        "답변대기",
        "2026-09-16",
      ],
      [
        "구매자C",
        "이벤트 적용 문의",
        "신규 회원 쿠폰 적용 여부가 궁금합니다.",
        "답변완료",
        "2026-09-13",
      ],
    ],
  };
  const rows = inquiryData[category] || [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EDE7DC",
        padding: 28,
        fontFamily: "Arial,sans-serif",
        color: "#1D1A18",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          background: "#796252",
          color: "#fff",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <b style={{ letterSpacing: 2 }}>BASESEASON · HQ CUSTOMER SUPPORT</b>
        <span>
          👤 {currentUser.user_name}
          <button
            onClick={onLogout}
            style={{
              marginLeft: 12,
              border: 0,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            로그아웃
          </button>
        </span>
      </header>
      <div style={{ maxWidth: 1400, margin: "22px auto" }}>
        <button
          onClick={onBack}
          style={{
            background: "#fff",
            border: "1px solid #CDBFAF",
            padding: "9px 13px",
            cursor: "pointer",
            color: "#3A3532",
          }}
        >
          ← 본사 현황으로 돌아가기
        </button>
        <section
          style={{
            background: "#FAF9F6",
            padding: 24,
            marginTop: 16,
            borderTop: "4px solid #796252",
          }}
        >
          <p
            style={{
              color: "#796252",
              fontSize: 11,
              fontWeight: "bold",
              letterSpacing: 1,
              margin: 0,
            }}
          >
            INQUIRY CATEGORY
          </p>
          <h1 style={{ fontSize: 25, margin: "8px 0" }}>
            {category} 문의 관리
          </h1>
          <p style={{ color: "#6F6259", fontSize: 13, margin: 0 }}>
            총 {rows.length}건의 샘플 문의가 표시됩니다. 답변 버튼을 누르면 처리
            상태를 변경할 수 있습니다.
          </p>
        </section>
        <section style={{ background: "#FAF9F6", padding: 24, marginTop: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["작성자", "제목", "문의 내용", "상태", "접수일", "관리"].map(
                  (title) => (
                    <th
                      key={title}
                      style={{
                        padding: 12,
                        textAlign: "left",
                        borderBottom: "1px solid #CDBFAF",
                        fontSize: 12,
                      }}
                    >
                      {title}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(([author, title, content, status, date], index) => (
                <tr key={`${author}-${title}`}>
                  <td
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #E5DDD4",
                      fontSize: 13,
                    }}
                  >
                    {author}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #E5DDD4",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {title}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #E5DDD4",
                      fontSize: 13,
                    }}
                  >
                    {content}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #E5DDD4",
                      fontSize: 13,
                      color: status === "답변대기" ? "#A24D32" : "#35735B",
                    }}
                  >
                    {status}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      borderBottom: "1px solid #E5DDD4",
                      fontSize: 13,
                    }}
                  >
                    {date}
                  </td>
                  <td
                    style={{ padding: 12, borderBottom: "1px solid #E5DDD4" }}
                  >
                    <button
                      onClick={() =>
                        alert(`${index + 1}번 문의 답변 화면입니다.`)
                      }
                      style={{
                        background: "#796252",
                        color: "#fff",
                        border: 0,
                        padding: "7px 10px",
                        cursor: "pointer",
                      }}
                    >
                      답변
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
function RequestDiscountPanel({ products }) {
  const [tab, setTab] = useState("requests"),
    [requests, setRequests] = useState([
      {
        id: 1,
        branch: "부산지사",
        product: "미니멀 더블 울 코트_블랙",
        qty: 20,
        reason: "안전재고 부족",
        status: "요청대기",
      },
      {
        id: 2,
        branch: "대구지사",
        product: "울 블렌드 코트_차콜",
        qty: 10,
        reason: "행사 대비",
        status: "승인",
      },
    ]),
    [discounts, setDiscounts] = useState([]),
    [productId, setProductId] = useState(1),
    [rate, setRate] = useState(10);
  const update = (id, status) =>
    setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
  const p =
    products.find((x) => x.product_id === Number(productId)) || products[0];
  const addDiscount = () =>
    setDiscounts([
      ...discounts,
      {
        id: Date.now(),
        name: p.product_name,
        price: p.price,
        rate: Number(rate),
        active: true,
      },
    ]);
  return (
    <section
      style={{
        maxWidth: 1400,
        margin: "18px auto",
        background: "#FAF9F6",
        padding: 20,
        borderTop: "4px solid #796252",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setTab("requests")}
          style={{
            ...button,
            background: tab === "requests" ? "#796252" : "#A68F79",
          }}
        >
          지사 재고 요청 관리
        </button>
        <button
          onClick={() => setTab("discounts")}
          style={{
            ...button,
            background: tab === "discounts" ? "#796252" : "#A68F79",
          }}
        >
          할인율 직접 설정
        </button>
      </div>
      {tab === "requests" ? (
        <>
          <h2 style={{ fontSize: 17 }}>지사 재고 요청</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["요청 지사", "상품", "수량", "사유", "상태", "처리"].map(
                  (x) => (
                    <th
                      key={x}
                      style={{
                        padding: 9,
                        textAlign: "left",
                        borderBottom: "1px solid #CDBFAF",
                      }}
                    >
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 9 }}>{r.branch}</td>
                  <td>{r.product}</td>
                  <td>{r.qty}개</td>
                  <td>{r.reason}</td>
                  <td>
                    <b>{r.status}</b>
                  </td>
                  <td>
                    {r.status === "요청대기" && (
                      <>
                        <button
                          onClick={() => update(r.id, "승인")}
                          style={button}
                        >
                          승인
                        </button>{" "}
                        <button
                          onClick={() => update(r.id, "반려")}
                          style={button}
                        >
                          반려
                        </button>
                      </>
                    )}
                    {r.status === "승인" && (
                      <button
                        onClick={() => update(r.id, "출고완료")}
                        style={button}
                      >
                        출고완료
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: 17 }}>상품 할인 설정</h2>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "end",
              marginBottom: 18,
            }}
          >
            <label>
              상품
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                style={{ display: "block", padding: 8 }}
              >
                {products.map((x) => (
                  <option key={x.product_id} value={x.product_id}>
                    {x.product_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              할인율(%)
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                style={{ display: "block", padding: 8, width: 90 }}
              />
            </label>
            <div>
              할인 판매가
              <br />
              <b>
                {Math.round(
                  p.price * (1 - Number(rate) / 100),
                ).toLocaleString()}
                원
              </b>
            </div>
            <button onClick={addDiscount} style={button}>
              할인 적용
            </button>
          </div>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                {[
                  "상품",
                  "정상가",
                  "할인율",
                  "할인 판매가",
                  "상태",
                  "관리",
                ].map((x) => (
                  <th
                    key={x}
                    style={{
                      textAlign: "left",
                      padding: 9,
                      borderBottom: "1px solid #CDBFAF",
                    }}
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: 9 }}>{d.name}</td>
                  <td>{d.price.toLocaleString()}원</td>
                  <td>{d.rate}%</td>
                  <td>
                    {Math.round(d.price * (1 - d.rate / 100)).toLocaleString()}
                    원
                  </td>
                  <td>{d.active ? "진행중" : "중지"}</td>
                  <td>
                    <button
                      onClick={() =>
                        setDiscounts(
                          discounts.map((x) =>
                            x.id === d.id ? { ...x, active: !x.active } : x,
                          ),
                        )
                      }
                      style={button}
                    >
                      {d.active ? "중지" : "재개"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
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
}) {
  const p = "#796252",
    bg = "#EDE7DC",
    text = "#1D1A18";
  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        padding: "34px 30px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        color: text,
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.45fr .8fr",
          gap: 28,
        }}
      >
        <section
          style={{
            // 아래 사진을 넣을 수 있도록 왼쪽 흰색 영역만 아래로 늘립니다.
            minHeight: 1100,
            background: "#FAF9F6",
            padding: 34,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: `1px solid ${p}`,
              paddingBottom: 16,
            }}
          >
            <b style={{ letterSpacing: 2 }}>BASESEASON</b>
            <span style={{ fontSize: 11, color: p }}>COLLECTION CONTROL</span>
          </div>
          <p
            style={{
              color: p,
              fontSize: 11,
              fontWeight: "bold",
              marginTop: 30,
            }}
          >
            2026 FALL / WINTER
          </p>
          <h1 style={{ fontSize: 44, lineHeight: 1.15, margin: "10px 0 16px" }}>
            A BETTER
            <br />
            SEASON FOR WORK.
          </h1>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#6F6259" }}>
            본사와 지점의 상품, 재고, 주문 흐름을 한 곳에서 확인하고 관리합니다.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginTop: 34,
            }}
          >
            {[
              ["본사 운영", "admin01"],
              ["지점 업무", "seller01"],
              ["구매자", "buyer01"],
            ].map(([title, id]) => (
              <button
                key={id}
                onClick={() => onLogin(id)}
                style={{
                  padding: 18,
                  textAlign: "left",
                  background: bg,
                  border: `1px solid ${p}`,
                  color: text,
                  cursor: "pointer",
                }}
              >
                <b>{title}</b>
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: p,
                    marginTop: 8,
                  }}
                >
                  {id} 바로 로그인
                </span>
              </button>
            ))}
          </div>

          {/*
            사진의 가로·세로 비율을 그대로 유지합니다.
            objectFit: "contain"을 사용하므로 사진이 찌그러지거나 잘리지 않습니다.
          */}
          <div
            style={{
              marginTop: 46,
              paddingTop: 22,
              borderTop: `1px solid ${p}`,
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 11,
                fontWeight: "bold",
                letterSpacing: 1.2,
                color: p,
              }}
            >
              BASESEASON COLLECTION
            </p>
            <img
              src={mainPhoto}
              alt="BASESEASON 메인 컬렉션"
              style={{
                display: "block",
                width: "100%",
                height: 520,
                objectFit: "contain",
                margin: "0 auto",
              }}
            />
          </div>
        </section>
        <section
          style={{
            minHeight: 550,
            background: "#FAF9F6",
            padding: 34,
            boxSizing: "border-box",
            borderLeft: `4px solid ${p}`,
          }}
        >
          <p style={{ color: p, fontSize: 11, fontWeight: "bold" }}>
            ADMIN ACCESS
          </p>
          <h2 style={{ fontSize: 26 }}>본사 관리자 로그인</h2>
          <p style={{ fontSize: 12, color: "#6F6259", lineHeight: 1.7 }}>
            데모 계정이 입력되어 있습니다.
            <br />
            로그인 버튼을 누르면 바로 시작합니다.
          </p>
          {message && <Notice text={message} />}
          <form onSubmit={onSubmit}>
            <label>아이디</label>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              style={{ ...input, borderRadius: 0 }}
            />
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...input, borderRadius: 0 }}
            />
            <button
              style={{
                width: "100%",
                padding: 14,
                border: 0,
                background: p,
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
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
function Notice({ text }) {
  return (
    <div
      style={{
        background: "#E6F0EB",
        color: "#276749",
        padding: 10,
        borderRadius: 5,
        margin: "12px 0",
        fontSize: 12,
      }}
    >
      {text}
    </div>
  );
}

function ShoppingPolicy() {
  const policyItems = [
    {
      title: "교환·반품 신청",
      text: "상품을 받은 날부터 7일 이내에 주문 상세에서 신청해 주세요.",
    },
    {
      title: "교환·반품이 어려운 경우",
      text: "착용·세탁·수선·향수·오염 등으로 상품 가치가 훼손되면 처리가 어려울 수 있습니다.",
    },
    {
      title: "배송 안내",
      text: "결제 완료 상품은 영업일 기준으로 순차 출고되며, 연휴·천재지변에는 일정이 달라질 수 있습니다.",
    },
    {
      title: "환불 처리",
      text: "반품 상품 확인 후 환불이 진행되며, 결제수단에 따라 반영 시점이 달라질 수 있습니다.",
    },
  ];

  return (
    <section
      style={{
        ...box,
        background: "#FAF9F6",
        borderTop: "4px solid #796252",
      }}
    >
      <p
        style={{
          color: "#796252",
          fontSize: 11,
          fontWeight: "bold",
          letterSpacing: 1,
          margin: 0,
        }}
      >
        SHOPPING GUIDE
      </p>
      <h2 style={{ margin: "7px 0 8px" }}>인터넷 쇼핑몰 이용 안내</h2>
      <p
        style={{
          color: "#6F6259",
          fontSize: 12,
          margin: "0 0 18px",
          lineHeight: 1.6,
        }}
      >
        구매 전 상품 상세의 사이즈·소재·색상 정보를 확인해 주세요.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(230px, 1fr))",
          gap: 12,
        }}
      >
        {policyItems.map((item) => (
          <div
            key={item.title}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2DCD5",
              padding: "14px 16px",
            }}
          >
            <b style={{ color: "#3A3532", fontSize: 13 }}>{item.title}</b>
            <p
              style={{
                color: "#6F6259",
                fontSize: 12,
                lineHeight: 1.6,
                margin: "7px 0 0",
              }}
            >
              {item.text}
            </p>
          </div>
        ))}
      </div>
      <p
        style={{
          color: "#8A7B70",
          fontSize: 11,
          margin: "16px 0 0",
          lineHeight: 1.6,
        }}
      >
        ※ 실제 교환·반품 가능 여부와 배송 일정은 상품별 상세 안내 및 판매자
        정책에 따라 달라질 수 있습니다.
      </p>
    </section>
  );
}
const input = {
  padding: 10,
  border: "1px solid #DED8D2",
  borderRadius: 4,
  fontSize: 12,
  boxSizing: "border-box",
  width: "100%",
  margin: "6px 0 14px",
};

function HeadquartersData({ currentUser, onBack }) {
  const [selectedTable, setSelectedTable] = useState("org_units");
  const [search, setSearch] = useState("");
  const [isTableListOpen, setIsTableListOpen] = useState(false);
    // shopdb3jo의 실제 조직 데이터를 저장
  const [dbOrgUnits, setDbOrgUnits] = useState([]);

  // shopdb3jo의 실제 users 데이터를 저장
const [dbUsers, setDbUsers] = useState([]);

const [dbProducts, setDbProducts] = useState([]);
const [dbOrders, setDbOrders] = useState([]);
const [dbOrderItems, setDbOrderItems] = useState([]);
const [dbPayments, setDbPayments] = useState([]);
const [dbPaymentTransactions, setDbPaymentTransactions] = useState([]);
const [dbPaymentWebhookEvents, setDbPaymentWebhookEvents] = useState([]);
const [dbRefundPolicies, setDbRefundPolicies] = useState([]);
const [dbRefundRequests, setDbRefundRequests] = useState([]);
const [dbRefundItems, setDbRefundItems] = useState([]);
const [dbBuyerInquiries, setDbBuyerInquiries] = useState([]);
const [dbInquiryFiles, setDbInquiryFiles] = useState([]);
const [dbCompanyPolicies, setDbCompanyPolicies] = useState([]);
const [dbPolicyFiles, setDbPolicyFiles] = useState([]);
const [dbCategories, setDbCategories] = useState([]);
const [dbProductVariants, setDbProductVariants] = useState([]);
const [dbInventories, setDbInventories] = useState([]);
const [dbFileAssets, setDbFileAssets] = useState([]);
const [dbProductImages, setDbProductImages] = useState([]);
const [dbProductFiles, setDbProductFiles] = useState([]);
const [dbAiProviders, setDbAiProviders] = useState([]);
const [dbRagDocuments, setDbRagDocuments] = useState([]);
const [dbRagDocumentFiles, setDbRagDocumentFiles] = useState([]);
const [dbRagChunks, setDbRagChunks] = useState([]);
const [dbRagEmbeddings, setDbRagEmbeddings] = useState([]);
const [dbRagQueryLogs, setDbRagQueryLogs] = useState([]);
  // FastAPI를 통해 shopdb3jo의 org_units 데이터를 가져옴
  useEffect(() => {

  // shopdb3jo의 org_units 가져오기
  fetch("http://127.0.0.1:8000/api/org-units")
    .then((response) => response.json())
    .then((data) => {
      setDbOrgUnits(data);
    })
    .catch((error) => {
      console.error("org_units 연결 오류:", error);
    });

  // shopdb3jo의 users 가져오기
  fetch("http://127.0.0.1:8000/api/users")
    .then((response) => response.json())
    .then((data) => {
      setDbUsers(data);
    })
    .catch((error) => {
      console.error("users 연결 오류:", error);
    });

  // shopdb3jo의 products 가져오기
  fetch("http://127.0.0.1:8000/api/products")
    .then((response) => response.json())
    .then((data) => {
      setDbProducts(data);
    })
    .catch((error) => {
      console.error("products 연결 오류:", error);
    });
  // shopdb3jo의 orders 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/orders")
  .then((response) => response.json())
  .then((data) => {
    setDbOrders(data);
  })
  .catch((error) => {
    console.error("orders 연결 오류:", error);
  });
   // shopdb3jo의 order_items 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/order-items")
  .then((response) => response.json())
  .then((data) => {
    setDbOrderItems(data);
  })
  .catch((error) => {
    console.error("order_items 연결 오류:", error);
  });
  // shopdb3jo의 payments 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/payments")
  .then((response) => response.json())
  .then((data) => {
    setDbPayments(data);
  })
  .catch((error) => {
    console.error("payments 연결 오류:", error);
  });
  // shopdb3jo의 payment_transactions 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/payment-transactions")
  .then((response) => response.json())
  .then((data) => {
    setDbPaymentTransactions(data);
  })
  .catch((error) => {
    console.error("payment_transactions 연결 오류:", error);
  });
  // shopdb3jo의 payment_webhook_events 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/payment-webhook-events")
  .then((response) => response.json())
  .then((data) => {
    setDbPaymentWebhookEvents(data);
  })
  .catch((error) => {
    console.error("payment_webhook_events 연결 오류:", error);
  });
  // shopdb3jo의 refund_policies 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/refund-policies")
  .then((response) => response.json())
  .then((data) => {
    setDbRefundPolicies(data);
  })
  .catch((error) => {
    console.error("refund_policies 연결 오류:", error);
  });
  // shopdb3jo의 refund_requests 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/refund-requests")
  .then((response) => response.json())
  .then((data) => {
    setDbRefundRequests(data);
  })
  .catch((error) => {
    console.error("refund_requests 연결 오류:", error);
  });
  // shopdb3jo의 refund_items 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/refund-items")
  .then((response) => response.json())
  .then((data) => {
    setDbRefundItems(data);
  })
  .catch((error) => {
    console.error("refund_items 연결 오류:", error);
  });
  // shopdb3jo의 buyer_inquiries 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/buyer-inquiries")
  .then((response) => response.json())
  .then((data) => {
    setDbBuyerInquiries(data);
  })
  .catch((error) => {
    console.error("buyer_inquiries 연결 오류:", error);
  });
  // shopdb3jo의 inquiry_files 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/inquiry-files")
  .then((response) => response.json())
  .then((data) => {
    setDbInquiryFiles(data);
  })
  .catch((error) => {
    console.error("inquiry_files 연결 오류:", error);
  });
  // shopdb3jo의 company_policies 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/company-policies")
  .then((response) => response.json())
  .then((data) => {
    setDbCompanyPolicies(data);
  })
  .catch((error) => {
    console.error("company_policies 연결 오류:", error);
  });
  // shopdb3jo의 policy_files 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/policy-files")
  .then((response) => response.json())
  .then((data) => {
    setDbPolicyFiles(data);
  })
  .catch((error) => {
    console.error("policy_files 연결 오류:", error);
  });
  // shopdb3jo의 categories 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/categories")
  .then((response) => response.json())
  .then((data) => {
    setDbCategories(data);
  })
  .catch((error) => {
    console.error("categories 연결 오류:", error);
  });
  // shopdb3jo의 product_variants 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/product-variants")
  .then((response) => response.json())
  .then((data) => {
    setDbProductVariants(data);
  })
  .catch((error) => {
    console.error("product_variants 연결 오류:", error);
  });
  // shopdb3jo의 inventories 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/inventories")
  .then((response) => response.json())
  .then((data) => {
    setDbInventories(data);
  })
  .catch((error) => {
    console.error("inventories 연결 오류:", error);
  });
  // shopdb3jo의 file_assets 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/file-assets")
  .then((response) => response.json())
  .then((data) => {
    setDbFileAssets(data);
  })
  .catch((error) => {
    console.error("file_assets 연결 오류:", error);
  });
  // shopdb3jo의 product_images 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/product-images")
  .then((response) => response.json())
  .then((data) => {
    setDbProductImages(data);
  })
  .catch((error) => {
    console.error("product_images 연결 오류:", error);
  });
  // shopdb3jo의 product_files 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/product-files")
  .then((response) => response.json())
  .then((data) => {
    setDbProductFiles(data);
  })
  .catch((error) => {
    console.error("product_files 연결 오류:", error);
  });
  // shopdb3jo의 ai_providers 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/ai-providers")
  .then((response) => response.json())
  .then((data) => {
    setDbAiProviders(data);
  })
  .catch((error) => {
    console.error("ai_providers 연결 오류:", error);
  });
  // shopdb3jo의 rag_documents 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/rag-documents")
  .then((response) => response.json())
  .then((data) => {
    setDbRagDocuments(data);
  })
  .catch((error) => {
    console.error("rag_documents 연결 오류:", error);
  });
  // shopdb3jo의 rag_document_files 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/rag-document-files")
  .then((response) => response.json())
  .then((data) => {
    setDbRagDocumentFiles(data);
  })
  .catch((error) => {
    console.error("rag_document_files 연결 오류:", error);
  });
  // shopdb3jo의 rag_chunks 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/rag-chunks")
  .then((response) => response.json())
  .then((data) => {
    setDbRagChunks(data);
  })
  .catch((error) => {
    console.error("rag_chunks 연결 오류:", error);
  });
  // shopdb3jo의 rag_embeddings 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/rag-embeddings")
  .then((response) => response.json())
  .then((data) => {
    setDbRagEmbeddings(data);
  })
  .catch((error) => {
    console.error("rag_embeddings 연결 오류:", error);
  });
  // shopdb3jo의 rag_query_logs 실제 데이터 가져오기
fetch("http://127.0.0.1:8000/api/rag-query-logs")
  .then((response) => response.json())
  .then((data) => {
    setDbRagQueryLogs(data);
  })
  .catch((error) => {
    console.error("rag_query_logs 연결 오류:", error);
  });
  }, []);
  const coreTables = [
       {
      id: "org_units",
      label: "org_units",
      count: dbOrgUnits.length,
      columns: ["org_id", "org_code", "org_name", "org_type", "phone"],
      rows: dbOrgUnits.map((org) => [
        org.org_id,
        org.org_code,
        org.org_name,
        org.org_type,
        org.phone,
      ]),
    },
        {
      id: "users",
      label: "users",
      count: dbUsers.length,
      columns: ["user_id", "login_id", "user_name", "email", "status"],
      rows: dbUsers.map((user) => [
        user.user_id,
        user.login_id,
        user.user_name,
        user.email,
        user.user_status,
      ]),
    },
    {
      id: "roles",
      label: "roles",
      count: 3,
      columns: ["role_id", "role_name", "description"],
      rows: [
        [1, "관리자", "본사 통합 운영 권한"],
        [2, "판매자", "상품·재고 관리 권한"],
        [3, "구매자", "주문 조회 권한"],
      ],
    },
    {
      id: "user_roles",
      label: "user_roles",
      count: 3,
      columns: ["user_role_id", "user_id", "role_id", "assigned_at"],
      rows: [
        [1, 1, 1, "2026-09-15"],
        [2, 2, 2, "2026-09-15"],
        [3, 3, 2, "2026-09-15"],
      ],
    },
    {
  id: "products",
  label: "products",
  count: dbProducts.length,
  columns: ["product_id", "product_name", "price", "status"],
  rows: dbProducts.map((product) => [
    product.product_id,
    product.product_name,
    product.price,
    product.status,
  ]),
},

{
  id: "orders",
  label: "orders",
  count: dbOrders.length,
  columns: ["order_id", "order_no", "total_amount", "order_status", "process_status"],
  rows: dbOrders.map((order) => [
    order.order_id,
    order.order_no,
    order.total_amount,
    order.order_status,
    order.process_status,
  ]),
},
{
  id: "order_items",
  label: "order_items",
  count: dbOrderItems.length,
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
  rows: dbOrderItems.map((item) => [
    item.order_item_id,
    item.order_id,
    item.product_id,
    item.product_name_snapshot,
    item.quantity,
    item.unit_price,
    item.item_amount,
    item.item_status,
  ]),
},
{
  id: "payments",
  label: "payments",
  count: dbPayments.length,
  columns: [
    "payment_id",
    "order_id",
    "payment_method",
    "payment_status",
    "requested_amount",
    "approved_amount",
  ],
  rows: dbPayments.map((payment) => [
    payment.payment_id,
    payment.order_id,
    payment.payment_method,
    payment.payment_status,
    payment.requested_amount,
    payment.approved_amount,
  ]),
},
{
  id: "payment_transactions",
  label: "payment_transactions",
  count: dbPaymentTransactions.length,
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
  rows: dbPaymentTransactions.map((transaction) => [
    transaction.transaction_id,
    transaction.payment_id,
    transaction.transaction_key,
    transaction.transaction_type,
    transaction.transaction_status,
    transaction.transaction_amount,
    transaction.pg_transaction_id,
    transaction.created_at,
  ]),
},
{
  id: "payment_webhook_events",
  label: "payment_webhook_events",
  count: dbPaymentWebhookEvents.length,
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
  rows: dbPaymentWebhookEvents.map((webhook) => [
    webhook.webhook_id,
    webhook.payment_id,
    webhook.pg_provider,
    webhook.event_type,
    webhook.event_id,
    webhook.processed_yn,
    webhook.received_at,
    webhook.processed_at,
  ]),
},
{
  id: "refund_policies",
  label: "refund_policies",
  count: dbRefundPolicies.length,
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
  rows: dbRefundPolicies.map((policy) => [
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
  ]),
},
{
  id: "refund_requests",
  label: "refund_requests",
  count: dbRefundRequests.length,
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
  rows: dbRefundRequests.map((refund) => [
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
  ]),
},
{
  id: "refund_items",
  label: "refund_items",
  count: dbRefundItems.length,
  columns: [
    "refund_item_id",
    "org_id",
    "refund_request_id",
    "order_item_id",
    "refund_quantity",
    "refund_amount",
  ],
  rows: dbRefundItems.map((item) => [
    item.refund_item_id,
    item.org_id,
    item.refund_request_id,
    item.order_item_id,
    item.refund_quantity,
    item.refund_amount,
  ]),
},
{
  id: "buyer_inquiries",
  label: "buyer_inquiries",
  count: dbBuyerInquiries.length,
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
  rows: dbBuyerInquiries.map((inquiry) => [
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
  ]),
},
{
  id: "inquiry_files",
  label: "inquiry_files",
  count: dbInquiryFiles.length,
  columns: [
    "inquiry_file_id",
    "org_id",
    "inquiry_id",
    "file_id",
    "created_at",
  ],
  rows: dbInquiryFiles.map((file) => [
    file.inquiry_file_id,
    file.org_id,
    file.inquiry_id,
    file.file_id,
    file.created_at,
  ]),
},
{
  id: "company_policies",
  label: "company_policies",
  count: dbCompanyPolicies.length,
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
  rows: dbCompanyPolicies.map((policy) => [
    policy.policy_id,
    policy.org_id,
    policy.org_name,
    policy.policy_code,
    policy.policy_name,
    policy.policy_version,
    policy.policy_content,
    policy.effective_from,
    policy.active_yn,
  ]),
},
{
  id: "policy_files",
  label: "policy_files",
  count: dbPolicyFiles.length,
  columns: [
    "policy_file_id",
    "org_id",
    "policy_id",
    "file_id",
    "display_order",
  ],
  rows: dbPolicyFiles.map((file) => [
    file.policy_file_id,
    file.org_id,
    file.policy_id,
    file.file_id,
    file.display_order,
  ]),
},
{
  id: "categories",
  label: "categories",
  count: dbCategories.length,
  columns: [
    "category_id",
    "parent_category_id",
    "category_name",
    "category_level",
    "display_order",
    "active_yn",
  ],
  rows: dbCategories.map((category) => [
    category.category_id,
    category.parent_category_id,
    category.category_name,
    category.category_level,
    category.display_order,
    category.active_yn,
  ]),
},
{
  id: "product_variants",
  label: "product_variants",
  count: dbProductVariants.length,
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
  rows: dbProductVariants.map((variant) => [
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
  ]),
},
{
  id: "inventories",
  label: "inventories",
  count: dbInventories.length,
  columns: [
    "inventory_id",
    "org_id",
    "variant_id",
    "stock_quantity",
    "reserved_quantity",
    "safety_stock",
    "updated_at",
  ],
  rows: dbInventories.map((inventory) => [
    inventory.inventory_id,
    inventory.org_id,
    inventory.variant_id,
    inventory.stock_quantity,
    inventory.reserved_quantity,
    inventory.safety_stock,
    inventory.updated_at,
  ]),
},
{
  id: "file_assets",
  label: "file_assets",
  count: dbFileAssets.length,
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
  rows: dbFileAssets.map((file) => [
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
  ]),
},
{
  id: "product_images",
  label: "product_images",
  count: dbProductImages.length,
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
  rows: dbProductImages.map((image) => [
    image.product_image_id,
    image.org_id,
    image.product_id,
    image.file_id,
    image.image_type,
    image.alt_text,
    image.display_order,
    image.active_yn,
    image.created_at,
  ]),
},
{
  id: "product_files",
  label: "product_files",
  count: dbProductFiles.length,
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
  rows: dbProductFiles.map((file) => [
    file.product_file_id,
    file.org_id,
    file.product_id,
    file.file_id,
    file.file_category,
    file.file_description,
    file.display_order,
    file.created_at,
  ]),
},
{
  id: "ai_providers",
  label: "ai_providers",
  count: dbAiProviders.length,
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
  rows: dbAiProviders.map((provider) => [
    provider.provider_id,
    provider.provider_code,
    provider.provider_name,
    provider.provider_type,
    provider.base_url,
    provider.chat_model,
    provider.embedding_model,
    provider.active_yn,
    provider.created_at,
  ]),
},
{
  id: "rag_documents",
  label: "rag_documents",
  count: dbRagDocuments.length,
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
  rows: dbRagDocuments.map((document) => [
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
  ]),
},
{
  id: "rag_document_files",
  label: "rag_document_files",
  count: dbRagDocumentFiles.length,
  columns: [
    "rag_document_file_id",
    "org_id",
    "document_id",
    "file_id",
  ],
  rows: dbRagDocumentFiles.map((file) => [
    file.rag_document_file_id,
    file.org_id,
    file.document_id,
    file.file_id,
  ]),
},
{
  id: "rag_chunks",
  label: "rag_chunks",
  count: dbRagChunks.length,
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
  rows: dbRagChunks.map((chunk) => [
    chunk.chunk_id,
    chunk.org_id,
    chunk.document_id,
    chunk.chunk_no,
    chunk.chunk_text,
    chunk.token_count,
    chunk.metadata_json,
    chunk.created_at,
  ]),
},
{
  id: "rag_embeddings",
  label: "rag_embeddings",
  count: dbRagEmbeddings.length,
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
  rows: dbRagEmbeddings.map((embedding) => [
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
  ]),
},
{
  id: "rag_query_logs",
  label: "rag_query_logs",
  count: dbRagQueryLogs.length,
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
  rows: dbRagQueryLogs.map((log) => [
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
  ]),
},
];
  const extraTableNames = [
  ];
  const tables = [
    ...coreTables,
    ...extraTableNames.map(([id, count]) => ({
      id,
      label: id,
      count,
      columns: ["id", "record_name", "status", "created_at"],
      rows: [
        [1, `${id} 기본 데이터`, "ACTIVE", "2026-09-15"],
        [2, `${id} 샘플 데이터`, "ACTIVE", "2026-09-14"],
      ],
    })),
  ];
  const table = tables.find((item) => item.id === selectedTable) || tables[0];
  const rows = table.rows.filter((row) =>
    row.join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#F7EBDD,#EEF5F3)",
        padding: 30,
        fontFamily: "Arial, sans-serif",
        color: "#283444",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          maxWidth: 1400,
          margin: "0 auto 18px",
          background: "rgba(255,255,255,.85)",
          padding: "18px 24px",
          borderRadius: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 5px 18px rgba(70,55,40,.08)",
        }}
      >
        <div>
          <b style={{ letterSpacing: 2, color: "#A74D20" }}>BASESEASON</b>
          <span style={{ marginLeft: 12, fontSize: 12, color: "#758092" }}>
            본사 관리자 전용
          </span>
        </div>
        <div>
          👤 <b>{currentUser.user_name}</b>{" "}
          <button
            onClick={onBack}
            style={{ ...button, marginLeft: 14, background: "#C45F20" }}
          >
            운영 콘솔로 돌아가기
          </button>
        </div>
      </header>
      <div style={{ maxWidth: 1400, margin: "auto" }}>
        <section
          style={{
            background: "linear-gradient(110deg,#fff,#F2F6FF)",
            border: "1px solid #D3DEF6",
            borderRadius: 18,
            padding: "24px 28px",
            marginBottom: 18,
          }}
        >
          <p
            style={{
              color: "#16837D",
              fontWeight: "bold",
              fontSize: 11,
              letterSpacing: 1,
            }}
          >
            본사 · 데이터 운영
          </p>
          <h1 style={{ fontSize: 24, margin: "6px 0" }}>
            본사 원본 데이터 관리
          </h1>
          <p style={{ fontSize: 13, color: "#526176", margin: 0 }}>
            테이블을 선택하고 데이터를 검색·확인하는 본사 관리자 전용
            화면입니다.
          </p>
        </section>
        <div
          style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 18 }}
        >
          <aside
            style={{
              background: "rgba(255,255,255,.92)",
              borderRadius: 16,
              padding: 18,
              boxShadow: "0 5px 18px rgba(70,55,40,.08)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#16837D",
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              DATA CATALOG
            </div>
            <h2 style={{ fontSize: 18, margin: "6px 0 12px" }}>
              테이블 탐색기{" "}
              <span style={{ float: "right", color: "#5C51A4" }}>
                {tables.length}개
              </span>
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#667085",
                lineHeight: 1.6,
                margin: "0 0 12px",
              }}
            >
              현재 선택: <b style={{ color: "#173B5F" }}>{table.label}</b>
            </p>
            <button
              onClick={() => setIsTableListOpen((open) => !open)}
              style={{
                width: "100%",
                padding: "11px 12px",
                cursor: "pointer",
                textAlign: "left",
                background: isTableListOpen ? "#173B5F" : "#F4F7FB",
                color: isTableListOpen ? "#fff" : "#173B5F",
                border: "1px solid #B8C8DA",
                borderRadius: 8,
                fontWeight: "bold",
              }}
            >
              {isTableListOpen ? "⌃ 테이블 목록 닫기" : "⌄ 테이블 목록 펼치기"}
            </button>
            {isTableListOpen && (
              <div style={{ marginTop: 12 }}>
                <input
                  placeholder="테이블 이름 검색"
                  value={search}
                  style={{ ...input, margin: "0 0 12px" }}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div
                  style={{
                    maxHeight: 460,
                    overflowY: "auto",
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 8,
                  }}
                >
                  {tables
                    .filter((item) =>
                      item.label.toLowerCase().includes(search.toLowerCase()),
                    )
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSelectedTable(item.id);
                          setSearch("");
                          setIsTableListOpen(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          background:
                            item.id === selectedTable ? "#173B5F" : "#F8FAFC",
                          border:
                            item.id === selectedTable
                              ? "1px solid #173B5F"
                              : "1px solid #D8E0E8",
                          borderRadius: 9,
                          padding: 10,
                          cursor: "pointer",
                          color: item.id === selectedTable ? "#fff" : "#334155",
                        }}
                      >
                        <b style={{ fontSize: 12 }}>{item.label}</b>
                        <span
                          style={{
                            float: "right",
                            fontSize: 11,
                            opacity: 0.85,
                          }}
                        >
                          {item.count} records
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </aside>
          <section
            style={{
              background: "rgba(255,255,255,.96)",
              borderRadius: 16,
              padding: 24,
              overflow: "auto",
              boxShadow: "0 5px 18px rgba(70,55,40,.08)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#16837D",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              테이블 작업 영역
            </p>
            <h2 style={{ margin: "7px 0", fontSize: 21 }}>{table.label}</h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>
              기본키: {table.columns[0]} · 현재 {rows.length}개 결과
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
              <select
                style={{
                  padding: 10,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                }}
              >
                <option>전체 컬럼</option>
              </select>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="선택한 테이블 검색"
                style={{ ...input, margin: 0, flex: 1 }}
              />
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 650,
              }}
            >
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th
                      key={column}
                      style={{
                        padding: 12,
                        textAlign: "left",
                        background: "#F4F7FB",
                        borderBottom: "1px solid #DCE4EE",
                        fontSize: 12,
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          padding: 13,
                          borderBottom: "1px solid #E7ECF2",
                          fontSize: 13,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </main>
  );
}
