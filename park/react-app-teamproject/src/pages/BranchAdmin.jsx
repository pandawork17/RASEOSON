import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './BranchAdmin.css';

// ==========================================
// 커스텀 드롭다운 
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

function emptyForm() {
  return { title: "", content: "", is_pinned: "N", image: "" };
}

// ==========================================
// 본사 공지사항 전용 컴포넌트 (DB 연동)
// ==========================================
function NoticeManagement({ selectedBranch }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState("list");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  const fileInputRef = useRef(null); 

  useEffect(() => {
    setLoading(true);
    fetch('/api/branch/notices')
      .then(res => res.json())
      .then(data => {
        setNotices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("공지사항 불러오기 실패:", err);
        setLoading(false);
      });
  }, []);

  function openDetail(notice) {
    setSelectedNotice(notice);
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

  function submitNotice(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage("제목과 내용은 반드시 입력해야 합니다.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      alert("공지사항이 성공적으로 저장되었습니다!");
      setSaving(false);
      returnToList();
    }, 300);
  }

  const sortedNotices = [...notices];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedNotices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedNotices.length / itemsPerPage);
  let currentUnpinnedCount = 1 + sortedNotices.slice(0, indexOfFirstItem).filter(n => n.is_pinned !== "Y").length;

  if (page === "write" || page === "edit") {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>📢 본사 공지사항 {page === 'edit' ? '수정' : '작성'}</h2>
        <div style={{ maxWidth: 900 }}>
          <button onClick={returnToList} style={{ ...brownButton, marginBottom: 15 }}>← 공지사항 목록</button>
          <form onSubmit={submitNotice} style={{ background: "#fff", padding: 30, borderRadius: 8, borderTop: "4px solid #796252", border: '1px solid #eee' }}>
            {errorMessage && <p style={{ color: "#A24D32" }}>오류: {errorMessage}</p>}
            <label style={{ display: "block", fontWeight: "bold" }}>제목</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>내용</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} style={{ ...inputStyle, resize: "vertical" }} />
            <label style={{ display: "block", fontWeight: "bold", marginTop: 20 }}>상단 고정</label>
            <select value={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.value })} style={{ marginTop: 8, padding: 10, border: "1px solid #CDBFAF", borderRadius: 4 }}>
              <option value="N">일반 공지</option>
              <option value="Y">중요 공지로 상단 고정</option>
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 35, borderTop: '1px solid #eee', paddingTop: 20 }}>
              <button type="submit" disabled={saving} style={brownButton}>{saving ? "처리 중..." : page === "edit" ? "수정 저장" : "등록"}</button>
              <button type="button" onClick={returnToList} style={{ ...brownButton, background: "#A68F79" }}>취소</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (page === "detail" && selectedNotice) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>📢 본사 공지사항 상세</h2>
        <div style={{ maxWidth: 900 }}>
          <button onClick={returnToList} style={{ ...brownButton, marginBottom: 15 }}>← 목록으로</button>
          <section style={{ background: "#fff", padding: 30, borderRadius: 8, borderTop: "4px solid #796252", border: '1px solid #eee' }}>
            <h1 style={{ fontSize: 24, margin: "0 0 15px", color: '#333' }}>
              {selectedNotice.is_pinned === 'Y' && <span style={{color: '#d9534f', marginRight: 8}}>[중요]</span>}
              {selectedNotice.title}
            </h1>
            <div style={{ display: "flex", gap: 20, padding: "15px 0", borderTop: "1px solid #eee", borderBottom: "1px solid #eee", color: "#666", fontSize: 13, marginBottom: 25 }}>
              <span><strong>작성자:</strong> {selectedNotice.author_name}</span>
              <span><strong>작성일:</strong> {selectedNotice.created_at}</span>
              <span><strong>조회수:</strong> {selectedNotice.view_count}</span>
            </div>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 15, minHeight: 150, color: '#333' }}>{selectedNotice.content}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 15 }}>
              <button onClick={openEdit} style={brownButton}>수정</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📢 본사 공지사항</h2>
        <button onClick={openWrite} style={brownButton}>+ 공지사항 작성</button>
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
              const displayNum = isPinned ? "공지" : currentUnpinnedCount++;
              return (
                <tr key={notice.notice_id}>
                  <td style={{ fontWeight: isPinned ? "bold" : "normal", color: isPinned ? "#d9534f" : "#666" }}>{displayNum}</td>
                  <td style={{ textAlign: 'left', fontWeight: isPinned ? "bold" : "normal", color: '#333' }}>
                    <span onClick={() => openDetail(notice)} style={{ cursor: 'pointer', borderBottom: '1px solid transparent' }} onMouseEnter={e => e.target.style.borderBottom='1px solid #333'} onMouseLeave={e => e.target.style.borderBottom='1px solid transparent'}>
                      {notice.title}
                    </span>
                  </td>
                  <td style={{ color: '#666' }}>{notice.author_name}</td>
                  <td style={{ fontSize: '12px', color: '#666' }}>{notice.created_at}</td>
                  <td style={{ color: '#888' }}>{notice.view_count}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------
// 메인 지사 관리자 컴포넌트
// ---------------------------------------------
function BranchAdmin() {
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState(null); 
  const [statsViewMode, setStatsViewMode] = useState('graph'); 
  const [inquiryFilter, setInquiryFilter] = useState('전체'); 
  const [replyingInquiry, setReplyingInquiry] = useState(null);
  const [replyText, setReplyText] = useState(""); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [dbBranches, setDbBranches] = useState([]);
  const [currentInventory, setCurrentInventory] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [currentInquiries, setCurrentInquiries] = useState([]);
  const [hqProducts, setHqProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/branch/branches')
      .then(res => res.json())
      .then(data => {
        setDbBranches(data);
        if (data.length > 0) {
          setSelectedOrgId(data[0].org_id);
          setSelectedBranch(data[0].org_name.replace('스마트쇼핑 ', ''));
        }
      });

    fetch('/api/branch/hq/products')
      .then(res => res.json())
      .then(data => setHqProducts(data));
  }, []);

  useEffect(() => {
    if (!selectedOrgId) return;
    setLoadingData(true);

    Promise.all([
      fetch(`/api/branch/branches/${selectedOrgId}/inventory`).then(res => res.json()),
      fetch(`/api/branch/branches/${selectedOrgId}/orders`).then(res => res.json()),
      fetch(`/api/branch/branches/${selectedOrgId}/inquiries`).then(res => res.json())
    ]).then(([invData, orderData, inquiryData]) => {
      setCurrentInventory(invData);
      setCurrentOrders(orderData);
      setCurrentInquiries(inquiryData);
      setLoadingData(false);
    }).catch(err => {
      console.error("데이터 로드 에러:", err);
      setLoadingData(false);
    });
  }, [selectedOrgId]);

  const handlePriceChange = (productId, newPrice) => {
    if (!newPrice || isNaN(newPrice)) {
      alert("올바른 가격을 입력해주세요.");
      return;
    }
    fetch(`/api/branch/products/${productId}/price`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sale_price: Number(newPrice) })
    })
      .then(res => res.json())
      .then(data => {
        alert(`판매가가 ${Number(newPrice).toLocaleString()}원으로 변경되었습니다!`);
        setCurrentInventory(prev => prev.map(item => 
          item.id === productId ? { ...item, salePrice: Number(newPrice) } : item
        ));
      });
  };

  const orderStatusStyles = {
    // 🔵 1. 정상 배송 흐름 (파랑/보라/초록)
    '결제 완료': { bg: '#e8f0fe', text: '#1a73e8' },           // 파란색 (정상 접수됨)
    '배송 전': { bg: '#fef7e0', text: '#b06000' },             // 노란색 (관리자 발송 처리 대기)
    '배송시작(주문완료)': { bg: '#f3e8ff', text: '#7e22ce' }, // 보라색 (배송 시작)
    '배송 중': { bg: '#e0e7ff', text: '#4338ca' },             // 남색 (이동 중)
    '배송 완료': { bg: '#e6f4ea', text: '#0d652d' },           // 초록색 (정상 완료)

    // 🔴 2. 즉각 조치 필요 - 각종 요청 (빨강)
    '환불 요청(배송전)': { bg: '#fff0f0', text: '#d9534f' },
    '반품/환불 요청': { bg: '#fff0f0', text: '#d9534f' },
    '교환 요청': { bg: '#fff0f0', text: '#d9534f' },

    // 🟠 3. 처리 중 - 대기 상태 (주황/청록)
    '환불 대기(배송전)': { bg: '#ffedd5', text: '#c2410c' }, // 주황색 (환불 처리 진행 중)
    '반품/환불 대기': { bg: '#ffedd5', text: '#c2410c' },    // 주황색 (반품 회수 및 환불 진행 중)
    '교환 처리중': { bg: '#ccfbf1', text: '#0f766e' },        // 청록색 (환불과 구분되는 교환 진행 색상)

    // ⚫ 4. 완전 종결 상태 (회색)
    '환불 완료(배송전)': { bg: '#f3f4f6', text: '#4b5563' },
    '반품/환불 완료': { bg: '#f3f4f6', text: '#4b5563' },
    '교환 완료': { bg: '#f3f4f6', text: '#4b5563' },
  };

  const restockStatusStyles = {
    '승인 대기': { bg: '#fef7e0', text: '#f29900' },
    '발주 승인': { bg: '#e6f4ea', text: '#1e8e3e' },
  };

  const popularProducts = {
    '전주지사': [{ id: 1, rank: 1, name: '스마트 후드티', sold: 42, views: 150, statusLabel: '판매 우수', ratio: '50%', insightLabel: '주 구매 연령', insightValue: '20대 (40%)', barColor: '#7b6352' }],
    '부산지사': [{ id: 1, rank: 1, name: '스마트 러닝화', sold: 55, views: 210, statusLabel: '판매 우수', ratio: '65%', insightLabel: '주 구매 연령', insightValue: '20대 (55%)', barColor: '#7b6352' }]
  };
  const ageDemographics = {
    '전주지사': [{ id: 'age-20', label: '20대', ratio: '45%', barColor: '#7b6352' }],
    '부산지사': [{ id: 'age-20', label: '20대', ratio: '60%', barColor: '#7b6352' }]
  };

  const [restockHistory, setRestockHistory] = useState({ '전주지사': [], '부산지사': [] });

  const currentPopular = popularProducts[selectedBranch] || [];
  const currentAgeData = ageDemographics[selectedBranch] || [];
  const currentRestockHistory = restockHistory[selectedBranch] || [];

  // 💡 DB 카테고리 값('1)상품문의' 등)과 완벽하게 매칭되도록 필터 로직 전면 수정
  const filteredInquiries = inquiryFilter === '전체' 
    ? currentInquiries 
    : currentInquiries.filter(q => q.type && q.type.includes(inquiryFilter));

  const getCategoryCount = (type) => {
    if (type === '전체') return currentInquiries.length;
    return currentInquiries.filter(q => q.type && q.type.includes(type)).length;
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
      wholesalePrice: hqProduct.wholesalePrice,
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
    setCurrentOrders(prev => prev.map(order => 
      order.orderNo === orderNo ? { ...order, status: newStatus } : order
    ));
  };

  const openReplyPage = (inquiry) => {
    setReplyingInquiry(inquiry);
    setReplyText(inquiry.reply || ""); 
  };

  const submitReply = () => {
    if (!replyText.trim()) { alert("답변 내용을 입력해주세요."); return; }
    setCurrentInquiries(prev => prev.map(inq => 
      inq.id === replyingInquiry.id ? { ...inq, reply: replyText, status: '답변완료' } : inq
    ));
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
  
  const handleBranchChange = (branch) => {
    setSelectedOrgId(branch.org_id);
    setSelectedBranch(branch.org_name.replace('스마트쇼핑 ', ''));
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
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#eeddd1', padding: 0, lineHeight: '1' }}
              >☰</button>
              <h2 style={{ margin: 0 }}>BASEASON 지점관리자</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap' }}>
              {dbBranches.length === 0 ? (
                <span style={{ color: '#ccc', fontSize: '13px' }}>지사 목록 로딩중...</span>
              ) : (
                dbBranches.map(branch => {
                  const branchName = branch.org_name.replace('스마트쇼핑 ', '');
                  const isActive = selectedOrgId === branch.org_id;
                  return (
                    <button 
                      key={branch.org_id}
                      onClick={() => handleBranchChange(branch)}
                      style={{
                        flex: 1, minWidth: '45%', padding: '10px 5px', fontSize: '13px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                        backgroundColor: isActive ? '#bdae9c' : 'transparent',
                        color: isActive ? '#fff' : '#ccc',
                        border: isActive ? 'none' : '1px solid #bdae9c'
                      }}
                    >
                      {branchName}
                    </button>
                  );
                })
              )}
            </div>

            <ul>
              <li className={activeTab === 'notices' ? 'active' : ''} onClick={() => handleTabChange('notices')}>📢 본사 공지사항</li>
              <li className={activeTab === 'inventory' ? 'active' : ''} onClick={() => handleTabChange('inventory')}>📦 재고 및 할인율 관리</li>
              <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabChange('orders')}>📝 고객 주문 관리</li>
              <li className={activeTab === 'inquiries' ? 'active' : ''} onClick={() => handleTabChange('inquiries')}>💬 고객 문의 관리</li>
              <li className={activeTab === 'b2b-order' ? 'active' : ''} onClick={() => handleTabChange('b2b-order')}>🏢 본사 상품 발주</li>
              <li className={activeTab === 'restock-history' ? 'active' : ''} onClick={() => handleTabChange('restock-history')}>📋 발주 신청 내역</li>
              {/*<li className={activeTab === 'stats' ? 'active' : ''} onClick={() => handleTabChange('stats')}>🔥 지사 인기 상품</li> */}
            </ul>
          </div>

          <div style={{ marginTop: 'auto', paddingBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.15)', color: '#eeddd1',
                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px', transition: 'all 0.2s ease'
              }}
            >
              🚪 로그아웃
            </button>
          </div>
        </aside>
      )}

      <main className="admin-main">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#555', padding: '0 10px 0 0' }}>☰</button>
          )}
          <h2 style={{ margin: 0, fontSize: '22px', color: '#333' }}>
            {selectedBranch} 관리 대시보드
          </h2>
        </div>
{/* 
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
            <h3 className="danger">{currentInventory.filter(item => item.stock < item.safetyStock).length}건</h3>
          </div>
        </div>
*/}
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
                    <th>할인율</th>
                    <th>판매가(할인가) 설정</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>DB에서 데이터를 조회 중입니다...</td></tr>
                  ) : currentInventory.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>등록된 재고 상품이 없습니다.</td></tr>
                  ) : (
                    currentInventory.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontSize: '12px', color: '#666' }}>{item.uploadDate}</td>
                        <td style={{ color: '#888', fontSize: '13px' }}>{item.productCode}</td>
                        <td style={{ fontWeight: 'bold', color: '#333' }}>{item.name}</td>
                        <td>{item.regularPrice.toLocaleString()}원</td>
                        <td style={{ color: item.stock < item.safetyStock ? '#d9534f' : '#333', fontWeight: item.stock < item.safetyStock ? 'bold' : 'normal' }}>
                          {item.stock}개 {item.stock < item.safetyStock && '(부족)'}
                        </td>
                        <td style={{ color: '#d9534f', fontWeight: 'bold' }}>
                          {item.discountRate}%
                        </td>
                        <td>
                          <input type="number" className="price-input" defaultValue={item.salePrice} id={`price-${item.id}`} />
                          <button className="btn-apply" onClick={() => handlePriceChange(item.id, document.getElementById(`price-${item.id}`).value)}>적용</button>
                        </td>
                      </tr>
                    ))
                  )}
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
                    <th>주문자명</th>
                    <th>수령인 전화번호</th>
                    <th>배송지 (우편번호)</th>
                    <th>처리상태 (클릭하여 변경)</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>DB에서 데이터를 조회 중입니다...</td></tr>
                  ) : currentOrders.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>주문 내역이 없습니다.</td></tr>
                  ) : (
                  currentOrders.map((order, idx) => (
                    <tr key={idx}>
                      <td style={{ fontSize: '12px', color: '#666' }}>{order.ordered_at}</td>
                      <td style={{ fontSize: '13px' }}>{order.orderNo}</td>
                      <td style={{ fontWeight: 'bold', color: '#333' }}>{order.product} {order.qty > 1 && `외 ${order.qty-1}건`}</td>
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
                  )))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div>
              {replyingInquiry ? (
                <div style={{ padding: '10px' }}>
                  <h2 style={{ marginBottom: '5px' }}>Q&A 답변하기</h2>
                  <p style={{ color: '#777', fontSize: '14px', marginBottom: '25px' }}>고객이 남긴 문의 내역을 확인하고 답변을 작성해 주세요.</p>
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
                      <div style={{ padding: '15px', color: '#333' }}>{replyingInquiry.author} <span style={{ color: '#ccc', margin: '0 10px' }}>|</span> <span style={{ color: '#888' }}>{replyingInquiry.userId}</span></div>
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
                      <div style={{ padding: '20px 15px', color: '#333', lineHeight: '1.6', minHeight: '80px' }}>{replyingInquiry.content}</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '120px', padding: '15px', backgroundColor: '#f9f9fc', fontWeight: 'bold', color: '#555' }}>답변 작성 <span style={{ color: '#d9534f' }}>*</span></div>
                      <div style={{ padding: '15px', flex: 1 }}>
                        <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="고객에게 안내할 답변 내용을 자세히 입력해주세요." style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '4px', border: '1px solid #ccc', resize: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
                    <button onClick={() => setReplyingInquiry(null)} style={{ padding: '12px 40px', backgroundColor: '#eee', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#555' }}>취소하기</button>
                    <button onClick={submitReply} style={{ padding: '12px 40px', backgroundColor: '#7b6352', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', color: '#fff' }}>답변 등록하기</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ marginBottom: '20px' }}>💬 {selectedBranch} 1:1 문의 내역</h2>
                  
                  {/* 💡 DB의 category_code 데이터('상품문의', '주문및결제', '배송', '교환반품' 등)와 정확히 매칭되도록 버튼 수정 */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                      { label: '전체', value: '전체' },
                      { label: '상품문의', value: '상품문의' },
                      { label: '주문및결제', value: '주문및결제' },
                      { label: '배송', value: '배송' },
                      { label: '교환반품', value: '교환반품' }
                    ].map(cat => (
                      <button 
                        key={cat.value}
                        onClick={() => setInquiryFilter(cat.value)}
                        style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', border: inquiryFilter === cat.value ? 'none' : '1px solid #ddd', backgroundColor: inquiryFilter === cat.value ? '#7b6352' : '#fff', color: inquiryFilter === cat.value ? '#fff' : '#555' }}
                      >
                        {cat.label} ({getCategoryCount(cat.value)})
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
                      {loadingData ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>DB에서 데이터를 조회 중입니다...</td></tr>
                      ) : filteredInquiries.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>해당 분류에 속하는 문의 내역이 없습니다.</td></tr>
                      ) : (
                        filteredInquiries.map(inquiry => (
                          <tr key={inquiry.id}>
                            <td style={{ color: '#999', fontSize: '12px' }}>{inquiry.id}</td>
                            <td style={{ color: '#1a73e8', fontWeight: 'bold' }}>{inquiry.type}</td>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', color: '#333' }}>{inquiry.title}</td>
                            <td style={{ color: '#333' }}>{inquiry.author}</td>
                            <td style={{ color: '#888', fontSize: '13px' }}>{inquiry.userId}</td>
                            <td><span style={{ color: inquiry.status === '미답변' ? '#991b1b' : '#0d652d', fontWeight: 'bold' }}>{inquiry.status}</span></td>
                            <td style={{ fontSize: '12px', color: '#666' }}>{inquiry.date}</td>
                            <td>
                              <button onClick={() => openReplyPage(inquiry)} style={{ backgroundColor: inquiry.status === '미답변' ? '#5d554e' : '#fff', color: inquiry.status === '미답변' ? '#fff' : '#555', border: inquiry.status === '미답변' ? 'none' : '1px solid #ccc', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
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
                    <th>업로드 일시</th>
                    <th>고유코드</th>
                    <th>본사 상품명</th>
                    <th>도매가 (공급가)</th>
                    <th>발주 수량</th>
                    <th>발주 신청</th>
                  </tr>
                </thead>
                <tbody>
                  {hqProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>로딩 중이거나 본사에 등록된 상품이 없습니다.</td></tr>
                  ) : hqProducts.map(hq => (
                    <tr key={hq.id}>
                      <td style={{ fontSize: '12px', color: '#666' }}>{hq.uploadDate}</td>
                      <td style={{ color: '#777', fontWeight: 'bold', fontSize: '13px' }}>{hq.code}</td>
                      <td style={{ fontWeight: 'bold' }}>{hq.name}</td>
                      <td>{hq.wholesalePrice.toLocaleString()}원</td>
                      <td><input type="number" className="price-input" defaultValue={10} min="1" id={`hq-qty-${hq.id}`} /> 개</td>
                      <td><button className="btn-request" style={{backgroundColor: '#333'}} onClick={() => handleStockRequest(hq, document.getElementById(`hq-qty-${hq.id}`).value)}>발주하기</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'restock-history' && (
            <div>
              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📋 {selectedBranch} 발주 신청 내역</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>고유코드</th>
                    <th>본사 상품명</th>
                    <th>신청 일자</th>
                    <th>도매가 (공급가)</th>
                    <th>신청 수량</th>
                    <th>진행 상태 (테스트용)</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRestockHistory.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>아직 본사로 발주한 내역이 없습니다.<br/>'본사 상품 발주' 탭에서 상품을 주문해 보세요.</td></tr>
                  ) : (
                    currentRestockHistory.map(req => (
                      <tr key={req.id}>
                        <td style={{ color: '#777', fontWeight: 'bold' }}>{req.code}</td>
                        <td>{req.name}</td>
                        <td style={{ color: '#555' }}>{req.date}</td>
                        <td>{req.wholesalePrice ? `${req.wholesalePrice.toLocaleString()}원` : '-'}</td>
                        <td><strong>{req.qty}</strong> 개</td>
                        <td><CustomDropdown currentStatus={req.status} onStatusChange={(newStatus) => handleRestockStatusChange(req.id, newStatus)} statusStyles={restockStatusStyles} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
{/*
          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>🔥 {selectedBranch} 인기 상품 순위</h2>
                <button onClick={() => setStatsViewMode(prev => prev === 'table' ? 'graph' : 'table')} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #7b6352', backgroundColor: 'white', color: '#7b6352', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {statsViewMode === 'table' ? '📈 상세 성과 보기' : '📋 순위로 보기'}
                </button>
              </div>

              {statsViewMode === 'table' ? (
                <table className="admin-table">
                  <thead>
                    <tr><th>순위</th><th>상품명</th><th>누적 판매량</th><th>조회수 (관심도)</th></tr>
                  </thead>
                  <tbody>
                    {currentPopular.map(stat => (
                      <tr key={stat.id}><td><strong>{stat.rank}위</strong></td><td>{stat.name}</td><td>{stat.sold}개</td><td>{stat.views}회</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '30px', backgroundColor: '#faf9f7', borderRadius: '8px', border: '1px solid #eee' }}>
                  <h3 style={{ margin: '0 0 25px 0', fontSize: '18px', borderBottom: '2px solid #eaeaea', paddingBottom: '15px' }}>상품 성과 상세</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {currentPopular.map(stat => (
                      <div key={`card-${stat.id}`} style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ width: '4px', backgroundColor: stat.barColor, borderRadius: '2px' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '2px 0' }}>
                          <div style={{ fontSize: '14px', color: '#777' }}>{stat.statusLabel} · 전체 판매 비중 {stat.ratio}</div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>{stat.name}</div>
                          <div style={{ fontSize: '14px', color: '#555', marginTop: '2px' }}>{stat.insightLabel}: <strong style={{ color: '#333' }}>{stat.insightValue}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
 */}
        </div>

        <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #e5e5e5', color: '#aaa', fontSize: '12px', lineHeight: '1.6' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#999' }}>[이용약관 및 정책]</h4>
          <p style={{ margin: '0' }}><strong>운영 원칙:</strong> 당사는 건전한 전자상거래 질서를 준수하며, 관련 법령에 따른 의무를 성실히 이행합니다.</p>
          <p style={{ margin: '15px 0 0 0', textAlign: 'center', fontSize: '11px' }}>© 2026 BASEASON {selectedBranch}. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

export default BranchAdmin;
