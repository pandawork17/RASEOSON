import { useEffect, useState } from "react";

const dashboardItems = [
  { key: "org_count", label: "운영 조직", unit: "개" },
  { key: "user_count", label: "전체 회원", unit: "명" },
  { key: "seller_count", label: "판매자", unit: "명" },
  { key: "product_count", label: "전체 상품", unit: "개" },
  { key: "order_count", label: "전체 주문", unit: "건" },
  { key: "payment_count", label: "결제 내역", unit: "건" },
  { key: "refund_count", label: "환불 요청", unit: "건" },
  { key: "low_stock_count", label: "안전재고 부족", unit: "건" },
  {
    key: "unanswered_inquiry_count",
    label: "미답변 문의",
    unit: "건",
  },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/dashboard/summary");

      if (!response.ok) {
        throw new Error("대시보드 데이터를 불러오지 못했습니다.");
      }

      const data = await response.json();
      setSummary(data);
    } catch {
      setErrorMessage(
        "대시보드 현황을 불러오지 못했습니다. FastAPI 서버를 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <section className="content-card">
      <div className="section-title">
        <div>
          <h2>본사 관리자 대시보드</h2>
          <p>
            본사에서 전체 조직·회원·상품·주문·결제 현황을 통합 조회합니다.
          </p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "조회 중..." : "현황 새로고침"}
        </button>
      </div>

      {loading && (
        <p className="message">대시보드 현황을 불러오는 중입니다.</p>
      )}

      {errorMessage && (
        <p className="error-message">{errorMessage}</p>
      )}

      {!loading && !errorMessage && summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {dashboardItems.map((item) => (
            <div
              key={item.key}
              style={{
                padding: "20px",
                border: "1px solid #dbe5f3",
                borderRadius: "14px",
                backgroundColor: "#f7faff",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  color: "#66758f",
                  fontSize: "14px",
                }}
              >
                {item.label}
              </p>

              <strong
                style={{
                  color: "#142a50",
                  fontSize: "28px",
                }}
              >
                {summary[item.key] ?? 0}
                <span
                  style={{
                    marginLeft: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {item.unit}
                </span>
              </strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}