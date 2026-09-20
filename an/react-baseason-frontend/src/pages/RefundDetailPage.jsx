import { MyPageSidebar } from "../components/MyPageSidebar";
import { formatDateTime, formatDate, formatPrice } from "../utils";

export function RefundDetailPage({
  refund,
  order,
  authUser,
  onGoRefundList,
  onGoBestSeller,
  onOrderHistory,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onMyQnA,
  onLogout,
}) {
  const item = order?.items?.[0];
  const requestedDate = refund?.requested_at ? formatDate(refund.requested_at) : "2026. 09. 16";
  const requestedDateTime = refund?.requested_at ? formatDateTime(refund.requested_at) : "2026. 09. 16. 18:30";
  const refundNo = refund?.refund_no || (refund?.refund_request_id ? `RF20260916-${String(refund.refund_request_id).padStart(6, "0")}` : "RF20260916-000001");
  const refundAmount = refund?.requested_amount || order?.total_amount || 0;

  // 5단계 스텝
  const steps = [
    { num: 1, label: "환불 접수", date: requestedDate },
    { num: 2, label: "상품 수거 예정", date: "-" },
    { num: 3, label: "상품 입고", date: "-" },
    { num: 4, label: "환불 처리중", date: "-" },
    { num: 5, label: "환불 완료", date: "-" },
  ];

  const currentStep = refund?.refund_status === "COMPLETED" ? 5 : 1;

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 환불내역 <span>&gt;</span> 환불상세보기
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="refund"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onGoRefundList}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onMyQnA={onMyQnA}
            onLogout={onLogout}
          />

          <section className="mypage-content refund-detail-section">
            <div className="mypage-heading">
              <div>
                <h1>환불상세보기</h1>
                <p>신청하신 환불의 상세 정보를 확인할 수 있습니다.</p>
              </div>
            </div>

            {/* 상단 요약 박스 */}
            <div className="refund-summary-box">
              <div className="summary-row">
                <span className="label">환불번호</span>
                <span className="value">{refundNo}</span>
              </div>
              <div className="summary-row">
                <span className="label">신청일시</span>
                <span className="value">{requestedDateTime}</span>
              </div>
              <div className="summary-row">
                <span className="label">환불상태</span>
                <strong className="value status-highlight">환불 접수 (상품 수거 예정)</strong>
              </div>
              <div className="summary-row">
                <span className="label">환불 사유</span>
                <span className="value">{refund?.refund_reason || "사이즈가 맞지 않음"}</span>
              </div>
              <div className="summary-row">
                <span className="label">환불 예상 금액</span>
                <strong className="value amount-highlight">{formatPrice(refundAmount)}</strong>
              </div>
            </div>

            {/* 환불 신청 상품 */}
            <div className="refund-detail-section-block">
              <h3 className="section-title">환불 신청 상품 ({order?.items?.length || 1})</h3>
              <div className="refund-product-card">
                <div className="product-thumb">
                  <img
                    src={item?.thumbnail_url || "/images/products/outer/outer-1/main.png"}
                    alt={item?.product_name_snapshot || "상품 이미지"}
                  />
                </div>
                <div className="product-info">
                  <strong className="product-name">{item?.product_name_snapshot || "[유신사] 리버스 싱글 코트 _ 브라운"}</strong>
                  <span className="product-opt">옵션 : {item?.sku_snapshot || "브라운, L (100)"}</span>
                  <span className="product-qty">수량 : {item?.quantity || 1}개</span>
                </div>
                <div className="product-price">
                  <strong>{formatPrice(item?.item_amount || refundAmount)}</strong>
                </div>
              </div>
            </div>

            {/* 환불 진행 상태 5단계 스텝퍼 */}
            <div className="refund-detail-section-block">
              <h3 className="section-title">환불 진행 상태</h3>
              <div className="refund-stepper-container">
                <div className="stepper-track-line" />
                <div className="stepper-steps-wrapper">
                  {steps.map((s) => {
                    const isPassed = s.num <= currentStep;
                    const isCurrent = s.num === currentStep;
                    return (
                      <div className={`step-item ${isCurrent ? "active" : ""} ${isPassed ? "passed" : ""}`} key={s.num}>
                        <div className="step-circle">{s.num}</div>
                        <span className="step-label">{s.label}</span>
                        <span className="step-date">{s.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 환불 정보 */}
            <div className="refund-detail-section-block">
              <h3 className="section-title">환불 정보</h3>
              <div className="refund-info-table">
                <div className="info-row">
                  <span className="info-th">환불 방법</span>
                  <span className="info-td">결제 수단으로 환불 (신용카드)</span>
                </div>
                <div className="info-row">
                  <span className="info-th">환불 금액</span>
                  <span className="info-td">{formatPrice(refundAmount)}</span>
                </div>
                <div className="info-row">
                  <span className="info-th">환불 예정일</span>
                  <span className="info-td">상품 수거 완료 후 3-5영업일 이내</span>
                </div>
                <div className="info-row">
                  <span className="info-th">환불 계좌</span>
                  <span className="info-td">-</span>
                </div>
              </div>
            </div>

            {/* 하단 유의사항 */}
            <div className="refund-notice-box">
              <div className="notice-header">
                <span className="icon-info">ⓘ</span>
                <strong>유의사항</strong>
              </div>
              <ul className="notice-list">
                <li>환불은 상품 수거 완료 후 영업일 기준 3-5일 이내에 처리됩니다.</li>
                <li>환불 진행 상황은 마이페이지 &gt; 환불내역에서 확인하실 수 있습니다.</li>
                <li>추가 문의사항은 고객센터로 연락주세요.</li>
              </ul>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="figma-bottom-actions">
              <button
                type="button"
                className="btn-action-light"
                onClick={onGoRefundList}
              >
                환불 내역 목록으로
              </button>
              <button
                type="button"
                className="btn-action-dark"
                onClick={onGoBestSeller}
              >
                다른 상품 보러가기
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

