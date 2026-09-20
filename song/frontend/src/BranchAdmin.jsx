// src/pages/BranchAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './BranchAdmin.css';

// ==========================================
// 기존 커스텀 드롭다운 
// ==========================================
function CustomDropdown({ currentStatus, onStatusChange, statusStyles }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (status) => {
    onStatusChange(status);
    setIsOpen(false);
  };

  const currentStyle = statusStyles[currentStatus] || { bg: '#f3f4f6', text: '#333' };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '5px 12px',
          borderRadius: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backgroundColor: currentStyle.bg,
          color: currentStyle.text,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '13px',
          border: `1px solid ${currentStyle.text}33`
        }}
      >
        {currentStatus} <span style={{ fontSize: '10px' }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '5px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 10,
          width: '130px',
          overflow: 'hidden'
        }}>
          {Object.keys(statusStyles).map(status => (
            <div
              key={status}
              onClick={() => handleSelect(status)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: statusStyles[status].text,
                backgroundColor: 'white',
                borderBottom: '1px solid #eee',
                fontSize: '13px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              {status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 💡 통합된 본사 공지사항 전용 컴포넌트
// ==========================================
const API_URL = "http://127.0.0.1:8000";

const brownButton = {
  background: "#796252",
  color: "#fff",
  border: 0,
  padding: "8px 16px",
  cursor: "pointer",
  borderRadius: 4,
  fontWeight: "bold"
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  marginTop: 8,
  padding: 12,
  border: "1px solid #CDBFAF",
  fontSize: 15,
  borderRadius: 4
};

function formatDate(value) {
  return String(value || "").replace("T", " ").slice(0, 16);
}

function emptyForm() {
  return { title: "", content: "", is_pinned: "N", image: "" };
}

function NoticeManagement({ selectedBranch }) {
  const loadInitialNotices = () => {
    const savedNotices = localStorage.getItem('baseason_notices');
    if (savedNotices) {
      return JSON.parse(savedNotices); 
    }
    return [
      { notice_id: 1, title: "[필독] 26FW 신상품 입고 및 발주 안내", is_pinned: "Y", created_at: "2026-09-15 10:00", view_count: 125, author_name: "본사 관리팀", org_name: "본사", content: "각 지사에서는 첨부된 26FW 카탈로그를 확인하시고 미리 발주 신청 바랍니다.", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80" },
      { notice_id: 2, title: "추석 연휴 배송 일정 안내", is_pinned: "Y", created_at: "2026-09-10 14:20", view_count: 342, author_name: "본사 물류팀", org_name: "본사", content: "연휴 기간 배송 마감은 9월 20일 오후 2시입니다.", image: "" },
      { notice_id: 3, title: "이예빈", is_pinned: "N", created_at: "2026-09-17 06:26", view_count: 0, author_name: "관리자", org_name: "본사", content: "내용 없음", image: "" },
      { notice_id: 4, title: "원이", is_pinned: "N", created_at: "2026-09-17 06:28", view_count: 0, author_name: "관리자", org_name: "본사", content: "내용 없음", image: "" },
      { notice_id: 5, title: "비니", is_pinned: "N", created_at: "2026-09-17 06:34", view_count: 0, author_name: "관리자", org_name: "본사", content: "내용 없음", image: "" },
      { notice_id: 6, title: "윈터", is_pinned: "N", created_at: "2026-09-17 06:35", view_count: 0, author_name: "관리자", org_name: "본사", content: "내용 없음", image: "" },
      { notice_id: 7, title: "프로미스나인 백지헌", is_pinned: "N", created_at: "2026-09-17 06:36", view_count: 0, author_name: "관리자", org_name: "본사", content: "내용 없음", image: "" }
    ];
  };

  const [notices, setNotices] = useState(loadInitialNotices);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState("list");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  // 💡 페이징 처리를 위한 상태 (현재 페이지 번호)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 한 페이지당 10개씩 표시

  const fileInputRef = useRef(null); 

  useEffect(() => {
    localStorage.setItem('baseason_notices', JSON.stringify(notices));
  }, [notices]);

  function openDetail(notice) {
    setNotices(prevNotices => {
      const updatedNotices = prevNotices.map(n => 
        n.notice_id === notice.notice_id 
          ? { ...n, view_count: n.view_count + 1 } 
          : n
      );
      
      const viewedNotice = updatedNotices.find(n => n.notice_id === notice.notice_id);
      setSelectedNotice(viewedNotice);
      return updatedNotices;
    });
    setPage("detail");
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
  }

  function handleFileUpload(file) {
    if (!file) return;
    const tempImageUrl = URL.createObjectURL(file); 
    setForm(prev => ({ ...prev, image: tempImageUrl }));
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    handleFileUpload(event.dataTransfer.files[0]);
  }

  async function submitNotice(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage("제목과 내용은 반드시 입력해야 합니다.");
      return;
    }
    setSaving(true);
    
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTimeout(() => {
      if (page === "write") {
        const newNotice = {
          notice_id: Date.now(),
          title: form.title,
          is_pinned: form.is_pinned,
          created_at: createdAt,
          view_count: 0, 
          author_name: "관리자",
          org_name: selectedBranch,
          content: form.content,
          image: form.image 
        };
        setNotices(prev => [newNotice, ...prev]);
        setCurrentPage(1); // 글 쓰면 1페이지로 이동
      } else if (page === "edit") {
        setNotices(prev => prev.map(n => 
          n.notice_id === selectedNotice.notice_id 
            ? { ...n, title: form.title, content: form.content, is_pinned: form.is_pinned, image: form.image }
            : n
        ));
      }

      alert("공지사항이 성공적으로 저장되었습니다!");
      setSaving(false);
      returnToList();
    }, 300);
  }

  // ==========================================
  // 💡 페이징 및 정렬(번호 부여) 로직
  // ==========================================
  // 1. 전체 데이터를 1)공지 여부 2)작성일 내림차순(최신순)으로 정렬
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.is_pinned === "Y" && b.is_pinned !== "Y") return -1;
    if (a.is_pinned !== "Y" && b.is_pinned === "Y") return 1;
    
    const dateA = new Date(a.created_at.replace(" ", "T")).getTime();
    const dateB = new Date(b.created_at.replace(" ", "T")).getTime();
    return dateB - dateA; // 내림차순 (최신글이 위로)
  });

  // 3. 현재 페이지에 보여줄 데이터만 슬라이스 (10개씩)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedNotices.slice(indexOfFirstItem, indexOfLastItem);

  // 4. 총 페이지 수 계산
  const totalPages = Math.ceil(sortedNotices.length / itemsPerPage);


  // 화면 분기: 작성 & 수정 페이지
  if (page === "write" || page === "edit") {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>📢 본사 공지사항 {page === 'edit' ? '수정' : '작성'}</h2>
        <div style={{ maxWidth: 900 }}>
          <button onClick={returnToList} style={{ ...brownButton, marginBottom: 15 }}>
            ← 공지사항 목록
          </button>

          <form onSubmit={submitNotice} style={{ background: "#fff", padding: 30, borderRadius: 8, borderTop: "4px solid #796252", border: '1px solid #eee' }}>
            {errorMessage && <p style={{ color: "#A24D32" }}>오류: {errorMessage}</p>}

            <label style={{ display: "block", fontWeight: "bold" }}>제목</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="공지 제목을 입력하세요"
              style={inputStyle}
            />

            <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>내용</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="공지 내용을 입력하세요"
              rows={10}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>상단 고정</label>
            <select
              value={form.is_pinned}
              onChange={(e) => setForm({ ...form, is_pinned: e.target.value })}
              style={{ marginTop: 8, padding: 10, border: "1px solid #CDBFAF", borderRadius: 4 }}
            >
              <option value="N">일반 공지</option>
              <option value="Y">중요 공지로 상단 고정</option>
            </select>

            <label style={{ display: "block", fontWeight: "bold", marginTop: 25, marginBottom: 10 }}>공지 이미지</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                padding: "30px",
                textAlign: "center",
                border: `2px dashed ${dragging ? "#796252" : "#ccc"}`,
                background: dragging ? "#F1EBE4" : "#fcfcfc",
                borderRadius: "8px",
                color: "#666",
                transition: "all 0.2s ease"
              }}
            >
              <p style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
                이미지를 이곳에 끌어 놓으세요.<br />
                또는 아래에서 파일을 선택하세요.
              </p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                style={{
                  padding: "6px 15px",
                  border: "1px solid #999",
                  background: "#fff",
                  cursor: "pointer",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}
              >
                파일 선택
              </button>
            </div>

            {form.image && (
              <div style={{ marginTop: 25 }}>
                <b style={{ display: 'block', marginBottom: 15 }}>이미지 미리보기</b>
                <img
                  src={form.image}
                  alt="업로드 미리보기"
                  style={{ display: "block", maxWidth: "300px", maxHeight: "400px", borderRadius: "8px", border: "1px solid #eee", objectFit: "cover" }}
                />
                
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button type="button" onClick={() => fileInputRef.current.click()} style={{ ...brownButton, padding: "6px 15px", fontSize: "13px" }}>이미지 변경</button>
                  <button type="button" onClick={() => setForm({ ...form, image: "" })} style={{ ...brownButton, background: "#A24D32", padding: "6px 15px", fontSize: "13px" }}>이미지 삭제</button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 35, borderTop: '1px solid #eee', paddingTop: 20 }}>
              <button type="submit" disabled={saving} style={brownButton}>
                {saving ? "처리 중..." : page === "edit" ? "수정 저장" : "등록"}
              </button>
              <button type="button" onClick={returnToList} style={{ ...brownButton, background: "#A68F79" }}>
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 화면 분기: 상세 페이지
  if (page === "detail" && selectedNotice) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>📢 본사 공지사항 상세</h2>
        <div style={{ maxWidth: 900 }}>
          <button onClick={returnToList} style={{ ...brownButton, marginBottom: 15 }}>
            ← 목록으로
          </button>

          <section style={{ background: "#fff", padding: 30, borderRadius: 8, borderTop: "4px solid #796252", border: '1px solid #eee' }}>
            <h1 style={{ fontSize: 24, margin: "0 0 15px", color: '#333' }}>
              {selectedNotice.is_pinned === 'Y' && <span style={{color: '#d9534f', marginRight: 8}}>[중요]</span>}
              {selectedNotice.title}
            </h1>

            <div style={{ display: "flex", gap: 20, padding: "15px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", color: "#666", fontSize: 13, marginBottom: 25 }}>
              <span><strong>작성자:</strong> {selectedNotice.author_name}</span>
              <span><strong>작성일:</strong> {formatDate(selectedNotice.created_at)}</span>
              <span><strong>조회수:</strong> {selectedNotice.view_count}</span>
            </div>

            {selectedNotice.image && (
              <img src={selectedNotice.image} alt="첨부" style={{ display: "block", maxWidth: "100%", maxHeight: "500px", objectFit: "contain", marginBottom: "25px", borderRadius: "4px" }} />
            )}

            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15, minHeight: 150, color: '#333' }}>
              {selectedNotice.content}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 15 }}>
              <button onClick={openEdit} style={brownButton}>수정</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 💡 수정됨: 최신 글부터 1번으로 시작하도록 번호 추적
  // 1 + (현재 페이지 이전까지 나온 일반 게시글 개수) = 현재 페이지의 시작 번호
  let currentUnpinnedCount = 1 + sortedNotices.slice(0, indexOfFirstItem).filter(n => n.is_pinned !== "Y").length;

  // 화면 분기: 기본 목록
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📢 본사 공지사항</h2>
        <button onClick={openWrite} style={brownButton}>
          + 공지사항 작성
        </button>
      </div>

      <table className="admin-table">
        <thead style={{ backgroundColor: '#f9f9fc' }}>
          <tr>
            <th>번호</th>
            <th style={{ width: '50%' }}>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>불러오는 중...</td></tr>
          ) : currentItems.length === 0 ? (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>등록된 공지가 없습니다.</td></tr>
          ) : (
            currentItems.map((notice) => {
              const isPinned = notice.is_pinned === "Y";
              // 💡 수정됨: 공지는 '공지', 일반 글은 최신글부터 1, 2, 3... 순으로 부여 (++)
              const displayNum = isPinned ? "공지" : currentUnpinnedCount++;

              return (
                <tr key={notice.notice_id}>
                  <td style={{ fontWeight: isPinned ? "bold" : "normal", color: isPinned ? "#d9534f" : "#666" }}>
                    {displayNum}
                  </td>
                  <td style={{ textAlign: 'left', fontWeight: isPinned ? "bold" : "normal", color: '#333' }}>
                    <span onClick={() => openDetail(notice)} style={{ cursor: 'pointer', borderBottom: '1px solid transparent' }} onMouseEnter={e => e.target.style.borderBottom='1px solid #333'} onMouseLeave={e => e.target.style.borderBottom='1px solid transparent'}>
                      {notice.title}
                    </span>
                  </td>
                  <td style={{ color: '#666' }}>{notice.author_name}</td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{formatDate(notice.created_at)}</td>
                  <td style={{ color: '#888' }}>{notice.view_count}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* 페이징 네비게이션 버튼 영역 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ padding: '5px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#ccc' : '#333' }}
          >
            &lt;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              style={{
                padding: '5px 12px',
                background: currentPage === num ? '#7b6352' : '#fff',
                color: currentPage === num ? '#fff' : '#333',
                border: currentPage === num ? '1px solid #7b6352' : '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: currentPage === num ? 'bold' : 'normal'
              }}
            >
              {num}
            </button>
          ))}

          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ padding: '5px 10px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#ccc' : '#333' }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}


// ---------------------------------------------
// 메인 지사 관리자 컴포넌트
// ---------------------------------------------
function BranchAdmin() {
  const [activeTab, setActiveTab] = useState('notices'); 
  const [selectedBranch, setSelectedBranch] = useState('서울지사');
  const [statsViewMode, setStatsViewMode] = useState('graph'); 
  const [inquiryFilter, setInquiryFilter] = useState('전체');

  const [replyingInquiry, setReplyingInquiry] = useState(null);
  const [replyText, setReplyText] = useState(""); 

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const orderStatusStyles = {
    '결제 완료': { bg: '#e6f4ea', text: '#0d652d' },
    '배송준비중': { bg: '#fef7e0', text: '#b06000' },
    '배송중': { bg: '#e8f0fe', text: '#1a73e8' },
    '배송완료': { bg: '#f3f4f6', text: '#374151' },
    '취소': { bg: '#fef2f2', text: '#991b1b' },          
    '교환': { bg: '#f3e8ff', text: '#6b21a8' },          
    '반품': { bg: '#ffedd5', text: '#9a3412' },          
    '환불대기': { bg: '#fce8e6', text: '#c5221f' },
    '환불 처리중': { bg: '#fce8e6', text: '#a50e0e' },
    '환불 처리 완료': { bg: '#e5e7eb', text: '#6b7280' },
  };

  const restockStatusStyles = {
    '승인 대기': { bg: '#fef7e0', text: '#f29900' },
    '발주 승인': { bg: '#e6f4ea', text: '#1e8e3e' },
    '배송 중': { bg: '#e8f0fe', text: '#1a73e8' },
    '입고 완료': { bg: '#f3f4f6', text: '#333333' },
  };

  const inquiryStatusStyles = {
    '미답변': { bg: '#fef2f2', text: '#991b1b' }, 
    '답변완료': { bg: '#e6f4ea', text: '#0d652d' }, 
  };

  const inventoryData = {
    '서울지사': [
      { id: 1, productCode: 'CT-26FW-001', name: '가을 클래식 트렌치 코트', stock: 2, regularPrice: 120000, salePrice: 89000, uploadDate: '2026-09-01 10:15' },
      { id: 2, productCode: 'SH-26FW-005', name: '오버핏 옥스포드 셔츠', stock: 15, regularPrice: 45000, salePrice: 45000, uploadDate: '2026-09-05 14:30' },
    ],
    '대구지사': [
      { id: 1, productCode: 'CT-26FW-001', name: '가을 클래식 트렌치 코트', stock: 10, regularPrice: 120000, salePrice: 89000, uploadDate: '2026-09-01 10:15' },
      { id: 3, productCode: 'PT-26FW-012', name: '와이드 슬랙스 팬츠', stock: 3, regularPrice: 60000, salePrice: 54000, uploadDate: '2026-09-10 09:00' },
    ]
  };

  const [orders, setOrders] = useState({
    '서울지사': [
      { orderNo: 'ORD-260916-01', product: '오버핏 옥스포드 셔츠', qty: 1, buyer: 'user123', receiver_phone: '010-9696-9696', zipcode: '06236', shipping_address1: 'Seoul', shipping_address2: 'Test', ordered_at: '2026-09-16 10:30', status: '결제 완료' },
      { orderNo: 'ORD-260916-02', product: '가을 클래식 트렌치 코트', qty: 1, buyer: 'guest99', receiver_phone: '010-4444-4444', zipcode: '56123', shipping_address1: '전북특별자치도 전주시', shipping_address2: '101동 101호', ordered_at: '2026-09-16 11:00', status: '배송준비중' },
    ],
    '대구지사': [
      { orderNo: 'ORD-260916-03', product: '와이드 슬랙스 팬츠', qty: 2, buyer: 'daegu_king', receiver_phone: '010-5555-5555', zipcode: '48000', shipping_address1: '부산광역시 해운대구', shipping_address2: '202동 202호', ordered_at: '2026-09-16 09:15', status: '결제 완료' },
    ]
  });

  const [inquiries, setInquiries] = useState({
    '서울지사': [
      { id: 1, author: '김*수', userId: 'user123', type: '배송', title: '배송 언제 시작되나요?', content: '지난주에 주문했는데 언제쯤 출발할까요? 급해서 문의 남깁니다.', status: '미답변', date: '2026-09-16', reply: '' },
      { id: 2, author: '이*희', userId: 'guest99', type: '교환/반품', title: '사이즈 교환 문의합니다.', content: 'L사이즈로 주문했는데 너무 커서 M사이즈로 교환하고 싶습니다.', status: '답변완료', date: '2026-09-15', reply: '안녕하세요 고객님, 교환 접수 도와드렸습니다. 택배 기사님이 1~2일 내로 방문하실 예정입니다.' },
      { id: 3, author: '박*주', userId: 'nanjoo_p', type: '상품 문의', title: '블랙 코트 소재를 알려주세요', content: '울 함유량이 어떻게 되나요? 까슬거리지 않는지 궁금합니다.', status: '미답변', date: '2026-09-16', reply: '' },
      { id: 4, author: '최*민', userId: 'somin_c', type: '주문·결제', title: '결제 취소가 가능한가요?', content: '방금 결제했는데 마음이 바뀌어서 취소하고 싶습니다.', status: '답변완료', date: '2026-09-14', reply: '고객님, 해당 주문건 결제 취소 완료되었습니다. 카드사에 따라 2~3일 소요될 수 있습니다.' },
      { id: 5, author: '정*기', userId: 'junki_dev', type: '기타', title: '회원 정보 변경 문의', content: '휴대폰 번호가 바뀌었는데 어디서 수정하나요?', status: '미답변', date: '2026-09-13', reply: '' },
      { id: 6, author: '강*진', userId: 'kang12', type: '상품 문의', title: '브라운 코트 실제 색상 문의', content: '화면보다 많이 어두운 편인가요?', status: '답변완료', date: '2026-09-12', reply: '조명에 따라 다를 수 있으나, 화면과 거의 유사한 부드러운 브라운 컬러입니다.' },
      { id: 7, author: '윤*아', userId: 'yoon_ah', type: '상품 문의', title: '사이즈 추천 부탁드립니다.', content: '170cm에 60kg인데 M과 L중에 어떤게 나을까요?', status: '미답변', date: '2026-09-11', reply: '' },
      { id: 8, author: '임*호', userId: 'lim_ho', type: '주문·결제', title: '무통장 입금 확인 문의', content: '어제 입금했는데 아직 입금전이라고 뜨네요.', status: '미답변', date: '2026-09-12', reply: '' },
      { id: 9, author: '한*지', userId: 'han_ji', type: '주문·결제', title: '쿠폰과 적립금 동시 사용', content: '쿠폰이랑 적립금 같이 못쓰나요?', status: '답변완료', date: '2026-09-10', reply: '네, 아쉽게도 정책상 쿠폰과 적립금의 중복 사용은 불가합니다.' },
      { id: 10, author: '송*우', userId: 'song_woo', type: '배송', title: '배송 조회가 되지 않습니다.', content: '운송장 번호가 떴는데 조회가 안돼요.', status: '미답변', date: '2026-09-15', reply: '' },
    ],
    '대구지사': [
      { id: 11, author: '김*현', userId: 'kim_h', type: '배송', title: '제주도 추가 배송비 문의', content: '제주도인데 도선료가 추가로 붙나요?', status: '답변완료', date: '2026-09-12', reply: '네, 제주 및 도서산간 지역은 3,000원의 추가 배송비가 발생합니다.' },
      { id: 12, author: '박*성', userId: 'park_s', type: '교환/반품', title: '반품 배송비 확인 요청', content: '단순 변심 반품인데 배송비는 얼마 동봉해야 하나요?', status: '미답변', date: '2026-09-14', reply: '' },
      { id: 13, author: '최*영', userId: 'choi_y', type: '교환/반품', title: '교환 상품 재고 문의', content: 'M사이즈로 교환하고 싶은데 재고 있나요?', status: '답변완료', date: '2026-09-11', reply: '네, M사이즈 재고 여유 있습니다. 바로 접수 도와드리겠습니다.' },
      { id: 14, author: '이*민', userId: 'lee_m', type: '기타', title: '회원 탈퇴 방법 문의', content: '어디서 탈퇴하나요?', status: '답변완료', date: '2026-09-10', reply: '마이페이지 하단의 [회원 탈퇴] 버튼을 통해 진행하실 수 있습니다.' },
      { id: 15, author: '정*훈', userId: 'jung_h', type: '기타', title: '앱 알림 수신 설정 문의', content: '푸시 알림 끄고 싶어요.', status: '미답변', date: '2026-09-09', reply: '' },
    ]
  });

  const popularProducts = {
    '서울지사': [
      { id: 1, rank: 1, name: '오버핏 옥스포드 셔츠', sold: 42, views: 150, statusLabel: '판매 우수', ratio: '50%', insightLabel: '주 구매 연령', insightValue: '20대 (40%)', barColor: '#7b6352' },
      { id: 2, rank: 2, name: '가을 클래식 트렌치 코트', sold: 38, views: 120, statusLabel: '판매 우수', ratio: '30%', insightLabel: '주 구매 연령', insightValue: '30대 (45%)', barColor: '#bdae9c' },
    ],
    '대구지사': [
      { id: 1, rank: 1, name: '와이드 슬랙스 팬츠', sold: 55, views: 210, statusLabel: '판매 우수', ratio: '65%', insightLabel: '주 구매 연령', insightValue: '20대 (55%)', barColor: '#7b6352' },
      { id: 2, rank: 2, name: '가을 클래식 트렌치 코트', sold: 20, views: 80, statusLabel: '판매 부진', ratio: '8%', insightLabel: '구매가 가장 적은 연령', insightValue: '10대 (3%)', barColor: '#c5221f' },
    ]
  };

  const ageDemographics = {
    '서울지사': [
      { id: 'age-20', label: '20대', ratio: '45%', barColor: '#7b6352' },
      { id: 'age-30', label: '30대', ratio: '35%', barColor: '#bdae9c' },
      { id: 'age-40', label: '40대 이상', ratio: '12%', barColor: '#dcdcdc' },
      { id: 'age-10', label: '10대', ratio: '8%', barColor: '#eaeaea' },
    ],
    '대구지사': [
      { id: 'age-20', label: '20대', ratio: '60%', barColor: '#7b6352' },
      { id: 'age-30', label: '30대', ratio: '20%', barColor: '#bdae9c' },
      { id: 'age-40', label: '40대 이상', ratio: '15%', barColor: '#dcdcdc' },
      { id: 'age-10', label: '10대', ratio: '5%', barColor: '#eaeaea' },
    ]
  };

  const hqProducts = [
    { id: 101, code: 'HQ-PAD-001', name: '[본사] 26FW 프리미엄 패딩', wholesalePrice: 150000 },
    { id: 102, code: 'HQ-PNT-002', name: '[본사] 기모 조거 팬츠', wholesalePrice: 20000 },
  ];

  const [restockHistory, setRestockHistory] = useState({
    '서울지사': [],
    '대구지사': []
  });

  const currentInventory = inventoryData[selectedBranch] || [];
  const currentOrders = orders[selectedBranch] || [];
  const currentInquiries = inquiries[selectedBranch] || []; 
  const currentPopular = popularProducts[selectedBranch] || [];
  const currentAgeData = ageDemographics[selectedBranch] || [];
  const currentRestockHistory = restockHistory[selectedBranch] || [];

  const filteredInquiries = inquiryFilter === '전체' 
    ? currentInquiries 
    : currentInquiries.filter(q => q.type === inquiryFilter);

  const getCategoryCount = (type) => {
    if (type === '전체') return currentInquiries.length;
    return currentInquiries.filter(q => q.type === type).length;
  };

  const handlePriceChange = (id, newPrice) => {
    alert(`[${selectedBranch}] 상품 ID ${id}의 판매가가 ${newPrice}원으로 변경되었습니다!`);
  };

  const handleStockRequest = (hqProduct, qty) => {
    alert(`[${selectedBranch}]에서 본사로 [${hqProduct.name}] ${qty}개 발주를 신청했습니다.`);
    const today = new Date().toISOString().split('T')[0];

    const newRequest = {
      id: Date.now(),
      date: today,
      code: hqProduct.code,
      name: hqProduct.name,
      qty: qty,
      status: '승인 대기'
    };

    setRestockHistory(prev => ({
      ...prev,
      [selectedBranch]: [...(prev[selectedBranch] || []), newRequest]
    }));
  };

  const handleRestockStatusChange = (orderId, newStatus) => {
    setRestockHistory(prev => {
      const updatedHistory = prev[selectedBranch].map(req => 
        req.id === orderId ? { ...req, status: newStatus } : req
      );
      return { ...prev, [selectedBranch]: updatedHistory };
    });
  };

  const handleOrderStatusChange = (orderNo, newStatus) => {
    setOrders(prev => {
      const updatedOrders = prev[selectedBranch].map(order => 
        order.orderNo === orderNo ? { ...order, status: newStatus } : order
      );
      return { ...prev, [selectedBranch]: updatedOrders };
    });
  };

  const handleInquiryStatusChange = (inquiryId, newStatus) => {
    setInquiries(prev => {
      const updatedInquiries = prev[selectedBranch].map(inquiry => 
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
      );
      return { ...prev, [selectedBranch]: updatedInquiries };
    });
  };

  const openReplyPage = (inquiry) => {
    setReplyingInquiry(inquiry);
    setReplyText(inquiry.reply || ""); 
  };

  const submitReply = () => {
    if (!replyText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }
    
    setInquiries(prev => {
      const updatedInquiries = prev[selectedBranch].map(inquiry => 
        inquiry.id === replyingInquiry.id 
          ? { ...inquiry, reply: replyText, status: '답변완료' } 
          : inquiry
      );
      return { ...prev, [selectedBranch]: updatedInquiries };
    });

    alert("답변이 성공적으로 등록되었습니다.");
    setReplyingInquiry(null); 
    setReplyText("");
  };

  const handleLogout = () => {
    alert('관리자 모드에서 로그아웃 되었습니다.');
    navigate('/'); 
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setReplyingInquiry(null);
  };
  const handleBranchChange = (branchName) => {
    setSelectedBranch(branchName);
    setReplyingInquiry(null);
  };

  return (
    <div className="admin-container">
      {/* 사이드바 영역 */}
      {isSidebarOpen && (
        <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#eeddd1',
                  padding: 0,
                  lineHeight: '1'
                }}
                title="메뉴 닫기"
              >
                ☰
              </button>
              <h2 style={{ margin: 0 }}>BASEASON 지점관리자</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
              <button 
                onClick={() => handleBranchChange('서울지사')}
                style={{
                  flex: 1, padding: '10px 5px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                  backgroundColor: selectedBranch === '서울지사' ? '#bdae9c' : 'transparent',
                  color: selectedBranch === '서울지사' ? '#fff' : '#ccc',
                  border: selectedBranch === '서울지사' ? 'none' : '1px solid #bdae9c'
                }}
              >
                서울지사
              </button>
              <button 
                onClick={() => handleBranchChange('대구지사')}
                style={{
                  flex: 1, padding: '10px 5px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                  backgroundColor: selectedBranch === '대구지사' ? '#bdae9c' : 'transparent',
                  color: selectedBranch === '대구지사' ? '#fff' : '#ccc',
                  border: selectedBranch === '대구지사' ? 'none' : '1px solid #bdae9c'
                }}
              >
                대구지사
              </button>
            </div>
            <ul>
              <li className={activeTab === 'notices' ? 'active' : ''} onClick={() => handleTabChange('notices')}>📢 본사 공지사항</li>
              <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => handleTabChange('inventory')}>📦 재고 및 할인율 관리</li>
              <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabChange('orders')}>📝 고객 주문 관리</li>
              <li className={activeTab === 'inquiries' ? 'active' : ''} onClick={() => handleTabChange('inquiries')}>💬 고객 문의 관리</li>
              <li className={activeTab === 'b2b-order' ? 'active' : ''} onClick={() => handleTabChange('b2b-order')}>🏢 본사 상품 발주</li>
              <li className={activeTab === 'restock-history' ? 'active' : ''} onClick={() => handleTabChange('restock-history')}>📋 발주 신청 내역</li>
              <li className={activeTab === 'stats' ? 'active' : ''} onClick={() => handleTabChange('stats')}>🔥 지사 인기 상품</li>
            </ul>
          </div>

          <div style={{ marginTop: 'auto', paddingBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(0, 0, 0, 0.15)',
                color: '#eeddd1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'}
            >
              🚪 로그아웃
            </button>
          </div>
        </aside>
      )}

      <main className="admin-main">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#555',
                padding: '0 10px 0 0',
                lineHeight: '1'
              }}
              title="메뉴 열기"
            >
              ☰
            </button>
          )}
          <h2 style={{ margin: 0, fontSize: '22px', color: '#333' }}>
            {selectedBranch} 관리 대시보드
          </h2>
        </div>

        <div className="widget-container">
          <div className="widget-box">
            <p>{selectedBranch} 신규 주문 (C)</p>
            <h3>{currentOrders.length}건</h3>
          </div>
          <div className="widget-box">
            <p>미답변 문의</p>
            <h3 style={{ color: '#d9534f' }}>{currentInquiries.filter(q => q.status === '미답변').length}건</h3>
          </div>
          <div className="widget-box">
            <p>안전재고 부족 (B)</p>
            <h3 className="danger">{currentInventory.filter(item => item.stock < 5).length}건</h3>
          </div>
        </div>

        <div className="content-box">
          
          {activeTab === 'notices' && (
            <NoticeManagement selectedBranch={selectedBranch} />
          )}

          {activeTab === 'inventory' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>📦 {selectedBranch} 재고 조회 및 상품 관리</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>업로드 일시</th>
                    <th>고유번호</th>
                    <th>상품명</th>
                    <th>정상가</th>
                    <th>현재 재고</th>
                    <th>판매가(할인가) 설정</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInventory.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontSize: '12px', color: '#666' }}>{item.uploadDate}</td>
                      <td style={{ color: '#888', fontSize: '13px' }}>{item.productCode}</td>
                      <td style={{ fontWeight: 'bold', color: '#333' }}>{item.name}</td>
                      <td>{item.regularPrice.toLocaleString()}원</td>
                      <td style={{ color: item.stock < 5 ? '#d9534f' : '#333', fontWeight: item.stock < 5 ? 'bold' : 'normal' }}>
                        {item.stock}개 {item.stock < 5 && '(부족)'}
                      </td>
                      <td>
                        <input type="number" className="price-input" defaultValue={item.salePrice} id={`price-${item.id}`} />
                        <button className="btn-apply" onClick={() => handlePriceChange(item.id, document.getElementById(`price-${item.id}`).value)}>적용</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>📝 {selectedBranch} 고객 주문 목록 확인</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>주문 일시</th>
                    <th>주문번호</th>
                    <th>주문상품</th>
                    <th>수량</th>
                    <th>주문자 ID</th>
                    <th>수령인 전화번호</th>
                    <th>배송지 (우편번호)</th>
                    <th>처리상태 (클릭하여 변경)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '12px', color: '#666' }}>{order.ordered_at}</td>
                      <td>{order.orderNo}</td>
                      <td>{order.product}</td>
                      <td>{order.qty}</td>
                      <td>{order.buyer}</td>
                      <td>{order.receiver_phone}</td>
                      <td style={{ fontSize: '12px', lineHeight: '1.4', textAlign: 'left' }}>
                        <span style={{ color: '#888' }}>[{order.zipcode}]</span><br/>
                        {order.shipping_address1} {order.shipping_address2}
                      </td>
                      <td>
                        <CustomDropdown 
                          currentStatus={order.status} 
                          onStatusChange={(newStatus) => handleOrderStatusChange(order.orderNo, newStatus)} 
                          statusStyles={orderStatusStyles}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              {replyingInquiry ? (
                <div style={{ padding: '10px' }}>
                  <h2 style={{ marginBottom: '5px' }}>Q&A 답변하기</h2>
                  <p style={{ color: '#777', fontSize: '14px', marginBottom: '25px' }}>
                    고객이 남긴 문의 내역을 확인하고 답변을 작성해 주세요.
                  </p>
                  
                  <div style={{ borderTop: '2px solid #5d554e', borderBottom: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>문의 번호</div>
                      <div style={{ padding: '15px', color: '#333' }}>No. {replyingInquiry.id}</div>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>문의 유형</div>
                      <div style={{ padding: '15px', color: '#1a73e8', fontWeight: 'bold' }}>[{replyingInquiry.type}]</div>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>작성자 / ID</div>
                      <div style={{ padding: '15px', color: '#333' }}>
                        {replyingInquiry.author} <span style={{ color: '#ccc', margin: '0 10px' }}>|</span> <span style={{ color: '#888' }}>{replyingInquiry.userId}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>작성 일자</div>
                      <div style={{ padding: '15px', color: '#666' }}>{replyingInquiry.date}</div>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>제목</div>
                      <div style={{ padding: '15px', color: '#111', fontWeight: 'bold' }}>{replyingInquiry.title}</div>
                    </div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>문의 내용</div>
                      <div style={{ padding: '20px 15px', color: '#333', lineHeight: '1.6', minHeight: '80px' }}>
                        {replyingInquiry.content}
                      </div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>
                        답변 작성 <span style={{ color: '#d9534f' }}>*</span>
                      </div>
                      <div style={{ padding: '15px', flex: 1 }}>
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="고객에게 안내할 답변 내용을 자세히 입력해주세요."
                          style={{
                            width: '100%',
                            height: '150px',
                            padding: '15px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            resize: 'none',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    <button 
                      onClick={() => setReplyingInquiry(null)}
                      style={{ padding: '12px 40px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#555' }}
                    >
                      취소하기
                    </button>
                    <button 
                      onClick={submitReply}
                      style={{ padding: '12px 40px', backgroundColor: '#7b6352', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#fff' }}
                    >
                      답변 등록하기
                    </button>
                  </div>

                </div>
              ) : (
                <>
                  <h2 style={{ marginBottom: '20px' }}>💬 {selectedBranch} 1:1 문의 내역</h2>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {['전체', '상품 문의', '주문·결제', '배송', '교환/반품', '기타'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setInquiryFilter(type)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          border: inquiryFilter === type ? 'none' : '1px solid #ddd',
                          backgroundColor: inquiryFilter === type ? '#7b6352' : '#fff',
                          color: inquiryFilter === type ? '#fff' : '#555',
                        }}
                      >
                        {type} ({getCategoryCount(type)})
                      </button>
                    ))}
                  </div>

                  <table className="admin-table">
                    <thead style={{ backgroundColor: '#f9f9fc' }}>
                      <tr>
                        <th>번호</th>
                        <th>분류</th>
                        <th style={{ width: '35%' }}>제목</th>
                        <th>작성자</th>
                        <th>아이디(ID)</th>
                        <th>상태</th>
                        <th>작성일</th>
                        <th>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInquiries.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                            해당 분류에 속하는 문의 내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredInquiries.map(inquiry => (
                          <tr key={inquiry.id}>
                            <td style={{ color: '#999', fontSize: '12px' }}>{inquiry.id}</td>
                            <td style={{ color: '#1a73e8', fontWeight: 'bold' }}>{inquiry.type}</td>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                              {inquiry.title}
                            </td>
                            <td style={{ color: '#333' }}>{inquiry.author}</td>
                            <td style={{ color: '#888', fontSize: '13px' }}>{inquiry.userId}</td>
                            <td>
                              <span style={{ color: inquiry.status === '미답변' ? '#991b1b' : '#555', fontWeight: inquiry.status === '미답변' ? 'bold' : 'normal' }}>
                                {inquiry.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '12px', color: '#666' }}>{inquiry.date}</td>
                            <td>
                              <button 
                                onClick={() => openReplyPage(inquiry)}
                                style={{
                                  backgroundColor: inquiry.status === '미답변' ? '#5d554e' : '#fff',
                                  color: inquiry.status === '미답변' ? '#fff' : '#555',
                                  border: inquiry.status === '미답변' ? 'none' : '1px solid #ccc',
                                  padding: '5px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  fontSize: '12px'
                                }}
                              >
                                {inquiry.status === '미답변' ? '답변하기' : '답변수정'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {activeTab === 'b2b-order' && (
            <div>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🏢 본사 상품 카탈로그</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>고유코드</th>
                    <th>본사 상품명</th>
                    <th>도매가 (공급가)</th>
                    <th>발주 수량</th>
                    <th>발주 신청</th>
                  </tr>
                </thead>
                <tbody>
                  {hqProducts.map(hq => (
                    <tr key={hq.id}>
                      <td style={{ color: '#777', fontWeight: 'bold' }}>{hq.code}</td>
                      <td>{hq.name}</td>
                      <td>{hq.wholesalePrice.toLocaleString()}원</td>
                      <td>
                        <input type="number" className="price-input" defaultValue={10} min="1" id={`hq-qty-${hq.id}`} /> 개
                      </td>
                      <td>
                        <button 
                          className="btn-request" 
                          style={{backgroundColor: '#333'}} 
                          onClick={() => handleStockRequest(hq, document.getElementById(`hq-qty-${hq.id}`).value)}
                        >
                          발주하기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'restock-history' && (
            <div>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                📋 {selectedBranch} 발주 신청 내역
              </h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>고유코드</th>
                    <th>본사 상품명</th>
                    <th>신청 일자</th>
                    <th>신청 수량</th>
                    <th>진행 상태 (테스트용)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRestockHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                        아직 본사로 발주한 내역이 없습니다.<br/>'본사 상품 발주' 탭에서 상품을 주문해 보세요.
                      </td>
                    </tr>
                  ) : (
                    currentRestockHistory.map(req => (
                      <tr key={req.id}>
                        <td style={{ color: '#777', fontWeight: 'bold' }}>{req.code}</td>
                        <td>{req.name}</td>
                        <td style={{ color: '#555' }}>{req.date}</td>
                        <td><strong>{req.qty}</strong> 개</td>
                        <td>
                          <CustomDropdown 
                            currentStatus={req.status} 
                            onStatusChange={(newStatus) => handleRestockStatusChange(req.id, newStatus)} 
                            statusStyles={restockStatusStyles}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>🔥 {selectedBranch} 인기 상품 순위</h2>
                
                <button 
                  onClick={() => setStatsViewMode(prev => prev === 'table' ? 'graph' : 'table')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #7b6352',
                    backgroundColor: 'white',
                    color: '#7b6352',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {statsViewMode === 'table' ? '📈 상세 성과 보기' : '📋 순위로 보기'}
                </button>
              </div>

              {statsViewMode === 'table' ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>순위</th>
                      <th>상품명</th>
                      <th>누적 판매량</th>
                      <th>조회수 (관심도)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPopular.map(stat => (
                      <tr key={stat.id}>
                        <td><strong>{stat.rank}위</strong></td>
                        <td>{stat.name}</td>
                        <td>{stat.sold}개</td>
                        <td>{stat.views}회</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '30px', backgroundColor: '#faf9f7', borderRadius: '8px', border: '1px solid #eee' }}>
                  <h3 style={{ margin: '0 0 25px 0', fontSize: '18px', borderBottom: '2px solid #eaeaea', paddingBottom: '15px' }}>
                    상품 성과 상세
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {currentPopular.map(stat => (
                      <div key={`card-${stat.id}`} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ width: '4px', backgroundColor: stat.barColor, borderRadius: '2px' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '2px 0' }}>
                          <div style={{ fontSize: '14px', color: '#777' }}>
                            {stat.statusLabel} · 전체 판매 비중 {stat.ratio}
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>
                            {stat.name}
                          </div>
                          <div style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>
                            {stat.insightLabel}: <strong style={{ color: '#333' }}>{stat.insightValue}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px dashed #dcdcdc' }}>
                    <h4 style={{ margin: '0 0 25px 0', fontSize: '16px', color: '#333' }}>📊 상품별 판매 비중 그래프</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {currentPopular.map(stat => (
                        <div key={`graph-${stat.id}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                            <span style={{ color: '#333' }}>{stat.name}</span>
                            <span style={{ color: stat.barColor }}>{stat.ratio}</span>
                          </div>
                          <div style={{ width: '100%', height: '14px', backgroundColor: '#e9ecef', borderRadius: '7px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: stat.ratio, 
                              height: '100%', 
                              backgroundColor: stat.barColor, 
                              borderRadius: '7px',
                              transition: 'width 1s ease-in-out'
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px dashed #dcdcdc' }}>
                    <h4 style={{ margin: '0 0 25px 0', fontSize: '16px', color: '#333' }}>👥 {selectedBranch} 연령대별 구매 비중</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {currentAgeData.map(ageItem => (
                        <div key={ageItem.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                            <span style={{ color: '#333' }}>{ageItem.label}</span>
                            <span style={{ color: ageItem.barColor === '#dcdcdc' || ageItem.barColor === '#eaeaea' ? '#999' : ageItem.barColor }}>
                              {ageItem.ratio}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '14px', backgroundColor: '#e9ecef', borderRadius: '7px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: ageItem.ratio, 
                              height: '100%', 
                              backgroundColor: ageItem.barColor, 
                              borderRadius: '7px',
                              transition: 'width 1s ease-in-out'
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        <footer style={{
          marginTop: '60px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e5e5',
          color: '#aaa',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#999' }}>[이용약관 및 정책]</h4>
          <p style={{ margin: '0' }}><strong>운영 원칙:</strong> 당사는 건전한 전자상거래 질서를 준수하며, 관련 법령에 따른 의무를 성실히 이행합니다.</p>
          <p style={{ margin: '0' }}><strong>개인정보 보호:</strong> 고객의 소중한 개인정보는 철저한 보안 시스템을 통해 안전하게 보호 및 관리됩니다.</p>
          <p style={{ margin: '0' }}><strong>권한 및 책임:</strong> 본 사이트의 모든 상품 정보 및 콘텐츠의 무단 복제를 금하며, 시스템 불법 접근 시 법적 조치를 취할 수 있습니다.</p>
          <p style={{ margin: '0' }}><strong>거래 안전:</strong> 안전한 결제 시스템을 제공하며, 분쟁 발생 시 소비자 분쟁 해결 기준을 따릅니다.</p>
          <p style={{ margin: '15px 0 0 0', textAlign: 'center', fontSize: '11px' }}>
            © 2026 BASEASON {selectedBranch}. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default BranchAdmin;