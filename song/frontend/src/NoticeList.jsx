import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

const pageStyle = {
  minHeight: "100vh",
  background: "#EDE7DC",
  padding: 28,
  fontFamily: "Arial, sans-serif",
  color: "#1D1A18",
  boxSizing: "border-box",
};

const brownButton = {
  background: "#796252",
  color: "#fff",
  border: 0,
  padding: "8px 12px",
  cursor: "pointer",
  borderRadius: 3,
};

function formatDate(value) {
  return String(value || "").replace("T", " ").slice(0, 16);
}

function emptyForm() {
  return { title: "", content: "", is_pinned: "N", image: "" };
}

export default function NoticeList({ currentUser, onBack }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState("list");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  function loadNotices() {
    setLoading(true);
    setErrorMessage("");

    fetch(`${API_URL}/api/notices`)
      .then((response) => {
        if (!response.ok) throw new Error("공지사항 목록을 불러오지 못했습니다.");
        return response.json();
      })
      .then((data) => {
        setNotices(data);
        setLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    loadNotices();
  }, []);

  function openDetail(noticeId) {
    setLoading(true);
    setErrorMessage("");

    fetch(`${API_URL}/api/notices/${noticeId}`)
      .then((response) => {
        if (!response.ok) throw new Error("공지사항 상세 내용을 불러오지 못했습니다.");
        return response.json();
      })
      .then((data) => {
        setSelectedNotice(data);
        setPage("detail");
        setLoading(false);
      })
      .catch((error) => {
        setErrorMessage(error.message);
        setLoading(false);
      });
  }

  function openWrite() {
    setForm(emptyForm());
    setErrorMessage("");
    setPage("write");
  }

  function openEdit() {
    setForm({
      title: selectedNotice.title,
      content: selectedNotice.content,
      is_pinned: selectedNotice.is_pinned,
      image: selectedNotice.image || "",
    });
    setErrorMessage("");
    setPage("edit");
  }

  function returnToList() {
    setPage("list");
    setSelectedNotice(null);
    loadNotices();
  }

  async function uploadImage(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/notices/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const data = await response.json();
      setForm((previous) => ({ ...previous, image: data.image_url }));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function submitNotice(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage("제목과 내용은 반드시 입력해야 합니다.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const isEdit = page === "edit";
    const url = isEdit
      ? `${API_URL}/api/notices/${selectedNotice.notice_id}`
      : `${API_URL}/api/notices`;

    const body = isEdit
      ? {
          title: form.title.trim(),
          content: form.content.trim(),
          is_pinned: form.is_pinned,
          image: form.image.trim() || null,
        }
      : {
          title: form.title.trim(),
          content: form.content.trim(),
          author_id: 1,
          org_id: 1,
          is_pinned: form.is_pinned,
          image: form.image.trim() || null,
        };

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(isEdit ? "공지사항 수정에 실패했습니다." : "공지사항 등록에 실패했습니다.");
      }

      if (isEdit) {
        setSelectedNotice({
          ...selectedNotice,
          ...body,
          image: body.image,
        });
        setPage("detail");
      } else {
        setPage("list");
        loadNotices();
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (page === "write" || page === "edit") {
    return (
      <main style={pageStyle}>
        <NoticeHeader currentUser={currentUser} onBack={onBack} />
        <NoticeEditor
          title={page === "edit" ? "공지사항 수정" : "공지사항 작성"}
          form={form}
          setForm={setForm}
          saving={saving}
          errorMessage={errorMessage}
          onCancel={() => (page === "edit" ? setPage("detail") : returnToList())}
          onSubmit={submitNotice}
          onUpload={uploadImage}
        />
      </main>
    );
  }

  if (page === "detail" && selectedNotice) {
    return (
      <main style={pageStyle}>
        <NoticeHeader currentUser={currentUser} onBack={onBack} />

        <div style={{ maxWidth: 1000, margin: "22px auto" }}>
          <button onClick={returnToList} style={brownButton}>
            ← 공지사항 목록
          </button>

          <section
            style={{
              background: "#FAF9F6",
              marginTop: 16,
              padding: 28,
              borderTop: "4px solid #796252",
            }}
          >
            <p style={{ color: "#796252", fontSize: 11, fontWeight: "bold", margin: 0 }}>
              NOTICE DETAIL
            </p>

            <h1 style={{ fontSize: 27, margin: "10px 0 18px" }}>
              {selectedNotice.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 18,
                flexWrap: "wrap",
                padding: "13px 0",
                borderTop: "1px solid #DDD3C8",
                borderBottom: "1px solid #DDD3C8",
                color: "#6F6259",
                fontSize: 13,
              }}
            >
              <span>작성자: {selectedNotice.author_name}</span>
              <span>소속: {selectedNotice.org_name}</span>
              <span>작성일: {formatDate(selectedNotice.created_at)}</span>
              <span>조회수: {selectedNotice.view_count}</span>
            </div>

            {selectedNotice.image && (
              <img
                src={selectedNotice.image}
                alt="공지사항 이미지"
                style={{ display: "block", maxWidth: "100%", margin: "24px auto 0" }}
              />
            )}

            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                fontSize: 15,
                minHeight: 180,
                padding: "24px 0",
              }}
            >
              {selectedNotice.content}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={openEdit} style={brownButton}>
                수정
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <NoticeHeader currentUser={currentUser} onBack={onBack} />

      <div style={{ maxWidth: 1200, margin: "22px auto" }}>
        <section
          style={{
            background: "#FAF9F6",
            padding: 24,
            borderTop: "4px solid #796252",
          }}
        >
          <p style={{ color: "#796252", fontSize: 11, fontWeight: "bold", margin: 0 }}>
            NOTICE MANAGEMENT
          </p>
          <h1 style={{ fontSize: 26, margin: "8px 0" }}>공지사항</h1>
          <p style={{ color: "#6F6259", fontSize: 13, margin: 0 }}>
            베이스시즌의 새로운 소식과 중요 안내사항을 확인하세요.
          </p>

          <button onClick={openWrite} style={{ ...brownButton, marginTop: 18 }}>
            + 공지사항 작성
          </button>
        </section>

        <section style={{ background: "#FAF9F6", padding: 24, marginTop: 16 }}>
          {loading && <p>공지사항을 불러오는 중입니다.</p>}
          {errorMessage && <p style={{ color: "#A24D32" }}>오류: {errorMessage}</p>}

          {!loading && !errorMessage && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["번호", "제목", "작성일", "조회수"].map((title) => (
                    <th
                      key={title}
                      style={{
                        padding: 12,
                        textAlign: "left",
                        borderBottom: "2px solid #CDBFAF",
                        color: "#6F6259",
                        fontSize: 13,
                      }}
                    >
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice.notice_id}>
                    <td style={{ padding: 13, borderBottom: "1px solid #E5DDD4" }}>
                      {notice.is_pinned === "Y" ? "공지" : notice.notice_id}
                    </td>
                    <td
                      style={{
                        padding: 13,
                        borderBottom: "1px solid #E5DDD4",
                        fontWeight: notice.is_pinned === "Y" ? "bold" : "normal",
                      }}
                    >
                      <button
                        onClick={() => openDetail(notice.notice_id)}
                        style={{
                          border: 0,
                          padding: 0,
                          background: "none",
                          cursor: "pointer",
                          color: "#1D1A18",
                          fontWeight: "inherit",
                          fontSize: "inherit",
                          textAlign: "left",
                        }}
                      >
                        {notice.title}
                      </button>
                    </td>
                    <td style={{ padding: 13, borderBottom: "1px solid #E5DDD4" }}>
                      {formatDate(notice.created_at)}
                    </td>
                    <td style={{ padding: 13, borderBottom: "1px solid #E5DDD4" }}>
                      {notice.view_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

function NoticeHeader({ currentUser, onBack }) {
  return (
    <header
      style={{
        background: "#796252",
        color: "#fff",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <b style={{ letterSpacing: 2 }}>BASESEASON · HQ ANALYTICS</b>
      <span>
        👤 {currentUser.user_name}
        <button
          onClick={onBack}
          style={{ marginLeft: 12, border: 0, padding: "6px 10px", cursor: "pointer" }}
        >
          본사 현황으로 돌아가기
        </button>
      </span>
    </header>
  );
}

function NoticeEditor({ title, form, setForm, saving, errorMessage, onCancel, onSubmit, onUpload }) {
  const [dragging, setDragging] = useState(false);

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    onUpload(event.dataTransfer.files[0]);
  }

  return (
    <div style={{ maxWidth: 1000, margin: "22px auto" }}>
      <button onClick={onCancel} style={brownButton}>
        ← 공지사항 목록
      </button>

      <form
        onSubmit={onSubmit}
        style={{
          background: "#FAF9F6",
          marginTop: 16,
          padding: 28,
          borderTop: "4px solid #796252",
        }}
      >
        <p style={{ color: "#796252", fontSize: 11, fontWeight: "bold", margin: 0 }}>
          NOTICE EDITOR
        </p>
        <h1 style={{ fontSize: 27, margin: "10px 0 22px" }}>{title}</h1>

        {errorMessage && <p style={{ color: "#A24D32" }}>오류: {errorMessage}</p>}

        <label style={{ display: "block", fontWeight: "bold", marginTop: 16 }}>제목</label>
        <input
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          placeholder="공지 제목을 입력하세요"
          style={inputStyle}
        />

        <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>내용</label>
        <textarea
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
          placeholder="공지 내용을 입력하세요"
          rows={10}
          style={{ ...inputStyle, resize: "vertical" }}
        />

        <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>상단 고정</label>
        <select
          value={form.is_pinned}
          onChange={(event) => setForm({ ...form, is_pinned: event.target.value })}
          style={{ marginTop: 8, padding: 10, border: "1px solid #CDBFAF" }}
        >
          <option value="N">일반 공지</option>
          <option value="Y">중요 공지로 상단 고정</option>
        </select>

        <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>공지 이미지</label>
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            marginTop: 8,
            padding: 24,
            textAlign: "center",
            border: `2px dashed ${dragging ? "#796252" : "#CDBFAF"}`,
            background: dragging ? "#F1EBE4" : "#fff",
          }}
        >
          이미지를 이곳에 끌어 놓으세요.
          <br />
          또는 아래에서 파일을 선택하세요.
          <br />
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={(event) => onUpload(event.target.files[0])}
            style={{ marginTop: 12 }}
          />
        </div>

        {form.image && (
          <div style={{ marginTop: 16 }}>
            <b>이미지 미리보기</b>
            <img
              src={form.image}
              alt="업로드 미리보기"
              style={{ display: "block", maxWidth: "100%", maxHeight: 320, marginTop: 10 }}
            />
            <label
              style={{
                ...brownButton,
                display: "inline-block",
                marginTop: 10,
                marginRight: 8,
                cursor: "pointer",
              }}
            >
              이미지 변경
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={(event) => onUpload(event.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
            <button
              type="button"
              onClick={() => setForm({ ...form, image: "" })}
              style={{ ...brownButton, background: "#A24D32", marginTop: 10 }}
            >
              이미지 삭제
            </button>
            <p style={{ margin: "8px 0 0", color: "#6F6259", fontSize: 12 }}>
              이미지 삭제 후 반드시 수정 저장을 눌러야 실제로 반영됩니다.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <button type="submit" disabled={saving} style={brownButton}>
            {saving ? "처리 중..." : title === "공지사항 수정" ? "수정 저장" : "등록"}
          </button>
          <button type="button" onClick={onCancel} style={{ ...brownButton, background: "#A68F79" }}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 8,
  padding: 12,
  border: "1px solid #CDBFAF",
  fontSize: 15,
};
