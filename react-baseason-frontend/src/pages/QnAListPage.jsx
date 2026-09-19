import { useState } from "react";
import { CommunitySidebar } from "../components/CommunitySidebar";

const INITIAL_QNA_ITEMS = [
  { id: 12, title: "사이즈 문의드립니다.", category: "상품 문의", date: "2025. 06. 11", status: "COMPLETED" },
  { id: 11, title: "결제 취소 가능한가요?", category: "주문/결제", date: "2025. 06. 10", status: "WAITING" },
  { id: 10, title: "교환 신청은 어떻게 하나요?", category: "교환/반품", date: "2025. 06. 08", status: "COMPLETED" },
  { id: 9, title: "배송 언제 되나요?", category: "배송", date: "2025. 06. 07", status: "COMPLETED" },
  { id: 8, title: "재입고 일정이 궁금합니다.", category: "상품 문의", date: "2025. 06. 05", status: "COMPLETED" },
  { id: 7, title: "주문한 상품 색상 변경 가능할까요?", category: "주문/결제", date: "2025. 06. 03", status: "COMPLETED" },
  { id: 6, title: "환불 처리 기간은 얼마나 걸리나요?", category: "교환/반품", date: "2025. 05. 30", status: "COMPLETED" },
  { id: 5, title: "상품 실측 사이즈 문의입니다.", category: "상품 문의", date: "2025. 05. 28", status: "COMPLETED" },
  { id: 4, title: "선물 포장 가능한가요?", category: "기타", date: "2025. 05. 25", status: "COMPLETED" },
];

export function QnAListPage({
  qnaList = INITIAL_QNA_ITEMS,
  onGoWrite,
  onNotice,
}) {
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { key: "ALL", label: "전체", count: qnaList.length },
    { key: "상품 문의", label: "상품 문의", count: qnaList.filter((q) => q.category === "상품 문의").length },
    { key: "주문/결제", label: "주문/결제", count: qnaList.filter((q) => q.category === "주문/결제").length },
    { key: "배송", label: "배송", count: qnaList.filter((q) => q.category === "배송").length },
    { key: "교환/반품", label: "교환/반품", count: qnaList.filter((q) => q.category === "교환/반품").length },
  ];

  const filteredItems = selectedTab === "ALL"
    ? qnaList
    : qnaList.filter((q) => q.category === selectedTab);

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 커뮤니티 <span>&gt;</span> Q&A
        </div>

        <div className="mypage-layout">
          <CommunitySidebar active="qna" onNotice={onNotice} onQnA={() => {}} />

          <section className="mypage-content qna-list-section">
            <div className="mypage-heading qna-header-row">
              <div>
                <h1>Q&A</h1>
                <p>궁금하신 내용을 남겨주시면 빠르게 답변드리겠습니다.</p>
              </div>
              <button
                type="button"
                className="btn-add-qna-top"
                onClick={onGoWrite}
              >
                + 문의하기
              </button>
            </div>

            {/* 탭 목록 */}
            <div className="qna-tab-filter-bar">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`qna-tab-btn ${selectedTab === tab.key ? "active" : ""}`}
                  onClick={() => {
                    setSelectedTab(tab.key);
                    setCurrentPage(1);
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Q&A 게시판 테이블 */}
            <div className="qna-table-container">
              <table className="figma-qna-table">
                <thead>
                  <tr>
                    <th className="th-num">번호</th>
                    <th className="th-title">제목</th>
                    <th className="th-cat">카테고리</th>
                    <th className="th-date">작성일</th>
                    <th className="th-status">답변 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="td-num">{item.id}</td>
                      <td className="td-title">{item.title}</td>
                      <td className="td-cat">{item.category}</td>
                      <td className="td-date">{item.date}</td>
                      <td className="td-status">
                        {item.status === "COMPLETED" ? (
                          <span className="badge-qna-done">답변완료</span>
                        ) : (
                          <span className="badge-qna-waiting">답변대기</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="figma-pagination">
              <button
                type="button"
                className="page-nav-arrow"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>
              <button
                type="button"
                className={`page-num-btn ${currentPage === 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(1)}
              >
                1
              </button>
              <button
                type="button"
                className={`page-num-btn ${currentPage === 2 ? "active" : ""}`}
                onClick={() => setCurrentPage(2)}
              >
                2
              </button>
              <button
                type="button"
                className="page-nav-arrow"
                onClick={() => setCurrentPage(2)}
              >
                &gt;
              </button>
            </div>

            {/* 하단 안내 박스 */}
            <div className="qna-bottom-notice-card">
              <div className="notice-left-info">
                <div className="notice-title">
                  <span className="icon">ⓘ</span>
                  <strong>문의하기 전 확인해주세요!</strong>
                </div>
                <ul className="notice-items">
                  <li>주문, 배송, 교환/반품 관련 문의는 주문번호를 함께 남겨주시면 더 정확한 답변이 가능합니다.</li>
                  <li>운영시간: 평일 09:00 - 18:00 (주말, 공휴일 휴무)</li>
                  <li>자주 묻는 질문에서 원하시는 답을 빠르게 찾을 수 있습니다.</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn-go-faq"
                onClick={() => alert("FAQ 페이지 준비 중입니다.")}
              >
                자주 묻는 질문 바로가기 &gt;
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
