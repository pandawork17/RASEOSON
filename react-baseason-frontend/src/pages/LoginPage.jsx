import { useState } from "react";
import { api, ApiError } from "../api";

export const DEMO_ACCOUNTS = {
  buyer: [
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer01",
      password: "buyer1234",
      user_name: "구매자김",
      branch: "전주지사 소속",
      desc: "전주지사 관할 쇼핑몰 고객 (주문/배송/환불 내역 보유)",
      badgeColor: "#6d5548",
    },
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer02",
      password: "buyer1234",
      user_name: "구매자이",
      branch: "부산지사 소속",
      desc: "부산지사 관할 쇼핑몰 고객",
      badgeColor: "#6d5548",
    },
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer03",
      password: "buyer1234",
      user_name: "구매자박",
      branch: "본사 직영",
      desc: "본사 직영 온라인몰 고객",
      badgeColor: "#6d5548",
    },
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer5",
      password: "buyer1234",
      user_name: "오길동",
      branch: "일반 회원",
      desc: "신규 쇼핑몰 일반 고객 계정",
      badgeColor: "#6d5548",
    },
  ],
  seller: [
    {
      role: "seller",
      roleLabel: "지사(판매자)",
      login_id: "seller02",
      password: "seller1234",
      user_name: "패션판매자",
      branch: "스마트쇼핑 전주지사",
      desc: "전주지사 판매 담당자 (지사 상품 등록, 재고 관리)",
      badgeColor: "#2b6cb0",
    },
    {
      role: "seller",
      roleLabel: "지사(판매자)",
      login_id: "seller01",
      password: "seller1234",
      user_name: "전자판매자",
      branch: "스마트쇼핑 본사 직영",
      desc: "본사 직영 매장 판매 담당자",
      badgeColor: "#2b6cb0",
    },
  ],
  admin: [
    {
      role: "admin",
      roleLabel: "본사(총괄자)",
      login_id: "admin01",
      password: "admin1234",
      user_name: "쇼핑몰관리자",
      branch: "스마트쇼핑 본사 (HQ)",
      desc: "전체 시스템 총괄 최고 관리자 (지사 관리, 전사 통계)",
      badgeColor: "#9c4221",
    },
  ],
};

export function LoginPage({ onSuccess, onGoRegister }) {
  const [activeRoleTab, setActiveRoleTab] = useState("buyer"); // 'buyer' | 'seller' | 'admin'
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingAccountId, setLoadingAccountId] = useState(null);

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
      setLoadingAccountId(null);
    }
  };

  const handleQuickLogin = (acc) => {
    setLoadingAccountId(acc.login_id);
    setLoginId(acc.login_id);
    setPassword(acc.password);
    doLogin(acc.login_id, acc.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    await doLogin(loginId.trim(), password.trim());
  };

  const currentAccounts = DEMO_ACCOUNTS[activeRoleTab] || [];

  return (
    <main className="auth-page">
      <div className="auth-card figma-auth-card">
        <div className="auth-header">
          <h1>통합 로그인</h1>
          <p className="auth-subtitle">접속하실 서비스 권한을 선택해주세요.</p>
        </div>

        {/* 권한별 탭 (구매자 / 지사 / 본사) */}
        <div className="auth-role-tabs">
          <button
            type="button"
            className={`auth-role-tab ${activeRoleTab === "buyer" ? "active" : ""}`}
            onClick={() => {
              setActiveRoleTab("buyer");
              setError("");
            }}
          >
            <span className="tab-icon">🛍️</span>
            <span>구매자 (쇼핑몰)</span>
          </button>
          <button
            type="button"
            className={`auth-role-tab ${activeRoleTab === "seller" ? "active" : ""}`}
            onClick={() => {
              setActiveRoleTab("seller");
              setError("");
            }}
          >
            <span className="tab-icon">🏢</span>
            <span>지사 (판매자)</span>
          </button>
          <button
            type="button"
            className={`auth-role-tab ${activeRoleTab === "admin" ? "active" : ""}`}
            onClick={() => {
              setActiveRoleTab("admin");
              setError("");
            }}
          >
            <span className="tab-icon">👑</span>
            <span>본사 (총괄자)</span>
          </button>
        </div>

        {/* 탭별 역할 안내 배너 */}
        <div className={`role-notice-badge role-${activeRoleTab}`}>
          {activeRoleTab === "buyer" && (
            <span><strong>구매자 모드:</strong> 상품 쇼핑, 장바구니, 주문/배송 조회, Q&A 문의</span>
          )}
          {activeRoleTab === "seller" && (
            <span><strong>지사(판매자) 모드:</strong> 관할 지사 상품 등록, 재고 관리, 지사 주문 내역 확인</span>
          )}
          {activeRoleTab === "admin" && (
            <span><strong>본사(총괄관리자) 모드:</strong> 전사 지사 총괄 관리, 전체 매출/주문 통계, 시스템 설정</span>
          )}
        </div>

        {/* 시연용 원클릭 빠른 로그인 섹션 */}
        <div className="demo-quick-login-section">
          <div className="quick-login-header">
            <span className="quick-icon">⚡</span>
            <strong>시연용 원클릭 빠른 로그인</strong>
            <span className="quick-desc">버튼 클릭 시 입력 없이 즉시 로그인됩니다.</span>
          </div>

          <div className="demo-accounts-grid">
            {currentAccounts.map((acc) => (
              <div key={acc.login_id} className="demo-account-card">
                <div className="demo-acc-top">
                  <div className="demo-acc-title">
                    <strong className="acc-name">{acc.user_name}</strong>
                    <span className="acc-id">({acc.login_id})</span>
                  </div>
                  <span
                    className="demo-branch-tag"
                    style={{ borderColor: acc.badgeColor, color: acc.badgeColor }}
                  >
                    {acc.branch}
                  </span>
                </div>
                <p className="demo-acc-desc">{acc.desc}</p>
                <button
                  type="button"
                  className="btn-demo-quick-login"
                  disabled={submitting}
                  onClick={() => handleQuickLogin(acc)}
                >
                  {loadingAccountId === acc.login_id ? "로그인 중..." : "원클릭 로그인 ➜"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 직접 아이디/비밀번호 입력 영역 */}
        <div className="divider-text">
          <span>또는 계정 직접 입력</span>
        </div>

        <form onSubmit={handleSubmit} className="standard-login-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="auth-field">
            <label htmlFor="login-id-input">아이디</label>
            <input
              id="login-id-input"
              type="text"
              placeholder="아이디를 입력하세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-pw-input">비밀번호</label>
            <input
              id="login-pw-input"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-auth-submit"
            disabled={submitting}
          >
            {submitting ? "로그인 중..." : `${activeRoleTab === "buyer" ? "구매자" : activeRoleTab === "seller" ? "지사 판매자" : "본사 관리자"} 로그인`}
          </button>
        </form>

        {/* 하단 푸터 링크 */}
        <div className="auth-footer-links">
          {activeRoleTab === "buyer" ? (
            <div className="register-prompt">
              <span>아직 회원이 아니신가요?</span>
              <button
                type="button"
                className="btn-link-register"
                onClick={onGoRegister}
              >
                회원가입
              </button>
            </div>
          ) : (
            <div className="branch-admin-prompt">
              <span>* 지사 및 본사 파트너 계정은 본사 총괄 관리자의 사전 승인 후 등록됩니다.</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
