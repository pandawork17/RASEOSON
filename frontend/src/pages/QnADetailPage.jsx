import { CommunitySidebar } from "../components/CommunitySidebar";

export function QnADetailPage({
  qna,
  onBack,
  onEdit,
  onDelete,
  onNotice,
}) {
  if (!qna) {
    return (
      <main className="mypage">
        <div className="mypage-inner">
          <p>문의 내역을 찾을 수 없습니다.</p>
          <button type="button" onClick={onBack} className="btn-action-cancel">
            목록으로
          </button>
        </div>
      </main>
    );
  }

  // 비밀글 가드 (본인 글이 아닌 경우)
  if (!qna.isMine) {
    return (
      <main className="mypage">
        <div className="mypage-inner">
          <div className="figma-empty-card" style={{ margin: "40px auto", maxWidth: "500px" }}>
            <div className="empty-icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a89a8d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3>비밀글입니다.</h3>
            <p>이 문의는 비공개 설정되어 있어 작성자 본인만 조회할 수 있습니다.</p>
            <button type="button" className="btn-add-address-primary" onClick={onBack}>
              Q&A 목록으로 돌아가기
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleDelete = () => {
    if (window.confirm("정말 이 문의를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) {
      onDelete(qna.id);
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 커뮤니티 <span>&gt;</span> Q&A <span>&gt;</span> 문의 상세
        </div>

        <div className="mypage-layout">
          <CommunitySidebar active="qna" onNotice={onNotice} onQnA={onBack} />

          <section className="mypage-content qna-detail-section">
            <div className="mypage-heading">
              <div>
                <h1>Q&A 문의 상세</h1>
                <p>작성하신 문의 내용과 답변을 확인하실 수 있습니다.</p>
              </div>
            </div>

            <div className="qna-detail-card">
              {/* 문의 헤더 */}
              <div className="qna-detail-header">
                <div className="qna-detail-meta-top">
                  <span className="qna-category-tag">[{qna.category || "일반 문의"}]</span>
                  {qna.status === "COMPLETED" ? (
                    <span className="badge-qna-done">답변완료</span>
                  ) : (
                    <span className="badge-qna-waiting">답변대기</span>
                  )}
                  {qna.isMine && (
                    <span className="badge-my-post">내가 작성한 글</span>
                  )}
                </div>
                <h2 className="qna-detail-title">{qna.title}</h2>
                <div className="qna-detail-meta-bottom">
                  <span>작성자: <strong>{qna.author || "고객님"}</strong></span>
                  <span>작성일: <strong>{qna.date}</strong></span>
                  {qna.updatedDate && (
                    <span>수정일: <strong style={{ color: "#6d5548" }}>{qna.updatedDate}</strong> (수정됨)</span>
                  )}
                  <span>문의번호: <strong>#{qna.id}</strong></span>
                </div>
              </div>

              {/* 문의 본문 */}
              <div className="qna-detail-body">
                {qna.content || "등록된 상세 내용이 없습니다."}
              </div>

              {/* 첨부 사진 */}
              {qna.photos && qna.photos.length > 0 && (
                <div className="qna-detail-photos">
                  {qna.photos.map((photo, idx) => {
                    const rawUrl = typeof photo === "string" ? photo : (photo?.url || "");
                    if (!rawUrl) return null;
                    const isAbsolute =
                      rawUrl.startsWith("http://") ||
                      rawUrl.startsWith("https://") ||
                      rawUrl.startsWith("data:") ||
                      rawUrl.startsWith("blob:");
                    const displayUrl = isAbsolute
                      ? rawUrl
                      : `http://127.0.0.1:8000${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
                    return (
                      <a
                        key={idx}
                        href={displayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="클릭하여 원본 이미지 보기"
                      >
                        <img
                          src={displayUrl}
                          alt={`첨부 이미지 ${idx + 1}`}
                          className="qna-detail-photo-img"
                        />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* 관리자 답변 영역 */}
              {qna.status === "COMPLETED" ? (
                <div className="qna-answer-section">
                  <div className="qna-answer-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="qna-answer-badge">답변</span>
                      <strong>베이스시즌 고객센터</strong>
                    </div>
                    {qna.answerDate && (
                      <span className="qna-answer-date">{qna.answerDate}</span>
                    )}
                  </div>
                  <div className="qna-answer-body">
                    {qna.answer || "안녕하세요 고객님, 문의해주신 내용 확인 후 신속히 조치해 드리겠습니다."}
                  </div>
                </div>
              ) : (
                <div className="qna-waiting-notice-section">
                  <span className="icon">⏳</span>
                  <span>현재 담당자가 문의 내용을 확인하고 있습니다. 빠른 시일 내에 성심껏 답변해 드리겠습니다.</span>
                </div>
              )}
            </div>

            {/* 하단 버튼들 */}
            <div className="qna-detail-actions">
              <button
                type="button"
                className="btn-action-cancel"
                onClick={onBack}
              >
                목록으로
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-qna-delete"
                  onClick={handleDelete}
                >
                  삭제하기
                </button>
                <button
                  type="button"
                  className="btn-action-submit"
                  onClick={() => onEdit(qna)}
                >
                  수정하기
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
