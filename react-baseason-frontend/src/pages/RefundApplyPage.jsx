import { useState } from "react";
import { MyPageSidebar } from "../components/MyPageSidebar";
import { formatPrice } from "../utils";

export function RefundApplyPage({
  order,
  authUser,
  onCancel,
  onSubmitRefund,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onLogout,
}) {
  const [selectedItemIds, setSelectedItemIds] = useState(
    order?.items?.map((item) => item.order_item_id) || []
  );
  const [reasonCategory, setReasonCategory] = useState("사이즈가 맞지 않아요.");
  const [customReasonCategory, setCustomReasonCategory] = useState("");
  const [detailedReason, setDetailedReason] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleItemSelect = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedPhotos.length + files.length > 5) {
      alert("사진은 최대 5장까지 첨부할 수 있습니다.");
      return;
    }

    const newPhotos = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
  };

  const removePhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) {
      alert("환불할 상품을 1개 이상 선택해주세요.");
      return;
    }

    const finalCategory =
      reasonCategory === "기타 (직접 입력)"
        ? customReasonCategory.trim() || "기타"
        : reasonCategory;

    const fullReason = detailedReason.trim()
      ? `${finalCategory} - ${detailedReason.trim()}`
      : finalCategory;

    setSubmitting(true);
    try {
      await onSubmitRefund(order, fullReason);
    } catch {
      // handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 환불내역 <span>&gt;</span> 환불 신청하기
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="refund"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content refund-apply-section">
            <div className="mypage-heading">
              <div>
                <h1>환불 신청하기</h1>
                <p>환불을 원하시는 상품과 사유를 선택해주세요.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 1. 주문상품 선택 */}
              <div className="refund-form-block">
                <h3 className="block-title">1. 주문상품 선택</h3>
                <div className="refund-items-container">
                  {(order?.items || []).map((item) => {
                    const isSelected = selectedItemIds.includes(item.order_item_id);
                    return (
                      <div
                        className={`refund-item-row ${isSelected ? "selected" : ""}`}
                        key={item.order_item_id}
                        onClick={() => toggleItemSelect(item.order_item_id)}
                      >
                        <div className="item-checkbox-wrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelect(item.order_item_id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="item-thumb-box">
                          <img
                            src={item.thumbnail_url || "/images/products/outer/outer-1/main.png"}
                            alt={item.product_name_snapshot}
                          />
                        </div>

                        <div className="item-meta-info">
                          <strong className="item-name">{item.product_name_snapshot}</strong>
                          <span className="item-option">옵션 : {item.sku_snapshot || "기본"}</span>
                          <span className="item-qty">수량 : {item.quantity}개</span>
                        </div>

                        <div className="item-price-info">
                          <strong>{formatPrice(item.item_amount)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. 환불 사유 선택 */}
              <div className="refund-form-block">
                <h3 className="block-title">2. 환불 사유 선택</h3>
                <div className="refund-reasons-box">
                  {[
                    "사이즈가 맞지 않아요.",
                    "색상이 마음에 들지 않아요.",
                    "상품이 마음에 들지 않아요.",
                    "상품이 불량이에요.",
                    "기타 (직접 입력)",
                  ].map((reason) => (
                    <label key={reason} className="radio-reason-item">
                      <input
                        type="radio"
                        name="refundReason"
                        value={reason}
                        checked={reasonCategory === reason}
                        onChange={(e) => setReasonCategory(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}

                  {reasonCategory === "기타 (직접 입력)" && (
                    <div className="custom-reason-input-wrap">
                      <input
                        type="text"
                        placeholder="사유를 입력해주세요."
                        value={customReasonCategory}
                        onChange={(e) => setCustomReasonCategory(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 3. 상세 내용 입력 */}
              <div className="refund-form-block">
                <h3 className="block-title">3. 상세 내용 입력</h3>
                <div className="textarea-wrap">
                  <textarea
                    rows={4}
                    maxLength={500}
                    placeholder="환불 사유를 자세히 입력해주세요."
                    value={detailedReason}
                    onChange={(e) => setDetailedReason(e.target.value)}
                  />
                  <div className="char-count">{detailedReason.length} / 500</div>
                </div>
              </div>

              {/* 4. 사진 첨부 (선택) */}
              <div className="refund-form-block">
                <h3 className="block-title">4. 사진 첨부 (선택)</h3>
                <div className="photo-attachment-wrap">
                  <label className="btn-upload-photo">
                    <span>+ 사진 첨부하기</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                  <span className="photo-guide-text">
                    최대 5장까지 첨부 가능합니다. (JPG, PNG / 10MB 이하)
                  </span>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="uploaded-photos-preview">
                    {uploadedPhotos.map((p, idx) => (
                      <div className="photo-thumb" key={idx}>
                        <img src={p.url} alt={`첨부 ${idx + 1}`} />
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={() => removePhoto(idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 하단 액션 버튼 */}
              <div className="figma-action-buttons">
                <button
                  type="button"
                  className="btn-action-cancel"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  className="btn-action-submit"
                  disabled={submitting}
                >
                  {submitting ? "신청 중..." : "환불 신청하기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
