import { MyPageSidebar } from "../components/MyPageSidebar";

export function MyQnAPage({
  qnaList = [],
  authUser,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onAddress,
  onGoWrite,
  onSelectQnA,
  onEdit,
  onDelete,
  onLogout,
}) {
  const myQnAs = qnaList.filter((q) => q.isMine);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("정말 이 문의를 삭제하시겠습니까?")) {
      onDelete(id);
    }
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    onEdit(item);
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 1:1 문의내역
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="my-qna"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={onAddress}
            onMyQnA={() => {}}
            onLogout={onLogout}
          />

          <section className="mypage-content">
            <div className="mypage-heading qna-header-row">
              <div>
                <h1>1:1 문의내역</h1>
                <p>고객님께서 직접 작성하신 1:1 문의 내역을 확인하실 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="btn-add-qna-top"
                onClick={onGoWrite}
              >
                + 1:1 문의하기
              </button>
            </div>

            {myQnAs.length === 0 ? (
              <div className="figma-empty-card">
                <div className="empty-icon-wrap">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a89a8d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>작성하신 1:1 문의 내역이 없습니다.</h3>
                <p>상품, 주문, 배송 등 궁금하신 점이 있으시면 언제든지 문의를 남겨주세요.</p>
                <button
                  type="button"
                  className="btn-add-address-primary"
                  onClick={onGoWrite}
                >
                  1:1 문의 작성하기
                </button>
              </div>
            ) : (
              <div className="qna-table-container">
                <table className="figma-qna-table">
                  <thead>
                    <tr>
                      <th className="th-num">번호</th>
                      <th className="th-title">제목</th>
                      <th className="th-cat">카테고리</th>
                      <th className="th-date">작성일</th>
                      <th className="th-date">수정일</th>
                      <th className="th-status">답변 상태</th>
                      <th className="th-action" style={{ width: "110px" }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myQnAs.map((item) => (
                      <tr
                        key={item.id}
                        className="clickable-qna-row"
                        onClick={() => onSelectQnA(item)}
                      >
                        <td className="td-num">{item.id}</td>
                        <td className="td-title">
                          <span className="badge-my-post" style={{ marginRight: "6px" }}>내 글</span>
                          <span className="qna-table-title-link">{item.title}</span>
                          {item.photos && item.photos.length > 0 && (
                            <span className="qna-icon-photo" title="사진 첨부됨"> 📷</span>
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
                        <td className="td-action" onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              type="button"
                              className="btn-table-edit"
                              onClick={(e) => handleEdit(item, e)}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className="btn-table-del"
                              onClick={(e) => handleDelete(item.id, e)}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
