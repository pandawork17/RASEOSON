import { MyPageSidebar } from "../components/MyPageSidebar";
import { formatDateTime, formatPrice } from "../utils";

export function RefundHistoryPage({
  refunds,
  orders,
  authUser,
  onGoRefundApply,
  onGoRefundDetail,
  onOrderHistory,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 환불내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="refund"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={() => {}}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content refund-history-section">
            <div className="mypage-heading refund-header-row">
              <div>
                <h1>환불내역</h1>
                <p>신청하신 환불 내역과 진행 상태를 확인하실 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="btn-top-refund-apply"
                onClick={onGoRefundApply}
              >
                환불 신청하기
              </button>
            </div>

            <div className="history-tab-strip">
              <button type="button" className="tab-pill active">
                환불내역 조회 ({refunds.length})
              </button>
            </div>

            {refunds.length === 0 ? (
              <div className="figma-empty-card refund-empty-box">
                <div className="empty-circle-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#897d74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                </div>
                <h2>환불내역이 없습니다.</h2>
                <p>아직 환불을 신청한 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="refund-card-list">
                {refunds.map((r) => {
                  const relatedOrder = orders.find((o) => o.order_id === r.order_id);
                  const firstItem = relatedOrder?.items?.[0];
                  const refundNo = r.refund_no || `RF20260916-${String(r.refund_request_id).padStart(6, "0")}`;
                  const amount = r.requested_amount || relatedOrder?.total_amount || 0;

                  return (
                    <article
                      className="figma-refund-card"
                      key={r.refund_request_id}
                      onClick={() => onGoRefundDetail(r, relatedOrder)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="refund-card-head">
                        <span className="date">{formatDateTime(r.requested_at)}</span>
                        <span className="refund-no">환불번호 {refundNo}</span>
                      </div>

                      <div className="refund-card-body">
                        <div className="refund-item-thumb">
                          <img
                            src={firstItem?.thumbnail_url || "/images/products/outer/outer-1/main.png"}
                            alt={firstItem?.product_name_snapshot || "상품 이미지"}
                          />
                        </div>

                        <div className="refund-item-info">
                          <strong className="name">
                            {firstItem?.product_name_snapshot || "[유니섹스] 미니멀 싱글 코트 _ 브라운"}
                          </strong>
                          <span className="option">
                            옵션 : {firstItem?.sku_snapshot || "브라운, M (100)"}
                          </span>
                          <span className="qty">수량 : {firstItem?.quantity || 1}개</span>
                          <span className="reason">
                            환불 사유 : {r.refund_reason || "사이즈가 맞지 않음"}
                          </span>
                        </div>

                        <div className="refund-price-col">
                          <strong className="price">{formatPrice(amount)}</strong>
                        </div>

                        <div className="refund-status-col">
                          <strong className="status-primary">환불 접수</strong>
                          <span className="status-sub">상품 수거 예정</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* 하단 환불 안내 */}
            <div className="refund-guide-card">
              <div className="guide-header">
                <h3>환불 안내</h3>
                <span className="guide-sub">BASEASON 환불 안내</span>
              </div>
              <ul className="guide-list">
                <li>환불은 상품 수거 완료 후 영업일 기준 3~5일 이내에 처리됩니다.</li>
                <li>결제 수단에 따라 실제 환불 반영 시점은 달라질 수 있습니다.</li>
                <li>환불 진행 상태는 마이페이지의 환불내역에서 확인하실 수 있습니다.</li>
                <li>상품 상태 및 환불 사유에 따라 처리 결과가 달라질 수 있습니다.</li>
                <li>보다 자세한 내용은 고객센터 또는 Q&A를 이용해주세요.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

