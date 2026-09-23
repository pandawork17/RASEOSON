import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "../api";

export const DEMO_ACCOUNTS = {
  buyer: [
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer01",
      password: "buyer1234",
      user_name: "구매자김",
      branch: "스마트쇼핑 전주지사",
      desc: "전주지사 관할 쇼핑몰 고객 (주문/배송/환불 내역 보유)",
      badgeColor: "#6d5548",
      is_system: true,
      default_pw: "buyer1234",
    },
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer02",
      password: "buyer1234",
      user_name: "이영희",
      branch: "스마트쇼핑 부산지사",
      desc: "부산지사 관할 쇼핑몰 고객",
      badgeColor: "#6d5548",
      is_system: false,
      default_pw: "buyer1234",
    },
    {
      role: "buyer",
      roleLabel: "구매자",
      login_id: "buyer03",
      password: "buyer1234",
      user_name: "박민수",
      branch: "스마트쇼핑 본사",
      desc: "본사 직영 온라인몰 고객",
      badgeColor: "#6d5548",
      is_system: false,
      default_pw: "buyer1234",
    },
  ],
  seller: [
    {
      role: "seller",
      roleLabel: "지사(판매자)",
      login_id: "seller01",
      password: "seller1234",
      user_name: "전주지사관리자",
      branch: "스마트쇼핑 본사",
      desc: "본사 직영 매장 판매 담당자",
      badgeColor: "#2b6cb0",
      is_system: true,
      default_pw: "seller1234",
    },
    {
      role: "seller",
      roleLabel: "지사(판매자)",
      login_id: "seller02",
      password: "seller1234",
      user_name: "부산지사관리자",
      branch: "스마트쇼핑 전주지사",
      desc: "전주지사 판매 담당자 (지사 상품 등록, 재고 관리)",
      badgeColor: "#2b6cb0",
      is_system: true,
      default_pw: "seller1234",
    },
  ],
  admin: [
    {
      role: "admin",
      roleLabel: "본사(총괄자)",
      login_id: "admin01",
      password: "admin1234",
      user_name: "최고관리자",
      branch: "스마트쇼핑 본사 (HQ)",
      desc: "전체 시스템 총괄 최고 관리자 (지사 관리, 전사 통계)",
      badgeColor: "#9c4221",
      is_system: true,
      default_pw: "admin1234",
    },
  ],
};

export function LoginPage({ onSuccess, onGoRegister }) {
  const [activeRoleTab, setActiveRoleTab] = useState("buyer"); // 'buyer' | 'seller' | 'admin'
  const [dbAccounts, setDbAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // 로컬스토리지에 저장된 비밀번호 캐시 (직접 가입 및 최근 로그인 계정 매핑용)
  const [localPwMap, setLocalPwMap] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("registered_demo_accounts") || "[]");
      const map = {};
      stored.forEach((a) => {
        if (a.login_id && a.password) map[a.login_id] = a.password;
      });
      return map;
    } catch {
      return {};
    }
  });

  const [loginId, setLoginId] = useState(() => {
    return localStorage.getItem("last_login_id") || "buyer01";
  });
  const [password, setPassword] = useState("buyer1234");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingAccountId, setLoadingAccountId] = useState(null);

  // 실제 MySQL DB로부터 계정 목록을 실시간 조회
  const fetchDbAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const data = await api.getAccounts();
      if (Array.isArray(data) && data.length > 0) {
        setDbAccounts(data);
      } else {
        setDbAccounts([
          ...DEMO_ACCOUNTS.buyer,
          ...DEMO_ACCOUNTS.seller,
          ...DEMO_ACCOUNTS.admin,
        ]);
      }
    } catch (e) {
      console.warn("DB 계정 목록 불러오기 실패, 기본 목록을 사용합니다:", e);
      setDbAccounts([
        ...DEMO_ACCOUNTS.buyer,
        ...DEMO_ACCOUNTS.seller,
        ...DEMO_ACCOUNTS.admin,
      ]);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchDbAccounts();
  }, [fetchDbAccounts]);

  const doLogin = async (id, pw) => {
    setError("");
    setSubmitting(true);
    try {
      const result = await api.login({ login_id: id, password: pw });

      // 로그인 성공 시 해당 계정의 비밀번호를 로컬스토리지에 저장하여 다음번에 완전 원클릭 지원
      try {
        const stored = JSON.parse(localStorage.getItem("registered_demo_accounts") || "[]");
        const exists = stored.find((a) => a.login_id === id);
        let updated;
        if (exists) {
          updated = stored.map((a) => (a.login_id === id ? { ...a, password: pw } : a));
        } else {
          updated = [
            {
              role: (result.user?.role_code || "").toLowerCase(),
              roleLabel: result.user?.role_name || "회원",
              login_id: id,
              password: pw,
              user_name: result.user?.user_name || id,
              branch: "직접 가입 회원",
              desc: "로그인 완료된 계정",
              badgeColor: "#059669",
              isCustom: true,
            },
            ...stored,
          ];
        }
        localStorage.setItem("registered_demo_accounts", JSON.stringify(updated));
        localStorage.setItem("last_login_id", id);
        setLocalPwMap((prev) => ({ ...prev, [id]: pw }));
      } catch (e) {
        console.error("Failed to update registered_demo_accounts", e);
      }

      onSuccess(result);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "로그인에 실패했습니다.";
      setError(msg);
      window.alert(`[로그인 실패]\n${msg}\n\n※ 해당 계정이 DB에 존재하지 않거나 비밀번호가 다를 수 있습니다.\n아래 '또는 계정 직접 입력' 폼에서 비밀번호를 직접 확인 후 로그인할 수 있습니다.`);
    } finally {
      setSubmitting(false);
      setLoadingAccountId(null);
    }
  };

  const handleQuickLogin = (acc) => {
    const pw =
      localPwMap[acc.login_id] ||
      acc.default_pw ||
      (acc.role === "buyer" ? "buyer1234" : "seller1234");
    setLoginId(acc.login_id);
    setPassword(pw);
    setLoadingAccountId(acc.login_id);
    doLogin(acc.login_id, pw);
  };

  const handleRemoveAccount = async (e, acc) => {
    e.stopPropagation();
    if (acc.is_system) {
      window.alert(`'${acc.login_id}' 계정은 필수 시스템 계정이므로 삭제할 수 없습니다.`);
      return;
    }

    if (!window.confirm(`'${acc.login_id}' (${acc.user_name}) 계정을 데이터베이스(DB) 및 목록에서 완전히 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await api.deleteUser(acc.login_id);
      window.alert(`계정 '${acc.login_id}'이(가) 데이터베이스(DB)에서 성공적으로 삭제되었습니다.`);

      // 로컬스토리지 정리
      try {
        const stored = JSON.parse(localStorage.getItem("registered_demo_accounts") || "[]");
        const next = stored.filter((a) => a.login_id !== acc.login_id);
        localStorage.setItem("registered_demo_accounts", JSON.stringify(next));
        if (localStorage.getItem("last_login_id") === acc.login_id) {
          localStorage.removeItem("last_login_id");
        }
      } catch (err) {
        console.error(err);
      }

      // DB 계정 목록 재조회
      await fetchDbAccounts();
    } catch (err) {
      console.warn("DB 사용자 삭제 실패:", err);
      window.alert(err instanceof ApiError ? err.message : "계정 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    await doLogin(loginId.trim(), password.trim());
  };

  // 현재 탭에 해당하는 DB 계정 필터링
  const currentAccounts = dbAccounts.filter((acc) => {
    const r = (acc.role || "").toLowerCase();
    return r === activeRoleTab;
  });

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
              const first = dbAccounts.find((a) => a.role === "buyer");
              if (first) {
                setLoginId(first.login_id);
                setPassword(localPwMap[first.login_id] || first.default_pw || "buyer1234");
              }
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
              const first = dbAccounts.find((a) => a.role === "seller");
              if (first) {
                setLoginId(first.login_id);
                setPassword(localPwMap[first.login_id] || first.default_pw || "seller1234");
              }
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
              const first = dbAccounts.find((a) => a.role === "admin");
              if (first) {
                setLoginId(first.login_id);
                setPassword(localPwMap[first.login_id] || first.default_pw || "admin1234");
              }
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

        {/* 실제 DB 연동 원클릭 빠른 로그인 섹션 */}
        <div className="demo-quick-login-section">
          <div className="quick-login-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="quick-icon">⚡</span>
              <strong>MySQL DB 실시간 계정 (원클릭 로그인)</strong>
              <span className="quick-desc" style={{ display: "block", marginTop: "2px" }}>
                복구된 데이터베이스에 등록된 실제 계정 목록입니다.
              </span>
            </div>
            <button
              type="button"
              onClick={fetchDbAccounts}
              disabled={loadingAccounts}
              style={{
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "600",
                color: "#374151",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
              title="데이터베이스 계정 새로고침"
            >
              {loadingAccounts ? "조회 중..." : "🔄 DB 동기화"}
            </button>
          </div>

          <div className="demo-accounts-grid">
            {currentAccounts.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                {loadingAccounts ? "데이터베이스 계정 조회 중..." : "해당 권한의 DB 계정이 없습니다."}
              </div>
            ) : (
              currentAccounts.map((acc) => {
                const isCustom = !acc.is_system;
                const isNew = isCustom && (!acc.login_id.startsWith("buyer0") && acc.login_id !== "buyer5" && acc.login_id !== "buyer96" && acc.login_id !== "tester01");
                return (
                  <div
                    key={acc.login_id}
                    className={`demo-account-card ${isNew ? "is-new-card" : ""}`}
                  >
                    <div className="demo-acc-top">
                      <div className="demo-acc-title">
                        <strong className="acc-name">{acc.user_name || acc.login_id}</strong>
                        <span className="acc-id">({acc.login_id})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span
                          className={`demo-branch-tag ${isNew ? "is-new-tag" : ""}`}
                          style={!isNew ? { borderColor: acc.badge_color || "#6d5548", color: acc.badge_color || "#6d5548" } : {}}
                        >
                          {isNew ? "✨ 직접 등록/가입" : acc.branch || "본사"}
                        </span>
                        {!acc.is_system && (
                          <button
                            type="button"
                            className="btn-remove-custom-acc"
                            title="데이터베이스(DB)에서 영구 삭제"
                            onClick={(e) => handleRemoveAccount(e, acc)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="demo-acc-desc">{acc.desc || `${acc.branch || ""} 소속 계정`}</p>
                    <button
                      type="button"
                      className={`btn-demo-quick-login ${isNew ? "is-new-btn" : ""}`}
                      disabled={submitting}
                      onClick={() => handleQuickLogin(acc)}
                    >
                      {loadingAccountId === acc.login_id
                        ? "로그인 중..."
                        : "원클릭 로그인 ➜"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {error && <div className="form-error-banner" style={{ marginBottom: "16px" }}>{error}</div>}

        {/* 계정 직접 입력 폼 */}
        <div className="divider-text">
          <span>또는 계정 직접 입력</span>
        </div>

        <form onSubmit={handleSubmit} className="standard-login-form">
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
