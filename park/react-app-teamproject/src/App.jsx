// 각 페이지를 연결해주는 라우터 역할
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import BranchAdmin from './pages/BranchAdmin.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 판매자 메인 (기본 진입 시 바로 지점 관리자 대시보드로 연결) */}
        <Route path="/" element={<BranchAdmin />} />
        
        {/* 기존 admin 경로 호환 */}
        <Route path="/admin" element={<BranchAdmin />} />

        {/* 기타 경로는 루트(대시보드)로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;