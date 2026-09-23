import React, { useState, useEffect, useCallback } from "react";
import BuyerApp from "./buyer/BuyerApp";
import BranchAdmin from "./seller/BranchAdmin";
import AdminApp from "./admin/AdminApp";
import "./App.css";

/**
 * ============================================================
 * [BASEOSON 통합 프론트엔드 포털]
 * ------------------------------------------------------------
 * 1. 구매자 쇼핑몰 (BuyerApp)
 * 2. 지사 판매자 대시보드 (BranchAdmin - 전주/부산 지사)
 * 3. 본사 총괄 관리자 (AdminApp)
 * 
 * 단일 Vite 서버(포트 5173)에서 3개 역할을 하단 플로팅 도크 또는 URL로
 * 자유롭게 전환하며, 상단 헤더 디자인 간섭이 전혀 없도록 최적화되었습니다.
 * ============================================================
 */
export default function App() {
  // 초기 역할 결정 (URL pathname 또는 쿼리 파라미터 기반)
  const getInitialRole = () => {
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const qRole = params.get("role")?.toLowerCase();

    if (qRole === "seller" || path === "/seller" || path.startsWith("/seller")) return "seller";
    if (qRole === "admin" || path === "/admin" || path.startsWith("/admin")) return "admin";
    return "buyer";
  };

  const [role, setRole] = useState(getInitialRole);
  const [showPortalBar, setShowPortalBar] = useState(true);

  // 브라우저 뒤로가기/앞으로가기 및 URL 파싱 동기화
  useEffect(() => {
    const handlePopState = () => {
      setRole(getInitialRole());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchRole = useCallback((nextRole, replaceUrl = true) => {
    setRole(nextRole);
    if (replaceUrl) {
      const targetPath = nextRole === "seller" ? "/seller" : nextRole === "admin" ? "/admin" : "/";
      window.history.pushState({ role: nextRole }, "", targetPath);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="baseoson-unified-container">
      {/* ========================================================
          선택된 역할에 따른 화면 렌더링 (최상단부터 100% 정상 렌더링)
      ======================================================== */}
      <main className="portal-content-body">
        {role === "buyer" && <BuyerApp onSwitchRole={switchRole} />}
        {role === "seller" && <BranchAdmin onSwitchRole={switchRole} />}
        {role === "admin" && <AdminApp onSwitchRole={switchRole} />}
      </main>

      {/* ========================================================
          통합 역할 전환 하단 퀵 플로팅 도크 (상단 디자인 간섭 0%)
      ======================================================== */}
      {showPortalBar && (
        <aside
          style={{
            position: "fixed",
            bottom: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999999,
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#f8fafc",
            padding: "8px 18px",
            borderRadius: "32px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "13px",
            fontFamily: "'Pretendard', sans-serif",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {/* 좌측 뱃지 */}
          <span
            style={{
              background: "#0284c7",
              color: "#fff",
              fontWeight: 800,
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "14px",
              letterSpacing: "0.3px",
            }}
          >
            FINAL 3조
          </span>

          {/* 중앙 역할 전환 버튼 */}
          <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => switchRole("buyer")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: role === "buyer" ? "700" : "500",
                fontSize: "12px",
                background: role === "buyer" ? "#38bdf8" : "#334155",
                color: role === "buyer" ? "#0f172a" : "#cbd5e1",
                transition: "all 0.15s ease",
              }}
            >
              🛍️ 구매자 쇼핑몰
            </button>

            <button
              type="button"
              onClick={() => switchRole("seller")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: role === "seller" ? "700" : "500",
                fontSize: "12px",
                background: role === "seller" ? "#34d399" : "#334155",
                color: role === "seller" ? "#064e3b" : "#cbd5e1",
                transition: "all 0.15s ease",
              }}
            >
              🏪 지사 판매자
            </button>

            <button
              type="button"
              onClick={() => switchRole("admin")}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: role === "admin" ? "700" : "500",
                fontSize: "12px",
                background: role === "admin" ? "#f59e0b" : "#334155",
                color: role === "admin" ? "#451a03" : "#cbd5e1",
                transition: "all 0.15s ease",
              }}
            >
              🏢 본사 관리자
            </button>
          </nav>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={() => setShowPortalBar(false)}
            title="하단 바 숨기기 (우측 하단 버튼으로 다시 열 수 있습니다)"
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "14px",
              padding: "2px 6px",
              marginLeft: "2px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </aside>
      )}

      {/* 하단 바 숨겼을 때 다시 띄우는 플로팅 버튼 */}
      {!showPortalBar && (
        <button
          type="button"
          onClick={() => setShowPortalBar(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 999999,
            background: "#1e293b",
            color: "#38bdf8",
            border: "1px solid #38bdf8",
            borderRadius: "20px",
            padding: "8px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          🔄 역할 전환 바 열기
        </button>
      )}
    </div>
  );
}
