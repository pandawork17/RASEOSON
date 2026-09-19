import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import "./figma.css";
import { api, ApiError, getToken, setToken } from "./api";
import { MemberInfoPage } from "./pages/MemberInfoPage";
import { AddressPage } from "./pages/AddressPage";
import { RefundApplyPage } from "./pages/RefundApplyPage";
import { RefundDetailPage } from "./pages/RefundDetailPage";
import { RefundHistoryPage } from "./pages/RefundHistoryPage";
import { CancelExchangeReturnPage } from "./pages/CancelExchangeReturnPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { QnAListPage } from "./pages/QnAListPage";
import { QnAWritePage } from "./pages/QnAWritePage";
import { QnADetailPage } from "./pages/QnADetailPage";
import { MyQnAPage } from "./pages/MyQnAPage";
import { NoticeListPage } from "./pages/NoticeListPage";
import { NoticeDetailPage } from "./pages/NoticeDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

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
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundTargetOrder, setRefundTargetOrder] = useState(null);
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [editingQnA, setEditingQnA] = useState(null);
  const [qnaList, setQnaList] = useState([
    {
      id: 12,
      title: "사이즈 문의드립니다.",
      category: "상품 문의",
      date: "2025. 06. 11",
      status: "COMPLETED",
      author: "김*늘",
      content: "평소 240 신는데 발볼이 좀 넓은 편입니다. 정사이즈로 가면 될까요? 아니면 한 치수 크게 주문해야 편할까요?",
      answer: "안녕하세요 고객님, 베이스시즌 고객센터입니다.\n해당 제품은 기본 정사이즈보다 발볼이 다소 타이트하게 제작되었습니다. 발볼이 넓으신 경우 한 치수(5mm) 크게 주문하시는 것을 추천해 드립니다. 추가 문의사항이 있으시면 언제든지 편하게 문의 남겨주세요.",
      answerDate: "2025. 06. 12",
    },
    {
      id: 11,
      title: "결제 취소 가능한가요?",
      category: "주문/결제",
      date: "2025. 06. 10",
      status: "WAITING",
      author: "이*원",
      content: "방금 전에 주문을 완료했는데 결제 수단을 변경하고 싶어서 취소하려고 합니다. 배송 준비 전이면 바로 취소 가능한가요?",
    },
    {
      id: 10,
      title: "교환 신청은 어떻게 하나요?",
      category: "교환/반품",
      date: "2025. 06. 08",
      status: "COMPLETED",
      author: "박*호",
      content: "어제 택배 수령했는데 색상이 생각했던 것과 조금 달라서 다른 색상으로 교환하고 싶습니다. 어떻게 접수하면 되나요?",
      answer: "안녕하세요 고객님, 베이스시즌입니다.\n마이페이지 > 주문내역에서 수령하신 주문건의 [상세보기]를 클릭하신 후 [환불/교환 신청하기]를 통해 신청해 주시면 택배 기사님 방문 수거가 접수됩니다. 상품이 입고되는 대로 확인 후 새 제품으로 발송해 드리겠습니다.",
      answerDate: "2025. 06. 08",
    },
    {
      id: 9,
      title: "배송 언제 되나요?",
      category: "배송",
      date: "2025. 06. 07",
      status: "COMPLETED",
      author: "최*진",
      content: "주문한 지 이틀 정도 되었는데 배송 출발 언제쯤 되는지 배송 일정 문의드립니다.",
      answer: "안녕하세요 고객님, 베이스시즌입니다.\n주문하신 상품은 금일 오후 대한통운 택배를 통해 출고 완료되었습니다. 마이페이지 배송조회에서 송장번호 확인이 가능합니다.",
      answerDate: "2025. 06. 07",
    },
    {
      id: 8,
      title: "재입고 일정이 궁금합니다.",
      category: "상품 문의",
      date: "2025. 06. 05",
      status: "COMPLETED",
      author: "정*우",
      content: "블랙 색상 L 사이즈 품절이던데 혹시 이번 달 안에 재입고 예정이 있을까요?",
      answer: "안녕하세요 고객님, 베이스시즌입니다.\n해당 상품은 6월 말경 재입고될 예정입니다. 입고 즉시 판매 페이지가 활성화될 예정이오니 참고 부탁드립니다.",
      answerDate: "2025. 06. 06",
    },
    {
      id: 7,
      title: "주문한 상품 색상 변경 가능할까요?",
      category: "주문/결제",
      date: "2025. 06. 03",
      status: "COMPLETED",
      author: "강*민",
      content: "화이트로 주문했는데 베이지 색상으로 변경하고 싶습니다. 아직 발송 전이면 변경 부탁드립니다.",
      answer: "안녕하세요 고객님, 고객님의 주문건은 요청하신 베이지 색상으로 안전하게 변경하여 출고 처리 도와드렸습니다.",
      answerDate: "2025. 06. 03",
    },
    {
      id: 6,
      title: "환불 처리 기간은 얼마나 걸리나요?",
      category: "교환/반품",
      date: "2025. 05. 30",
      status: "COMPLETED",
      author: "윤*서",
      content: "반품 상품 기사님께서 수거해 가셨는데 환불금 입금까지 보통 며칠 정도 걸릴까요?",
      answer: "안녕하세요 고객님, 반품 상품 물류센터 입고 및 검수 완료 후 영업일 기준 2~3일 내에 카드 취소 또는 환불 계좌로 입금 처리됩니다.",
      answerDate: "2025. 05. 31",
    },
    {
      id: 5,
      title: "상품 실측 사이즈 문의입니다.",
      category: "상품 문의",
      date: "2025. 05. 28",
      status: "COMPLETED",
      author: "한*정",
      content: "M 사이즈 총장이랑 가슴 단면 실측이 상세페이지와 동일한가요? 약간 오차가 있을 수 있는지 문의드립니다.",
      answer: "안녕하세요 고객님, 측정 방식에 따라 1~2cm 내외의 미세한 오차가 발생할 수 있습니다. 구매 시 참고 부탁드립니다.",
      answerDate: "2025. 05. 28",
    },
    {
      id: 4,
      title: "선물 포장 가능한가요?",
      category: "기타",
      date: "2025. 05. 25",
      status: "COMPLETED",
      author: "오*현",
      content: "지인 선물용으로 구매하려고 하는데 별도의 선물용 쇼핑백이나 포장 박스가 제공되는지 문의드립니다.",
      answer: "안녕하세요 고객님, 결제 시 배송 요청사항에 '선물 포장 요청'을 남겨주시면 브랜드 전용 선물 박스와 쇼핑백을 함께 동봉하여 발송해 드립니다.",
      answerDate: "2025. 05. 26",
      isMine: false,
    },
    {
      id: 3,
      title: "대량 구매 할인 문의드립니다.",
      category: "상품 문의",
      date: "2025. 05. 20",
      status: "COMPLETED",
      author: "정*희",
      content: "동호회 단체복으로 30벌 이상 구매하려고 하는데 추가 할인이 가능한지 문의드립니다.",
      answer: "안녕하세요 고객님, 베이스시즌입니다.\n고객센터 유선 또는 사업자등록증과 함께 문의 남겨주시면 단체 대량 구매 할인 견적서를 발송해 드리겠습니다.",
      answerDate: "2025. 05. 20",
      isMine: false,
    },
    {
      id: 2,
      title: "세탁 및 보관 방법 문의",
      category: "기타",
      date: "2025. 05. 15",
      status: "COMPLETED",
      author: "송*민",
      content: "린넨 셔츠 중성세제로 울코스 단독 세탁해도 되는지 문의드립니다.",
      answer: "안녕하세요 고객님, 베이스시즌입니다.\n30도 이하의 미온수에서 중성세제로 약하게 단독 세탁을 권장합니다. 건조기 사용은 수축의 원인이 될 수 있으니 자연 건조를 권장합니다.",
      answerDate: "2025. 05. 16",
      isMine: false,
    },
    {
      id: 1,
      title: "신규 회원가입 쿠폰 사용 방법",
      category: "주문/결제",
      date: "2025. 05. 10",
      status: "COMPLETED",
      author: "문*진",
      content: "회원가입 쿠폰이 발급되었는데 주문서 작성할 때 쿠폰 적용은 어떻게 하나요?",
      answer: "안녕하세요 고객님, 결제 페이지 주문 상품 하단 [쿠폰 할인] 항목에서 보유하신 쿠폰을 선택하시면 즉시 차감 적용됩니다.",
      answerDate: "2025. 05. 10",
      isMine: false,
    },
  ]);

  // ---- notices --------------------------------------------------------
  const [noticeList, setNoticeList] = useState([
    {
      id: 4,
      isPinned: true,
      badge: "공지",
      title: "환불 정책 안내",
      date: "2025. 06. 01",
      views: 1253,
      author: "베이스시즌 관리자",
      content: `안녕하세요, 베이스시즌입니다.\n\n베이스시즌을 이용해 주시는 고객님들께 감사드리며, 환불 및 교환/반품 정책에 대해 안내드립니다.\n\n1. 환불/교환 접수 가능 기간\n- 상품 수령일로부터 7일 이내에 마이페이지 > 주문내역에서 접수 가능합니다.\n- 단순 변심의 경우 미착용 및 상품 택(Tag)과 포장 상태가 보존된 상태여야 합니다.\n\n2. 반품 배송비 안내\n- 단순 변심 반품: 왕복 배송비 6,000원 (고객 부담)\n- 상품 불량 및 오배송: 배송비 전액 베이스시즌 부담\n\n3. 환불 처리 절차\n- 접수 ➜ 택배사 자동 회수 접수(영업일 1~3일) ➜ 물류센터 입고 및 검수 ➜ 최종 환불 승인\n- 환불 승인 후 결제 수단에 따라 카드 취소는 2~5영업일, 무통장 입금은 익일 처리됩니다.\n\n더 자세한 문의는 Q&A 게시판 또는 고객센터로 연락 주시기 바랍니다.\n감사합니다.`,
    },
    {
      id: 3,
      isPinned: false,
      badge: null,
      title: "여름 시즌 배송 지연 안내",
      date: "2025. 05. 28",
      views: 842,
      author: "베이스시즌 물류팀",
      content: `안녕하세요, 베이스시즌 물류센터입니다.\n\n현재 여름 신상품 출시 및 주문량 폭주로 인해 일부 품목의 출고가 평소보다 1~2일 지연되고 있습니다.\n\n- 지연 품목: 2025 Summer 린넨 컬렉션 전 품목\n- 정상 출고 예정일: 주문 결제 완료 후 순차 출고 (영업일 기준 2~3일 소요)\n\n최대한 빠르고 안전하게 배송해 드릴 수 있도록 최선을 다하겠습니다.\n배송 지연으로 불편을 드려 대단히 죄송합니다.`,
    },
    {
      id: 2,
      isPinned: false,
      badge: null,
      title: "회원 등급 혜택 안내",
      date: "2025. 05. 20",
      views: 1067,
      author: "베이스시즌 운영팀",
      content: `안녕하세요, 베이스시즌입니다.\n\n2025년도 베이스시즌 회원 등급별 풍성한 멤버십 혜택을 안내드립니다.\n\n[등급 기준 및 혜택 안내]\n- WELCOME (신규 가입): 가입 즉시 5,000원 할인 쿠폰 + 전 상품 무료배송 쿠폰\n- SILVER (누적 10만원 이상): 상시 3% 할인 + 매월 7% 할인 쿠폰 1매\n- GOLD (누적 30만원 이상): 상시 5% 할인 + 매월 10% 할인 쿠폰 2매 + 무료 반품권 1매\n- VIP (누적 70만원 이상): 상시 7% 할인 + 매월 15% 할인 쿠폰 2매 + 상시 무료배송\n\n회원 등급은 매월 1일 전월 누적 실 결제 금액을 기준으로 자동 갱신됩니다.\n많은 관심과 사랑 부탁드립니다.`,
    },
    {
      id: 1,
      isPinned: false,
      badge: null,
      title: "베이스시즌 공식몰 오픈 안내",
      date: "2025. 05. 01",
      views: 2341,
      author: "베이스시즌 관리자",
      content: `반갑습니다, 클래식 & 미니멀 감성 브랜드 '베이스시즌(BASEASON)'의 공식 온라인 스토어가 드디어 정식 오픈하였습니다.\n\n시간이 지나도 변치 않는 감도 높은 시즌리스 데일리웨어를 고객 여러분께 선보입니다.\n\n- 신규 회원가입 시 웰컴 쿠폰팩 즉시 증정\n- 전 상품 오픈 기념 무료배송 프로모션 진행\n- 첫 구매 고객 대상 브랜드 전용 패브릭 백 한정 증정\n\n앞으로 고객님들의 일상에 편안함과 스타일을 더해드리는 베이스시즌이 되겠습니다.\n감사합니다.`,
    },
  ]);
  const [selectedNotice, setSelectedNotice] = useState(null);

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
    setSelectedOrder(null);
    setSelectedRefund(null);
    setRefundTargetOrder(null);
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
    api
      .getOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
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

  const goRefundApply = (order) => {
    closeOverlays();
    if (!loggedIn) {
      requireLogin();
      return;
    }
    const targetOrder = order || orders[0];
    if (!targetOrder) {
      window.alert("환불 신청 가능한 주문 내역이 없습니다.");
      return;
    }
    setRefundTargetOrder(targetOrder);
    setPage("refund-apply");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goRefundDetail = (refund, order) => {
    closeOverlays();
    setSelectedRefund(refund);
    setRefundTargetOrder(order || orders.find((o) => o.order_id === refund?.order_id) || orders[0]);
    setPage("refund-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitRefundApply = async (order, reason) => {
    try {
      const created = await api.createRefundRequest({ order_id: order.order_id, refund_reason: reason });
      window.alert("환불이 정상적으로 접수되었습니다.");
      await refreshOrders();
      const updatedRefunds = await api.getRefundRequests().catch(() => []);
      setRefunds(updatedRefunds);
      goRefundDetail(created, order);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : "환불 신청에 실패했습니다.");
    }
  };

  const goNotice = () => {
    closeOverlays();
    setSelectedNotice(null);
    setPage("notice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNoticeDetail = (notice) => {
    closeOverlays();
    setSelectedNotice(notice);
    setNoticeList((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, views: n.views + 1 } : n))
    );
    setPage("notice-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goQnA = () => {
    closeOverlays();
    setSelectedQnA(null);
    setEditingQnA(null);
    setPage("qna");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goQnAWrite = () => {
    closeOverlays();
    setEditingQnA(null);
    setPage("qna-write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goQnADetail = (qna) => {
    closeOverlays();
    setSelectedQnA(qna);
    setPage("qna-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goQnAEdit = (qna) => {
    closeOverlays();
    setEditingQnA(qna);
    setPage("qna-write");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteQnA = (id) => {
    setQnaList((prev) => prev.filter((q) => q.id !== id));
    setSelectedQnA(null);
    setPage("qna");
    window.alert("문의가 정상적으로 삭제되었습니다.");
  };

  const goMyQnA = () => {
    closeOverlays();
    setPage("my-qna");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitQnA = (qnaData) => {
    if (qnaData.id) {
      // 수정
      const updatedDate = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
      const updatedItem = {
        ...qnaData,
        updatedDate: updatedDate,
      };
      setQnaList((prev) => prev.map((q) => (q.id === qnaData.id ? updatedItem : q)));
      setSelectedQnA(null);
      setEditingQnA(null);
      setPage("qna"); // 문의사항 메뉴(목록)로 이동
    } else {
      // 신규 등록
      const nextId = qnaList.length > 0 ? Math.max(...qnaList.map((q) => q.id)) + 1 : 1;
      const newItem = {
        ...qnaData,
        id: nextId,
        author: authUser?.user_name || authUser?.login_id || "고객님",
        isMine: true,
        updatedDate: null,
      };
      setQnaList((prev) => [newItem, ...prev]);
      setSelectedQnA(null);
      setEditingQnA(null);
      setPage("qna"); // 문의사항 메뉴(목록)로 이동
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            onQnA={goQnA}
            onNotice={goNotice}
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
        <OrderHistoryPage
          orders={orders}
          authUser={authUser}
          onOrderDetail={goOrderDetail}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "refund" && (
        <RefundHistoryPage
          refunds={refunds}
          orders={orders}
          authUser={authUser}
          onGoRefundApply={() => goRefundApply()}
          onGoRefundDetail={goRefundDetail}
          onOrderHistory={goMyPage}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "refund-apply" && refundTargetOrder && (
        <RefundApplyPage
          order={refundTargetOrder}
          authUser={authUser}
          onCancel={goRefundHistory}
          onSubmitRefund={submitRefundApply}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "refund-detail" && selectedRefund && (
        <RefundDetailPage
          refund={selectedRefund}
          order={refundTargetOrder}
          authUser={authUser}
          onGoRefundList={goRefundHistory}
          onGoBestSeller={goBestSellerPage}
          onOrderHistory={goMyPage}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onMyQnA={goMyQnA}
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
          onMyQnA={goMyQnA}
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
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
          onGoBack={goMyPage}
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
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "order-detail" && selectedOrder && (
        <OrderDetailPage
          order={selectedOrder}
          authUser={authUser}
          onBack={goMyPage}
          onGoBestSeller={goBestSellerPage}
          onApplyRefund={goRefundApply}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onMyQnA={goMyQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "my-qna" && (
        <MyQnAPage
          qnaList={qnaList}
          authUser={authUser}
          onOrderHistory={goMyPage}
          onRefund={goRefundHistory}
          onCancelExchangeReturn={goCancelExchangeReturn}
          onMemberInfo={goMemberInfo}
          onAddress={goAddress}
          onGoWrite={goQnAWrite}
          onSelectQnA={goQnADetail}
          onEdit={goQnAEdit}
          onDelete={handleDeleteQnA}
          onLogout={handleLogout}
        />
      )}

      {page === "notice" && (
        <NoticeListPage
          noticeList={noticeList}
          onSelectNotice={goNoticeDetail}
          onQnA={goQnA}
        />
      )}

      {page === "notice-detail" && selectedNotice && (
        <NoticeDetailPage
          notice={selectedNotice}
          onBack={goNotice}
          onQnA={goQnA}
        />
      )}

      {page === "qna" && (
        <QnAListPage
          qnaList={qnaList}
          onGoWrite={goQnAWrite}
          onSelectQnA={goQnADetail}
          onNotice={goNotice}
        />
      )}

      {page === "qna-detail" && selectedQnA && (
        <QnADetailPage
          qna={selectedQnA}
          onBack={goQnA}
          onEdit={goQnAEdit}
          onDelete={handleDeleteQnA}
          onNotice={goNotice}
        />
      )}

      {page === "qna-write" && (
        <QnAWritePage
          editingQnA={editingQnA}
          onCancel={editingQnA ? () => setPage("qna-detail") : goQnA}
          onSubmit={submitQnA}
          onNotice={goNotice}
        />
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
  onQnA,
  onNotice,
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
          <button type="button" onClick={onNotice}>NOTICE</button>
          <button type="button" onClick={onQnA}>Q&A</button>
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
