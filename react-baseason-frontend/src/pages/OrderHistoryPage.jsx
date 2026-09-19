import { MyPageSidebar } from "../components/MyPageSidebar";
import { formatDateTime, formatPrice } from "../utils";

export function OrderHistoryPage({
  orders,
  authUser,
  onOrderDetail,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 주문내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="order"
            authUser={authUser}
            onOrderHistory={() => {}}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content order-history-section">
            <div className="mypage-heading">
              <div>
                <h1>주문내역</h1>
                <p>지금까지 주문하신 내역을 확인하실 수 있습니다.</p>
              </div>
              <span className="total-count-text">총 {orders.length}건</span>
            </div>

            <div className="history-tab-strip">
              <button type="button" className="tab-pill active">
                주문내역 조회 ({orders.length})
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="figma-empty-card order-empty-box">
                <div className="empty-circle-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#897d74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2>주문내역이 없습니다.</h2>
                <p>아직 주문하신 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="order-history-card-list">
                {orders.map((order) => {
                  const item = order.items?.[0];
                  return (
                    <article className="figma-order-card" key={order.order_id}>
                      <div className="order-card-head">
                        <div className="head-left">
                          <span className="date">{formatDateTime(order.ordered_at)}</span>
                          <span className="order-no">주문번호 {order.order_no}</span>
                        </div>
                        <button
                          type="button"
                          className="link-detail-arrow"
                          onClick={() => onOrderDetail(order)}
                        >
                          상세보기 &gt;
                        </button>
                      </div>

                      <div className="order-card-body">
                        <div className="order-item-thumb">
                          <img
                            src={item?.thumbnail_url || "/images/products/outer/outer-1/main.png"}
                            alt={item?.product_name_snapshot || "상품 이미지"}
                          />
                        </div>

                        <div className="order-item-info">
                          <strong className="name">
                            {item?.product_name_snapshot || "[유니섹스] 미니멀 싱글 코트 _ 브라운"}
                          </strong>
                          <span className="option">
                            옵션 : {item?.sku_snapshot || "기본"}
                          </span>
                          <span className="qty">수량 : {item?.quantity || 1}개</span>
                        </div>

                        <div className="order-price-col">
                          <strong className="price">{formatPrice(order.total_amount)}</strong>
                        </div>

                        <div className="order-actions-col">
                          <span className="status-label">주문완료</span>
                          <button
                            type="button"
                            className="btn-order-detail-action"
                            onClick={() => onOrderDetail(order)}
                          >
                            주문상세보기
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

