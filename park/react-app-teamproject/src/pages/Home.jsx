import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(true); // 테스트용 관리자 로그인 상태
  
  // 💡 추가 1: 백엔드에서 가져올 상품 데이터를 저장할 상태
  const [products, setProducts] = useState([]);

  // 💡 추가 2: 화면이 켜질 때 백엔드(/api/products)에 데이터 요청
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        console.log("데이터 수신 완료:", data);
        setProducts(data);
      })
      .catch((err) => console.error("데이터 불러오기 에러:", err));
  }, []);

  const handleLogout = () => {
    alert('안전하게 로그아웃 되었습니다.');
    setIsAdminLoggedIn(false);
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    alert('관리자 계정으로 로그인되었습니다.');
    setIsAdminLoggedIn(true);
    setIsMenuOpen(false);
  };

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh', backgroundColor: '#f4ece2', fontFamily: 'sans-serif' }}>
      
      {/* 💡 상단 헤더 영역 (기존 코드 100% 유지) */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 40px', 
        height: '60px', 
        backgroundColor: '#7b6352', 
        color: '#fff' 
      }}>
        {/* 로고 */}
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '1px' }}>
          BASEASON
        </div>

        {/* 중앙 메뉴 */}
        <ul style={{ 
          display: 'flex', 
          gap: '40px', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0, 
          fontSize: '13px', 
          fontWeight: 'bold',
          letterSpacing: '0.5px'
        }}>
          <li style={{ cursor: 'pointer' }}>MEN</li>
          <li style={{ cursor: 'pointer' }}>NEW ARRIVALS</li>
        </ul>

        {/* 우측 아이콘 메뉴 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '15px' }}>
          
          {/* 검색창 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            borderBottom: '1px solid rgba(255,255,255,0.5)', 
            paddingBottom: '2px',
            marginRight: '10px'
          }}>
            <span style={{ fontSize: '12px', marginRight: '5px' }}>SEARCH</span>
            <span style={{ cursor: 'pointer' }}>🔍</span>
          </div>

          <div style={{ cursor: 'pointer' }}>👤</div>
          <div style={{ cursor: 'pointer' }}>🛒</div>
          
          {/* 햄버거 메뉴 (관리자/로그아웃) */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ cursor: 'pointer', paddingLeft: '5px', fontSize: '18px' }}
            >
              ☰
            </div>

            {isMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '-10px',
                marginTop: '15px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                width: '150px',
                zIndex: 1000,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #eee',
                color: '#333'
              }}>
                {isAdminLoggedIn ? (
                  <>
                  {/* 숨김 처리: 관리자 접속 중
                    <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                      관리자 접속 중
                    </div>
                    */}
                    <Link 
                      to="/admin" 
                      style={{ 
                        color: '#333', textDecoration: 'none', fontWeight: 'bold', 
                        padding: '12px 15px', fontSize: '13px', borderBottom: '1px solid #f1f1f1', display: 'block'
                      }}
                    >
                      관리자 모드 ⚙️
                    </Link>
                    {/* 숨김 처리: 로그아웃 버튼
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        color: '#d9534f', fontWeight: 'bold', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', textAlign: 'left', padding: '12px 15px', width: '100%', display: 'block'
                      }}
                    >
                      로그아웃
                    </button>
                    */}
                  </>
                ) : (
                  <>
                    <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', fontSize: '11px', color: '#888', fontWeight: 'bold' }}>
                      로그인이 필요합니다
                    </div>
                    <button 
                      onClick={handleLogin}
                      style={{ 
                        color: '#333', fontWeight: 'bold', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', textAlign: 'left', padding: '12px 15px', width: '100%', display: 'block'
                      }}
                    >
                      로그인
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 💡 메인 영역: flexDirection을 column으로 주어 배너 아래에 상품 목록이 오게 함 */}
      <main style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
        
        {/* 메인 배너 컨테이너 (기존 코드 유지) */}
        <div style={{ 
          width: '80%', 
          maxWidth: '1200px', 
          height: '600px', 
          backgroundColor: '#e6e2dd',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Main Banner" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            textAlign: 'center',
            color: '#333',
            fontFamily: "'Nanum Pen Script', cursive, sans-serif",
            transform: 'rotate(-5deg)'
          }}>
            <h2 style={{ fontSize: '36px', margin: 0, fontWeight: 'normal' }}>오늘도,</h2>
            <h2 style={{ fontSize: '36px', margin: '5px 0 0 0', fontWeight: 'normal' }}>더 나은 나를 위해</h2>
            <div style={{ width: '100%', height: '2px', backgroundColor: '#333', marginTop: '10px' }}></div>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: '#fff',
            padding: '5px 15px',
            borderRadius: '20px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ cursor: 'pointer' }}>⏸</span>
            <span>1 / 2</span>
          </div>
        </div>

        {/* 💡 추가 3: 백엔드에서 불러온 상품 목록 렌더링 영역 */}
        <div style={{ width: '80%', maxWidth: '1200px' }}>
          <h2 style={{ color: '#333', borderBottom: '2px solid #7b6352', paddingBottom: '10px' }}>
            박난주 서버에요~~~~ 🚀 (전체 상품 목록)
          </h2>
          
          {products.length === 0 ? (
            <p style={{ color: '#666' }}>DB에서 상품 데이터를 불러오는 중입니다...</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '20px',
              marginTop: '20px'
            }}>
              {products.map((product) => (
                <div key={product.product_id} style={{ 
                  backgroundColor: '#fff', 
                  padding: '20px', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#333' }}>{product.product_name}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                    {product.short_description}
                  </p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#7b6352' }}>
                    {product.sale_price ? product.sale_price.toLocaleString() : 0}원
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default Home;