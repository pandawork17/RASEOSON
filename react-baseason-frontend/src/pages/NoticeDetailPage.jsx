import { CommunitySidebar } from "../components/CommunitySidebar";

export function NoticeDetailPage({
  notice,
  onBack,
  onQnA,
}) {
  if (!notice) {
    return (
      <main className="mypage">
        <div className="mypage-inner">
          <p>공지사항을 찾을 수 없습니다.</p>
          <button type="button" onClick={onBack} className="btn-action-cancel">
            목록으로
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 커뮤니티 <span>&gt;</span> 공지사항 <span>&gt;</span> 공지 상세
        </div>

        <div className="mypage-layout">
          <CommunitySidebar active="notice" onNotice={onBack} onQnA={onQnA} />

          <section className="mypage-content notice-detail-section">
            <div className="mypage-heading">
              <div>
                <h1>공지사항</h1>
                <p>베이스시즌의 새로운 소식과 중요한 안내사항을 확인하세요.</p>
              </div>
            </div>

            <div className="qna-detail-card notice-detail-card">
              {/* 헤더 */}
              <div className="qna-detail-header">
                <div className="qna-detail-meta-top">
                  {notice.isPinned ? (
                    <span className="badge-notice-pinned">중요공지</span>
                  ) : (
                    <span className="qna-category-tag">[안내]</span>
                  )}
                </div>
                <h2 className="qna-detail-title">{notice.title}</h2>
                <div className="qna-detail-meta-bottom">
                  <span>작성자: <strong>{notice.author || "베이스시즌"}</strong></span>
                  <span>작성일: <strong>{notice.date}</strong></span>
                  <span>조회수: <strong>{Number(notice.views).toLocaleString()}</strong></span>
                </div>
              </div>

              {/* 본문 */}
              <div className="qna-detail-body notice-body-text">
                {notice.content}
              </div>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="qna-detail-actions" style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="btn-action-cancel"
                onClick={onBack}
              >
                목록으로
              </button>

              <button
                type="button"
                className="btn-action-submit"
                onClick={onQnA}
              >
                1:1 문의하기 &gt;
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
