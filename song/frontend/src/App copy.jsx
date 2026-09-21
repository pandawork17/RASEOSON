import React, { useState } from "react";
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

  // ==========================================
  // 💡 1:1 문의 페이지 번호
  // ==========================================
  const [inquiryPage, setInquiryPage] = useState(1);
  const INQUIRIES_PER_PAGE = 10;

  const [orgs, setOrgs] = useState([
    {
      org_id: 1,
      org_code: "HQ001",
      org_name: "BASESEASON 본사",
      org_type: "HQ",
      phone: "010-2776-0401",
    },
    {
      org_id: 4,
      org_code: "BR003",
      org_name: "BASESEASON 서울지사",
      org_type: "BRANCH",
      phone: "010-9813-0820",
    },
    {
      org_id: 5,
      org_code: "BR005",
      org_name: "BASESEASON 대구지사",
      org_type: "BRANCH",
      phone: "010-8868-4457",
    },
    {
      org_id: 3,
      org_code: "BR002",
      org_name: "BASESEASON 부산지사",
      org_type: "BRANCH",
      phone: "051-111-1111",
    },
    {
      org_id: 6,
      org_code: "BR006",
      org_name: "BASESEASON 광주지사",
      org_type: "BRANCH",
      phone: "062-777-7777",
    },
    {
      org_id: 2,
      org_code: "BR001",
      org_name: "BASESEASON 전주지사",
      org_type: "BRANCH",
      phone: "063-111-1111",
    },
  ]);
  const [users, setUsers] = useState([
    {
      user_id: 1,
      login_id: "admin01",
      user_name: "쇼핑플컨리지",
      email: "admin@baseseason.co.kr",
      role: "관리자",
    },
    {
      user_id: 2,
      login_id: "seller01",
      user_name: "전자판매자",
      email: "seller01@baseseason.co.kr",
      role: "판매자",
    },
    {
      user_id: 3,
      login_id: "seller02",
      user_name: "패션판매자",
      email: "seller02@baseseason.co.kr",
      role: "판매자",
    },
  ]);
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
    setIsLoggedIn(true);
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
        onBack={() => setPage("dashboard")}
      />
    );

  if (page === "notices")
    return (
      <NoticeList
        currentUser={currentUser}
        onBack={() => setPage("dashboard")}
      />
    );
  if (activeTab === "admin")
    return (
      <BranchAnalytics
  orgs={orgs}
  products={products}
  currentUser={currentUser}
  onLogout={logout}
  onData={() => setPage("hqData")}
  onNotices={() => setPage("notices")}
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
              onClick={() => setPage("hqData")}
              style={{ ...button, background: "#C86B2B" }}
            >
              본사 데이터 관리
            </button>
          )}{" "}
          <button
            onClick={() => setActiveTab("admin")}
            style={{
              ...button,
              background: activeTab === "admin" ? "#A56A63" : "#6B5B52",
              outline: activeTab === "admin" ? "2px solid #F3C49D" : "none",
            }}
          >
            관리자
          </button>{" "}
          <button
            onClick={() => setActiveTab("seller")}
            style={{
              ...button,
              background: activeTab === "seller" ? "#2F7AB8" : "#6B5B52",
              outline: activeTab === "seller" ? "2px solid #BEE2FF" : "none",
            }}
          >
            판매자
          </button>{" "}
          <button
            onClick={() => setActiveTab("customer")}
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
        onBack={() => setSupportCategory(null)}
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
                  onClick={() => setSupportCategory(category)}
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
  const coreTables = [
    {
      id: "org_units",
      label: "org_units",
      count: 6,
      columns: ["org_id", "org_code", "org_name", "org_type", "phone"],
      rows: [
        [1, "HQ001", "BASESEASON 본사", "HQ", "010-2776-0401"],
        [4, "BR003", "BASESEASON 서울지사", "BRANCH", "010-9813-0820"],
        [5, "BR005", "BASESEASON 대구지사", "BRANCH", "010-8868-4457"],
        [3, "BR002", "BASESEASON 부산지사", "BRANCH", "051-111-1111"],
        [6, "BR006", "BASESEASON 광주지사", "BRANCH", "062-777-7777"],
        [2, "BR001", "BASESEASON 전주지사", "BRANCH", "063-111-1111"],
      ],
    },
    {
      id: "users",
      label: "users",
      count: 3,
      columns: ["user_id", "login_id", "user_name", "email", "status"],
      rows: [
        [1, "admin01", "쇼핑플컨리지", "admin@baseseason.co.kr", "ACTIVE"],
        [2, "seller01", "전자판매자", "seller01@baseseason.co.kr", "ACTIVE"],
        [3, "seller02", "패션판매자", "seller02@baseseason.co.kr", "ACTIVE"],
      ],
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
      id: "seller_profiles",
      label: "seller_profiles",
      count: 2,
      columns: ["seller_id", "user_id", "company_name", "business_number"],
      rows: [
        [1, 2, "베이스존 패션", "222-11-11111"],
        [2, 3, "스타일브랜드", "333-22-22222"],
      ],
    },
    {
      id: "products",
      label: "products",
      count: 4,
      columns: ["product_id", "product_name", "price", "status"],
      rows: [
        [1, "미니멀 싱글 코트_브라운", "159000", "판매중"],
        [2, "미니멀 더블 울 코트_블랙", "179000", "판매중"],
        [3, "울 블렌드 코트_차콜", "169000", "판매중"],
        [4, "클래식 더블 코트_아이보리", "169000", "판매중"],
      ],
    },
    {
      id: "orders",
      label: "orders",
      count: 3,
      columns: ["order_id", "buyer", "total_amount", "order_status"],
      rows: [
        [101, "구매자A", "159000", "배송준비중"],
        [102, "구매자B", "179000", "배송중"],
        [103, "구매자C", "169000", "환불진행중"],
      ],
    },
  ];
  const extraTableNames = [
    ["categories", 6],
    ["product_variants", 9],
    ["inventories", 9],
    ["file_assets", 7],
    ["product_images", 6],
    ["product_files", 3],
    ["ai_providers", 2],
    ["rag_documents", 4],
    ["rag_document_files", 5],
    ["rag_chunks", 12],
    ["rag_embeddings", 12],
    ["rag_query_logs", 8],
    ["order_items", 13],
    ["payments", 13],
    ["payment_transactions", 3],
    ["payment_webhook_events", 4],
    ["refund_policies", 2],
    ["refund_requests", 3],
    ["refund_items", 3],
    ["buyer_inquiries", 5],
    ["inquiry_files", 2],
    ["company_policies", 4],
    ["policy_files", 5],
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
