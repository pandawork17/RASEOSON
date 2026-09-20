import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [stats, setStats] = useState({ org_count: 0, user_count: 0, inquiry_count: 0, policy_count: 0 });
  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({
    org_code: '',
    org_name: '',
    phone: '',
    email: '',
    address1: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadStats();
    loadOrgUnits();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('통계 데이터 로드 실패', e);
    }
  };

  const loadOrgUnits = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/orgs');
      if (res.ok) {
        const data = await res.json();
        setOrgs(data);
      } else {
        setErrorMessage('조직 목록을 불러오지 못했습니다. FastAPI 서버를 확인하세요.');
      }
    } catch (e) {
      setErrorMessage('서버 연결에 실패했습니다.');
    }
  };

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.org_code.trim() || !form.org_name.trim()) {
      setErrorMessage('조직 코드와 조직명은 반드시 입력해야 합니다.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch('http://localhost:8000/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setSuccessMessage('지사가 성공적으로 등록되었습니다.');
        setForm({ org_code: '', org_name: '', phone: '', email: '', address1: '' });
        loadOrgUnits();
        loadStats();
      } else {
        const errData = await res.json();
        setErrorMessage(errData.detail || '등록에 실패했습니다.');
      }
    } catch (e) {
      setErrorMessage('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-container" style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* 상단 타이틀 및 통계 카드 섹션 (인물 사진 배제, 통계 중심) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <p style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '14px', margin: '0 0 5px 0' }}>SHOPDB2 HEAD OFFICE ADMIN</p>
          <h1 style={{ fontSize: '28px', color: '#1e293b', margin: 0 }}>본사 관리자 시스템</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>MySQL → FastAPI → React로 연결된 본사 통합 관리 화면입니다.</p>
        </div>
        
        {/* 통계 카드 */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>운영 조직</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{stats.org_count}</div>
          </div>
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>전체 회원</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{stats.user_count}</div>
          </div>
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>고객 문의</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.inquiry_count}</div>
          </div>
        </div>
      </div>

      {/* 에러 / 성공 메시지 */}
      {errorMessage && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{errorMessage}</div>}
      {successMessage && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{successMessage}</div>}

      {/* 지사 등록 폼 카드 */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>지사 등록</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>조직 코드 *</label>
              <input type="text" name="org_code" value={form.org_code} onChange={handleChange} placeholder="예: BR006" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>조직명 *</label>
              <input type="text" name="org_name" value={form.org_name} onChange={handleChange} placeholder="예: 스마트쇼핑 광주지사" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>전화번호</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="예: 062-555-5555" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>이메일</label>
              <input type="text" name="email" value={form.email} onChange={handleChange} placeholder="예: gwangju@smartshop.co.kr" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>주소</label>
            <input type="text" name="address1" value={form.address1} onChange={handleChange} placeholder="예: 광주광역시 서구" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {submitting ? '등록 중...' : '지사 등록'}
          </button>
        </form>
      </div>

      {/* 조직 목록 테이블 카드 */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '20px' }}>조직 목록 현황</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '13px' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>코드</th>
              <th style={{ padding: '12px' }}>조직명</th>
              <th style={{ padding: '12px' }}>구분</th>
              <th style={{ padding: '12px' }}>연락처</th>
              <th style={{ padding: '12px' }}>이메일</th>
              <th style={{ padding: '12px' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map(org => (
              <tr key={org.org_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                <td style={{ padding: '12px' }}>{org.org_id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{org.org_code}</td>
                <td style={{ padding: '12px' }}>{org.org_name}</td>
                <td style={{ padding: '12px' }}><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{org.org_type}</span></td>
                <td style={{ padding: '12px' }}>{org.phone || '-'}</td>
                <td style={{ padding: '12px' }}>{org.email || '-'}</td>
                <td style={{ padding: '12px' }}><span style={{ color: org.active_yn === 'Y' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>{org.active_yn}</span></td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>등록된 조직 데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}