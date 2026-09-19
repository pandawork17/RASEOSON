import { useState } from "react";
import { api, ApiError } from "../api";

export function RegisterPage({ onSuccess, onGoLogin }) {
  const [form, setForm] = useState({
    login_id: "",
    password: "",
    password_confirm: "",
    user_name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (form.login_id.length < 4) {
      setError("아이디는 최소 4자 이상이어야 합니다.");
      return;
    }

    if (form.password.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        login_id: form.login_id.trim(),
        password: form.password,
        user_name: form.user_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
      };

      const result = await api.register(payload);

      // 로컬 스토리지에 가입한 계정 정보 저장 (빠른 시연 목록에 즉시 노출용)
      try {
        const stored = JSON.parse(localStorage.getItem("registered_demo_accounts") || "[]");
        const newAccount = {
          role: "buyer",
          roleLabel: "구매자",
          login_id: form.login_id.trim(),
          password: form.password,
          user_name: form.user_name.trim(),
          branch: "직접 가입 회원",
          desc: "방금 직접 회원가입하여 DB에 등록된 신규 계정",
          badgeColor: "#059669",
          isNew: true,
          isCustom: true,
          registeredAt: new Date().toISOString(),
        };
        const updated = [newAccount, ...stored.filter((a) => a.login_id !== newAccount.login_id)];
        localStorage.setItem("registered_demo_accounts", JSON.stringify(updated));
        localStorage.setItem("last_login_id", newAccount.login_id);
      } catch (e) {
        console.error("Failed to save registered account to localStorage", e);
      }

      alert(`[${result.user.user_name}]님, 회원가입이 완료되었습니다!\nMySQL 데이터베이스(users 테이블)에 정상 등록되어 즉시 로그인됩니다.`);
      onSuccess(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card figma-auth-card register-card">
        <div className="auth-header">
          <h1>구매자 회원가입</h1>
          <p className="auth-subtitle">베이스시즌에 오신 것을 환영합니다.</p>
        </div>

        {/* DB 저장 안내 배너 */}
        <div className="register-db-info-banner">
          <div className="db-info-title">
            <span className="icon">🗄️</span>
            <strong>실제 DB 연동 회원가입</strong>
          </div>
          <p>
            입력하신 회원 정보는 백엔드 API를 거쳐 <strong>MySQL 데이터베이스(users 테이블)</strong>에
            안전하게 암호화 저장되며, <strong>구매자(BUYER) 권한</strong>이 즉시 부여됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="standard-login-form">
          {error && <div className="form-error-banner">{error}</div>}

          <div className="auth-field">
            <label htmlFor="reg-id">아이디 <span className="required">*</span></label>
            <input
              id="reg-id"
              type="text"
              placeholder="영문, 숫자 4자 이상"
              value={form.login_id}
              onChange={update("login_id")}
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-name">이름 (성함) <span className="required">*</span></label>
            <input
              id="reg-name"
              type="text"
              placeholder="홍길동"
              value={form.user_name}
              onChange={update("user_name")}
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">이메일 <span className="required">*</span></label>
            <input
              id="reg-email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={update("email")}
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-phone">휴대폰 번호</label>
            <input
              id="reg-phone"
              type="tel"
              placeholder="010-1234-5678"
              value={form.phone}
              onChange={update("phone")}
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-pw">비밀번호 <span className="required">*</span></label>
            <input
              id="reg-pw"
              type="password"
              placeholder="4자 이상 입력"
              value={form.password}
              onChange={update("password")}
              required
              disabled={submitting}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-pw-conf">비밀번호 확인 <span className="required">*</span></label>
            <input
              id="reg-pw-conf"
              type="password"
              placeholder="비밀번호 다시 입력"
              value={form.password_confirm}
              onChange={update("password_confirm")}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-auth-submit"
            disabled={submitting}
          >
            {submitting ? "DB 등록 중..." : "회원가입 완료 (DB 등록)"}
          </button>
        </form>

        <div className="auth-footer-links">
          <div className="register-prompt">
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              className="btn-link-register"
              onClick={onGoLogin}
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
