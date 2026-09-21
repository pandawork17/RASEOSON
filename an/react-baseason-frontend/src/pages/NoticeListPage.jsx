import { useState, useMemo } from "react";
import { CommunitySidebar } from "../components/CommunitySidebar";

const PAGE_SIZE = 10;

export function NoticeListPage({
  noticeList = [],
  onSelectNotice,
  onQnA,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // 고정 공지를 맨 위로, 그 다음 최신 ID 순 정렬
  const sortedNotices = useMemo(() => {
    return [...noticeList].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.id - a.id;
    });
  }, [noticeList]);

  const totalPages = Math.max(1, Math.ceil(sortedNotices.length / PAGE_SIZE));
  const pagedNotices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedNotices.slice(start, start + PAGE_SIZE);
  }, [sortedNotices, currentPage]);

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 커뮤니티 <span>&gt;</span> 공지사항
        </div>

        <div className="mypage-layout">
          <CommunitySidebar active="notice" onNotice={() => {}} onQnA={onQnA} />

          <section className="mypage-content notice-list-section">
            <div className="mypage-heading">
              <div>
                <h1>공지사항</h1>
                <p>베이스시즌의 새로운 소식과 중요한 안내사항을 확인하세요.</p>
              </div>
            </div>

            {/* 공지사항 테이블 */}
            <div className="qna-table-container notice-table-container">
              <table className="figma-qna-table figma-notice-table">
                <thead>
                  <tr>
                    <th className="th-notice-num" style={{ width: "90px" }}>번호</th>
                    <th className="th-notice-title" style={{ textAlign: "left", paddingLeft: "24px" }}>제목</th>
                    <th className="th-notice-date" style={{ width: "150px" }}>작성일</th>
                    <th className="th-notice-views" style={{ width: "110px" }}>조회수</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedNotices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="td-empty">
                        등록된 공지사항이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    pagedNotices.map((notice) => (
                      <tr
                        key={notice.id}
                        className={`clickable-qna-row ${notice.isPinned ? "pinned-notice-row" : ""}`}
                        onClick={() => onSelectNotice(notice)}
                      >
                        <td className="td-num">
                          {notice.isPinned ? (
                            <span className="badge-notice-pinned">공지</span>
                          ) : (
                            notice.id
                          )}
                        </td>
                        <td className="td-title" style={{ textAlign: "left", paddingLeft: "24px" }}>
                          <span className={`notice-title-text ${notice.isPinned ? "pinned-text" : ""}`}>
                            {notice.title}
                          </span>
                        </td>
                        <td className="td-date">{notice.date}</td>
                        <td className="td-views">{Number(notice.views).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
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

            {/* 하단 확인 안내 박스 (피그마 이미지와 완벽 일치) */}
            <div className="qna-bottom-notice-card notice-bottom-banner">
              <div className="notice-left-info">
                <div className="notice-title">
                  <span className="icon" style={{ fontSize: "16px", fontWeight: "bold" }}>!</span>
                  <strong>꼭 확인해주세요!</strong>
                </div>
                <ul className="notice-items">
                  <li>중요한 공지사항은 상단에 고정되어 표시됩니다.</li>
                  <li>서비스 이용에 관한 변경 사항은 사전 안내 후 적용됩니다.</li>
                  <li>추가 문의사항은 Q&A를 통해 남겨주세요.</li>
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

