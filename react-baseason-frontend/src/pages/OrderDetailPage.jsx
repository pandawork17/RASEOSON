import { MyPageSidebar } from "../components/MyPageSidebar";
import { formatDateTime, formatPrice, paymentMethodLabel, orderStatusLabel } from "../utils";

export function OrderDetailPage({
  order,
  authUser,
  onBack,
  onGoBestSeller,
  onApplyRefund,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  const item = order?.items?.[0];
  const canRequestRefund = ["PAID", "PREPARING", "SHIPPING", "DELIVERED", "COMPLETED"].includes(order?.order_status);

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 주문내역 <span>&gt;</span> 주문상세보기
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="order"
            authUser={authUser}
            onOrderHistory={onOrderHistory || onBack}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content order-detail-section">
            <div className="mypage-heading">
              <div>
                <h1>주문상세보기</h1>
                <p>주문하신 상품의 상세 정보를 확인할 수 있습니다.</p>
              </div>
            </div>

            {/* 상단 요약 박스 */}
            <div className="order-summary-box">
              <div className="summary-row">
                <span className="label">주문번호</span>
                <span className="value">{order?.order_no}</span>
              </div>
              <div className="summary-row">
                <span className="label">주문일시</span>
                <span className="value">{formatDateTime(order?.ordered_at)}</span>
              </div>
              <div className="summary-row">
                <span className="label">주문상태</span>
                <strong className="value status-highlight">
                  {orderStatusLabel(order?.process_status || order?.order_status)}
                </strong>
              </div>
              <div className="summary-row">
                <span className="label">결제수단</span>
                <span className="value">{paymentMethodLabel(order?.payment_method)}</span>
              </div>
              <div className="summary-row">
                <span className="label">총 결제금액</span>
                <strong className="value amount-highlight">{formatPrice(order?.total_amount)}</strong>
              </div>
            </div>

            {/* 주문 상품 (1) */}
            <div className="order-detail-block">
              <h3 className="block-title">주문 상품 ({order?.items?.length || 1})</h3>
              <div className="detail-product-card">
                <div className="product-thumb">
                  <img
                    src={item?.thumbnail_url || "/images/products/outer/outer-1/main.png"}
                    alt={item?.product_name_snapshot || "상품 이미지"}
                  />
                </div>
                <div className="product-info">
                  <strong className="name">{item?.product_name_snapshot || "[유신사] 리버스 싱글 코트 _ 브라운"}</strong>
                  <span className="opt">옵션 : {item?.sku_snapshot || "브라운, L (100)"}</span>
                  <span className="qty">수량 : {item?.quantity || 1}개</span>
                </div>
                <div className="product-price">
                  <strong>{formatPrice(item?.item_amount || order?.total_amount)}</strong>
                </div>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="order-detail-block">
              <div className="block-title-row">
                <h3 className="block-title">배송 정보</h3>
                <button
                  type="button"
                  className="btn-block-action"
                  onClick={() => alert("배송 준비 중에는 고객센터를 통해 배송지 변경이 가능합니다.")}
                >
                  배송지 변경
                </button>
              </div>

              <div className="detail-info-table">
                <div className="info-row">
                  <span className="info-th">받는 분</span>
                  <span className="info-td">{order?.receiver_name || "김소민"}</span>
                </div>
                <div className="info-row">
                  <span className="info-th">연락처</span>
                  <span className="info-td">{order?.receiver_phone || "010-1234-5678"}</span>
                </div>
                <div className="info-row">
                  <span className="info-th">주소</span>
                  <span className="info-td">
                    {order?.shipping_address1} {order?.shipping_address2 || ""}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-th">배송 요청사항</span>
                  <span className="info-td">부재 시 문 앞에 놓아주세요.</span>
                </div>
              </div>
            </div>

            {/* 결제 정보 */}
            <div className="order-detail-block">
              <div className="block-title-row">
                <h3 className="block-title">결제 정보</h3>
                <button
                  type="button"
                  className="btn-block-action"
                  onClick={() => alert("영수증 출력을 준비 중입니다.")}
                >
                  영수증 보기
                </button>
              </div>

              <div className="detail-info-table">
                <div className="info-row">
                  <span className="info-th">상품 금액</span>
                  <span className="info-td">{formatPrice(order?.product_amount)}</span>
                </div>
                <div className="info-row">
                  <span className="info-th">배송비</span>
                  <span className="info-td">{formatPrice(order?.shipping_amount)}</span>
                </div>
                <div className="info-row">
                  <span className="info-th">할인 금액</span>
                  <span className="info-td">- {formatPrice(order?.discount_amount || 0)}</span>
                </div>
                <div className="info-row total-row">
                  <span className="info-th">총 결제 금액</span>
                  <strong className="info-td total-price">{formatPrice(order?.total_amount)}</strong>
                </div>
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="figma-bottom-actions">
              <button
                type="button"
                className="btn-action-light"
                onClick={onBack}
              >
                주문 목록으로
              </button>
              <button
                type="button"
                className="btn-action-dark"
                onClick={onGoBestSeller}
              >
                다른 상품 보러가기
              </button>
              {canRequestRefund && (
                <button
                  type="button"
                  className="btn-action-refund"
                  onClick={() => onApplyRefund(order)}
                >
                  환불 신청하기
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
