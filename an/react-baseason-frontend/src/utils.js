export function openDaumPostcode(onComplete) {
  const open = () => {
    if (!window.daum || !window.daum.Postcode) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        const address = data.roadAddress || data.jibunAddress || "";
        const extraAddress =
          data.buildingName || data.bname
            ? ` (${[data.bname, data.buildingName].filter(Boolean).join(", ")})`
            : "";
        onComplete({
          zonecode: data.zonecode,
          address: `${address}${extraAddress}`,
          roadAddress: data.roadAddress,
          jibunAddress: data.jibunAddress,
          extraAddress,
        });
      },
    }).open();
  };

  if (window.daum && window.daum.Postcode) {
    open();
    return;
  }
  const script = document.querySelector('script[data-daum-postcode="true"]');
  if (script) {
    script.addEventListener("load", open, { once: true });
    return;
  }
  const newScript = document.createElement("script");
  newScript.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
  newScript.setAttribute("data-daum-postcode", "true");
  newScript.onload = open;
  document.body.appendChild(newScript);
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "0원";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${Math.round(num).toLocaleString("ko-KR")}원`;
}

export function formatNumber(value) {
  if (value === null || value === undefined || value === "") return "0";
  return Math.round(Number(value)).toLocaleString("ko-KR");
}

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const date = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

export function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

export function orderStatusLabel(status) {
  const labels = {
    ORDERED: "주문완료",
    PAID: "결제완료",
    PREPARING: "배송준비중",
    SHIPPING: "배송중",
    DELIVERED: "배송완료",
    COMPLETED: "구매확정",
    CANCEL_REQUESTED: "취소요청",
    CANCELLED: "취소완료",
    REFUND_REQUESTED: "환불신청",
    REFUND_WAITING: "환불접수",
    REFUND_PROCESSING: "환불처리중",
    REFUND_COMPLETED: "환불완료",
    PAYMENT_COMPLETED: "결제완료",
  };
  return labels[status] || status || "주문완료";
}

export function paymentMethodLabel(method) {
  const labels = {
    CARD: "신용카드 (국민카드 ****-****-1234)",
    BANK: "무통장입금",
    KAKAO: "카카오페이",
    NAVER: "네이버페이",
    TOSS: "토스페이",
  };
  return labels[method] || method || "신용카드";
}

export function refundStatusLabel(status) {
  const labels = {
    REQUESTED: "환불 접수 (상품 수거 예정)",
    WAITING_PICKUP: "상품 수거 예정",
    RECEIVED: "상품 입고",
    PROCESSING: "환불 처리중",
    APPROVED: "환불 승인",
    REJECTED: "환불 거부",
    COMPLETED: "환불 완료",
  };
  return labels[status] || status || "환불 접수";
}

