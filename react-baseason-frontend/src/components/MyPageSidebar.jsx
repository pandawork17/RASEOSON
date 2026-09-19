export function MyPageSidebar({
  active,
  authUser,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onMyQnA,
  onLogout,
}) {
  const displayName = authUser?.login_id || authUser?.user_name || "회원";

  return (
    <aside className="mypage-sidebar">
      <div className="mypage-user">
        <div className="mypage-avatar">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="mypage-user-text">
          <span>안녕하세요,</span>
          <strong>{displayName}님</strong>
        </div>
      </div>

      <nav className="mypage-nav">
        <button
          className={active === "member" ? "active" : ""}
          type="button"
          onClick={onMemberInfo}
        >
          회원정보수정
        </button>
        <button
          className={active === "address" ? "active" : ""}
          type="button"
          onClick={onAddress}
        >
          배송지 관리
        </button>
        <button
          className={active === "order" ? "active" : ""}
          type="button"
          onClick={onOrderHistory}
        >
          주문내역
        </button>
        <button
          className={active === "cancel" ? "active" : ""}
          type="button"
          onClick={onCancelExchangeReturn}
        >
          취소/교환/반품 내역
        </button>
        <button
          className={active === "refund" ? "active" : ""}
          type="button"
          onClick={onRefund}
        >
          환불내역
        </button>
        <button
          className={active === "my-qna" ? "active" : ""}
          type="button"
          onClick={onMyQnA}
        >
          1:1 문의내역
        </button>
      </nav>

      <button className="mypage-logout" type="button" onClick={onLogout}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>로그아웃</span>
      </button>
    </aside>
  );
}
