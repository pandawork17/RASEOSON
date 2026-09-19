import { useState, useMemo } from "react";
import { CommunitySidebar } from "../components/CommunitySidebar";

const PAGE_SIZE = 10;

function parseQnADate(item) {
  if (!item) return 0;
  if (item.date) {
    const cleaned = item.date.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".").filter(Boolean);
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const time = new Date(y, m, d).getTime();
      return isNaN(time) ? (item.id || 0) : time * 1000 + (item.id || 0);
    }
  }
  return item.id || 0;
}

export function QnAListPage({
  qnaList = [],
  onGoWrite,
  onSelectQnA,
  onNotice,
}) {
  const [selectedTab, setSelectedTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc': 최신순(내림차순), 'asc': 과거순(오름차순)

  const tabs = [
    { key: "ALL", label: "전체", count: qnaList.length },
    { key: "상품 문의", label: "상품 문의", count: qnaList.filter((q) => q.category === "상품 문의").length },
    { key: "주문/결제", label: "주문/결제", count: qnaList.filter((q) => q.category === "주문/결제").length },
    { key: "배송", label: "배송", count: qnaList.filter((q) => q.category === "배송").length },
    { key: "교환/반품", label: "교환/반품", count: qnaList.filter((q) => q.category === "교환/반품").length },
  ];

  // 카테고리 필터링
  const filteredItems = useMemo(() => {
    return selectedTab === "ALL"
      ? qnaList
      : qnaList.filter((q) => q.category === selectedTab);
  }, [qnaList, selectedTab]);

  // 작성일 순 정렬
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const valA = parseQnADate(a);
      const valB = parseQnADate(b);
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
  }, [filteredItems, sortOrder]);

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  const handleRowClick = (item) => {
    if (!item.isMine) {
      window.alert("비밀글은 작성자 본인만 열람할 수 있습니다.");
      return;
    }
    if (onSelectQnA) {
      onSelectQnA(item);
    }
  };

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

            {/* 필터 탭 & 정렬 버튼 바 */}
            <div className="qna-filter-row">
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

              {/* 작성일 정렬 버튼 */}
              <div className="qna-sort-controls">
                <button
                  type="button"
                  className="btn-qna-sort"
                  onClick={toggleSort}
                  title="작성일 정렬 순서 변경"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                    <path d="m3 16 4 4 4-4" />
                    <path d="M7 20V4" />
                    <path d="m21 8-4-4-4 4" />
                    <path d="M17 4v16" />
                  </svg>
                  <span>작성일 {sortOrder === "desc" ? "내림차순 (최신순) ↓" : "오름차순 (과거순) ↑"}</span>
                </button>
              </div>
            </div>

            {/* Q&A 게시판 테이블 */}
            <div className="qna-table-container">
              <table className="figma-qna-table">
                <thead>
                  <tr>
                    <th className="th-num">번호</th>
                    <th className="th-title">제목</th>
                    <th className="th-cat">카테고리</th>
                    <th className="th-date" onClick={toggleSort} style={{ cursor: "pointer" }} title="클릭 시 정렬 순서 변경">
                      작성일 {sortOrder === "desc" ? "▼" : "▲"}
                    </th>
                    <th className="th-date">수정일</th>
                    <th className="th-status">답변 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="td-empty">
                        등록된 문의 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pagedItems.map((item) => (
                      <tr
                        key={item.id}
                        className={`clickable-qna-row ${item.isMine ? "my-post-row" : "secret-post-row"}`}
                        onClick={() => handleRowClick(item)}
                      >
                        <td className="td-num">{item.id}</td>
                        <td className="td-title">
                          {item.isMine ? (
                            <>
                              <span className="badge-my-post">내 글</span>
                              <span className="qna-table-title-link">{item.title}</span>
                              {item.photos && item.photos.length > 0 && (
                                <span className="qna-icon-photo" title="사진 첨부됨"> 📷</span>
                              )}
                            </>
                          ) : (
                            <span className="qna-secret-title">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#887d74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", marginRight: "5px" }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                              </svg>
                              비밀글입니다.
                            </span>
                          )}
                        </td>
                        <td className="td-cat">{item.category}</td>
                        <td className="td-date">{item.date}</td>
                        <td className="td-date" style={{ color: item.updatedDate ? "#6d5548" : "#999" }}>
                          {item.updatedDate || "-"}
                        </td>
                        <td className="td-status">
                          {item.status === "COMPLETED" ? (
                            <span className="badge-qna-done">답변완료</span>
                          ) : (
                            <span className="badge-qna-waiting">답변대기</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 (10개 초과 시 2페이지 버튼 자동 생성) */}
            <div className="figma-pagination">
              <button
                type="button"
                className="page-nav-arrow"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                className="page-nav-arrow"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  <li>고객님의 개인정보 보호를 위해 본인이 작성한 글 이외의 문의글은 비밀글로 처리됩니다.</li>
                  <li>자주 묻는 질문(FAQ)을 확인하시면 더 빠르게 해결하실 수 있습니다.</li>
                  <li>주문/배송 관련 문의는 주문번호를 함께 기재해주시면 더욱 빠른 처리가 가능합니다.</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn-go-faq"
                onClick={() => alert("자주 묻는 질문(FAQ) 페이지를 준비 중입니다.")}
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
