import { useState } from "react";
import { CommunitySidebar } from "../components/CommunitySidebar";

export function QnAWritePage({
  editingQnA = null,
  onCancel,
  onSubmit,
  onNotice,
}) {
  const isEdit = Boolean(editingQnA);

  const [category, setCategory] = useState(editingQnA?.category || "상품 문의");
  const [title, setTitle] = useState(editingQnA?.title || "");
  const [content, setContent] = useState(editingQnA?.content || "");
  const [photos, setPhotos] = useState(
    editingQnA?.photos
      ? editingQnA.photos.map((p) => (typeof p === "string" ? { name: "첨부사진", url: p } : p))
      : []
  );
  const [secretYn, setSecretYn] = useState(editingQnA?.secret_yn || "N");
  const [submitting, setSubmitting] = useState(false);

  const categories = ["상품 문의", "주문/결제", "배송", "교환/반품", "환불", "기타"];

  const getPhotoSrc = (p) => {
    const url = typeof p === "string" ? p : (p?.url || "");
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
      return url;
    }
    return `http://127.0.0.1:8000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (photos.length + files.length > 5) {
      alert("사진은 최대 5장까지 첨부할 수 있습니다.");
      return;
    }

    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            name: file.name,
            url: event.target.result,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((newPhotos) => {
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    });

    e.target.value = "";
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("문의 내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      if (isEdit) {
        onSubmit({
          ...editingQnA,
          category,
          title: title.trim(),
          content: content.trim(),
          photos,
          secret_yn: secretYn,
        });
        alert("문의가 정상적으로 수정되었습니다.");
      } else {
        onSubmit({
          category,
          title: title.trim(),
          content: content.trim(),
          photos,
          secret_yn: secretYn,
          date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }),
          status: "WAITING",
        });
        alert("문의가 정상적으로 등록되었습니다.");
      }
      setSubmitting(false);
    }, 250);
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 커뮤니티 <span>&gt;</span> Q&A <span>&gt;</span> {isEdit ? "문의 수정" : "문의하기"}
        </div>

        <div className="mypage-layout">
          <CommunitySidebar active="qna" onNotice={onNotice} onQnA={onCancel} />

          <section className="mypage-content qna-write-section">
            <div className="mypage-heading">
              <div>
                <h1>{isEdit ? "Q&A 문의 수정" : "Q&A 문의하기"}</h1>
                <p>궁금하신 내용을 남겨주시면 빠르게 답변드리겠습니다.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="figma-form-table">
                {/* 문의 유형 */}
                <div className="figma-form-row">
                  <div className="figma-form-th required">문의 유형</div>
                  <div className="figma-form-td qna-category-radios">
                    {categories.map((cat) => (
                      <label key={cat} className="radio-reason-item">
                        <input
                          type="radio"
                          name="qnaCategory"
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => setCategory(e.target.value)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 제목 */}
                <div className="figma-form-row">
                  <div className="figma-form-th required">제목</div>
                  <div className="figma-form-td">
                    <input
                      type="text"
                      className="input-text-standard"
                      placeholder="제목을 입력해주세요."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 문의 내용 */}
                <div className="figma-form-row">
                  <div className="figma-form-th required">문의 내용</div>
                  <div className="figma-form-td">
                    <div className="textarea-wrap">
                      <textarea
                        rows={6}
                        maxLength={1000}
                        placeholder="문의 내용을 자세히 입력해주세요.&#10;(예: 상품명, 주문번호, 문의 내용을 구체적으로 작성해주시면 더 정확한 답변이 가능합니다.)"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                      />
                      <div className="char-count">{content.length} / 1000</div>
                    </div>
                  </div>
                </div>

                {/* 사진 첨부 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">사진 첨부 (선택)</div>
                  <div className="figma-form-td photo-td-col">
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

                    {/* 5개 슬롯 그리드 */}
                    <div className="qna-photo-slots-grid">
                      {[0, 1, 2, 3, 4].map((slotIdx) => {
                        const photo = photos[slotIdx];
                        return (
                          <div className="photo-slot-box" key={slotIdx}>
                            {photo ? (
                              <div className="slot-preview">
                                <img src={getPhotoSrc(photo)} alt={`첨부 ${slotIdx + 1}`} />
                                <button
                                  type="button"
                                  className="btn-slot-remove"
                                  onClick={() => removePhoto(slotIdx)}
                                >
                                  &times;
                                </button>
                              </div>
                            ) : (
                              <label className="slot-empty-label">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b7aa9d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                  <circle cx="12" cy="13" r="4" />
                                  <line x1="19" y1="8" x2="19" y2="12" />
                                  <line x1="17" y1="10" x2="21" y2="10" />
                                </svg>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  style={{ display: "none" }}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 공개 설정 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">공개 설정</div>
                  <div className="figma-form-td">
                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", color: "#4a3b32" }}>
                      <input
                        type="checkbox"
                        checked={secretYn === "Y"}
                        onChange={(e) => setSecretYn(e.target.checked ? "Y" : "N")}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <span>비밀글로 문의하기 (작성자와 관리자만 내용을 확인할 수 있습니다)</span>
                    </label>
                  </div>
                </div>
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
                  {submitting ? (isEdit ? "수정 중..." : "등록 중...") : (isEdit ? "수정 완료" : "등록하기")}
                </button>
              </div>
            </form>

            {/* 하단 확인 안내 박스 */}
            <div className="qna-notice-banner-bottom">
              <div className="notice-banner-title">
                <span className="icon">ⓘ</span>
                <strong>문의하기 전 확인해주세요!</strong>
              </div>
              <ul className="notice-banner-list">
                <li>답변은 영업일 기준 1~2일 이내에 등록되며, 마이페이지 &gt; Q&A에서 확인하실 수 있습니다.</li>
                <li>주문, 배송, 교환/반품 관련 문의는 주문번호를 함께 남겨주시면 더 정확한 답변이 가능합니다.</li>
                <li>운영시간: 평일 09:00 - 18:00 (주말, 공휴일 휴무)</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
