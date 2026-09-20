// 각 페이지를 연결해주는 라우터 역할

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 💡 수정된 부분: 파일 경로 끝에 .jsx 를 꼭 붙여주세요!
import Home from './pages/Home.jsx';
import BranchAdmin from './pages/BranchAdmin.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 주소 (http://localhost:5173/) */}
        <Route path="/" element={<Home />} />
        
        {/* 관리자 주소 (http://localhost:5173/admin) */}
        <Route path="/admin" element={<BranchAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;