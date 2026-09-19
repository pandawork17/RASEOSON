import { MyPageSidebar } from "../components/MyPageSidebar";

export function CancelExchangeReturnPage({
  refunds = [],
  authUser,
  onOrderHistory,
  onRefund,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 취소/교환/반품 내역
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

          <section className="mypage-content cancel-exchange-section">
            <div className="mypage-heading">
              <div>
                <h1>취소/교환/반품 내역</h1>
                <p>신청하신 취소, 교환, 반품 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <span className="total-count-text">총 0건</span>
            </div>

            <div className="figma-empty-card cancel-empty-box">
              <div className="empty-circle-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#897d74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
              <h2>취소/교환/반품 내역이 없습니다.</h2>
              <p>아직 취소, 교환 또는 반품을 신청한 상품이 없습니다.</p>
            </div>

            <div className="refund-guide-card">
              <div className="guide-header">
                <h3>안내</h3>
              </div>
              <ul className="guide-list">
                <li>주문하신 상품에 대한 취소, 교환, 반품 신청 후 진행 상태가 이곳에 표시됩니다.</li>
                <li>자세한 신청 방법과 처리 기준은 각 신청 페이지에서 확인하실 수 있습니다.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
