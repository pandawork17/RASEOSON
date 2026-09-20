import { useState, useEffect } from "react";
import { api, ApiError, getNickname } from "../api";

export function RegisterPage({ onSuccess, onGoLogin }) {
  const [loginId, setLoginId] = useState("");
  const [userName, setUserName] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [emailDomain, setEmailDomain] = useState("naver.com");
  const [customDomain, setCustomDomain] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMid, setPhoneMid] = useState("");
  const [phoneEnd, setPhoneEnd] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 아이디 중복 확인
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [checkingId, setCheckingId] = useState(false);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [idCheckStatus, setIdCheckStatus] = useState(null); // 'success' | 'error' | null

  // 이메일 실시간 중복 체크 (수정 2)
  const [emailError, setEmailError] = useState("");

  // 비밀번호 입력 포커스/터치 상태 (수정 3)
  const [passwordTouched, setPasswordTouched] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 이메일 완성 시 실시간 DB 중복 확인 (버튼 없이 자동 대조)
  useEffect(() => {
    const domain = emailDomain === "custom" ? customDomain.trim() : emailDomain;
    const user = emailUser.trim();

    if (!user || !domain || (emailDomain === "custom" && !domain.includes("."))) {
      setEmailError("");
      return;
    }

    const fullEmail = `${user}@${domain}`;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await api.checkEmail(fullEmail);
        if (!isCancelled) {
          if (!res.available) {
            setEmailError("이미 가입된 이메일입니다.");
          } else {
            // 처음 등록되는 이메일이면 아무것도 안 뜸 (수정 2 요건)
            setEmailError("");
          }
        }
      } catch {
        // ignore
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [emailUser, emailDomain, customDomain]);

  // 비밀번호 생성 규칙 조건 체크 (수정 3)
  // 1. 8자 이상 16자 이하 입력 (공백 제외)
  const isRuleLength = password.length >= 8 && password.length <= 16 && !/\s/.test(password);

  // 2. 영문/숫자/특수문자 중, 2가지 이상 조합
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!"#$%&'()*+,\-./:;<=>?@[₩\\\]^_`{|}~]/.test(password);
  const isRuleCombo = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length >= 2;

  // 3. 허용된 특수문자 32자 외 문자 미포함
  const isRuleChars = password.length > 0 && /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[₩\\\]^_`{|}~]+$/.test(password);

  const isPasswordAllValid = isRuleLength && isRuleCombo && isRuleChars;
  const showPasswordRules = passwordTouched || password.length > 0;

  // 아이디 중복 확인
  const handleCheckDuplicate = async () => {
    const trimmedId = loginId.trim();
    if (!trimmedId) {
      alert("아이디를 입력해주세요.");
      return;
    }
    if (trimmedId.length < 4) {
      alert("아이디는 최소 4자 이상이어야 합니다.");
      return;
    }

    setCheckingId(true);
    setError("");
    try {
      const res = await api.checkLoginId(trimmedId);
      if (res.available) {
        setIsIdChecked(true);
        setIdCheckStatus("success");
        setIdCheckMessage(res.message || "사용 가능한 아이디입니다.");
      } else {
        setIsIdChecked(false);
        setIdCheckStatus("error");
        setIdCheckMessage(res.message || "이미 사용 중인 아이디입니다.");
      }
    } catch (err) {
      setIsIdChecked(false);
      setIdCheckStatus("error");
      setIdCheckMessage(err instanceof ApiError ? err.message : "아이디 중복 확인 중 오류가 발생했습니다.");
    } finally {
      setCheckingId(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isIdChecked) {
      setError("아이디 중복 확인을 진행해주세요.");
      return;
    }

    if (!userName.trim()) {
      setError("이름(성함)을 입력해주세요.");
      return;
    }

    // 이메일 검증
    const selectedDomain = emailDomain === "custom" ? customDomain.trim() : emailDomain;
    if (!emailUser.trim() || !selectedDomain) {
      setError("이메일을 올바르게 입력해주세요.");
      return;
    }
    if (emailError) {
      setError("이미 가입된 이메일입니다. 다른 이메일을 입력해주세요.");
      return;
    }
    const fullEmail = `${emailUser.trim()}@${selectedDomain}`;

    // 비밀번호 규칙 검증
    if (!isPasswordAllValid) {
      setError("비밀번호 생성 규칙 조건을 모두 충족해야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    // 전화번호 검증 및 조합 (필수 기입 정보)
    if (!phoneMid.trim() || !phoneEnd.trim()) {
      setError("휴대폰 번호를 입력해주세요.");
      return;
    }
    if (phoneMid.trim().length < 3 || phoneEnd.trim().length < 4) {
      setError("휴대폰 번호를 올바르게 입력해주세요 (중간 3~4자리, 뒷 4자리).");
      return;
    }
    const fullPhone = `${phonePrefix}-${phoneMid.trim()}-${phoneEnd.trim()}`;

    setSubmitting(true);
    try {
      const payload = {
        login_id: loginId.trim(),
        password,
        user_name: userName.trim(),
        email: fullEmail,
        phone: fullPhone,
      };

      const result = await api.register(payload);
      const computedNickname = getNickname(result.user);

      // 로컬 스토리지에 가입한 계정 정보 저장 (빠른 시연 목록에 즉시 노출용)
      try {
        const stored = JSON.parse(localStorage.getItem("registered_demo_accounts") || "[]");
        const newAccount = {
          role: "buyer",
          roleLabel: "구매자",
          login_id: loginId.trim(),
          password,
          user_name: userName.trim(),
          email: fullEmail,
          nickname: computedNickname,
          branch: "직접 가입 회원",
          desc: "방금 직접 회원가입하여 MySQL DB에 등록된 신규 계정",
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

      alert(`[${computedNickname}]님, 회원가입이 완료되었습니다!\nMySQL 데이터베이스(users 테이블)에 정상 등록되어 즉시 로그인됩니다.`);
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

          {/* 아이디 + 중복 확인 */}
          <div className="auth-field">
            <label htmlFor="reg-id">아이디 <span className="required">*</span></label>
            <div className="id-check-group">
              <input
                id="reg-id"
                type="text"
                placeholder="영문, 숫자 4자 이상"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setIsIdChecked(false);
                  setIdCheckStatus(null);
                  setIdCheckMessage("");
                }}
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="btn-check-duplicate"
                onClick={handleCheckDuplicate}
                disabled={checkingId || submitting || !loginId.trim()}
              >
                {checkingId ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            {idCheckMessage && (
              <span className={`id-check-msg ${idCheckStatus || ""}`}>
                {idCheckStatus === "success" ? "✓ " : "✕ "}
                {idCheckMessage}
              </span>
            )}
          </div>

          {/* 이름 (성함) */}
          <div className="auth-field">
            <label htmlFor="reg-name">이름 (성함) <span className="required">*</span></label>
            <input
              id="reg-name"
              type="text"
              placeholder="홍길동"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          {/* 이메일 (앞 입력 + @ + 뒤 선택/직접입력) & 자동 중복 체크 (수정 2) */}
          <div className="auth-field">
            <label>이메일 <span className="required">*</span></label>
            <div className="auth-email-group">
              <input
                type="text"
                placeholder="이메일 입력"
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                required
                disabled={submitting}
              />
              <span className="at">@</span>
              {emailDomain === "custom" && (
                <input
                  type="text"
                  placeholder="직접입력"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  required
                  disabled={submitting}
                />
              )}
              <select
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                disabled={submitting}
              >
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="kakao.com">kakao.com</option>
                <option value="custom">직접입력</option>
              </select>
            </div>
            {emailError && (
              <span className="id-check-msg error">
                ✕ {emailError}
              </span>
            )}
          </div>

          {/* 휴대폰 번호 (필수 기입 정보) */}
          <div className="auth-field">
            <label>휴대폰 번호 <span className="required">*</span></label>
            <div className="auth-phone-group">
              <select
                value={phonePrefix}
                onChange={(e) => setPhonePrefix(e.target.value)}
                disabled={submitting}
              >
                <option value="010">010</option>
                <option value="011">011</option>
                <option value="016">016</option>
                <option value="017">017</option>
                <option value="018">018</option>
                <option value="019">019</option>
              </select>
              <span className="sep">-</span>
              <input
                type="text"
                maxLength={4}
                placeholder=""
                value={phoneMid}
                onChange={(e) => setPhoneMid(e.target.value.replace(/\D/g, ""))}
                required
                disabled={submitting}
              />
              <span className="sep">-</span>
              <input
                type="text"
                maxLength={4}
                placeholder=""
                value={phoneEnd}
                onChange={(e) => setPhoneEnd(e.target.value.replace(/\D/g, ""))}
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* 비밀번호 (수정 3: 진한 갈색/연한 갈색 조건 충족 리스트) */}
          <div className="auth-field">
            <label htmlFor="reg-pw">비밀번호 <span className="required">*</span></label>
            <input
              id="reg-pw"
              type="password"
              placeholder="8~16자의 영문, 숫자, 특수문자"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordTouched(true)}
              required
              disabled={submitting}
            />
            {showPasswordRules && (
              <div className="pw-rule-checklist">
                <div className={`pw-rule-item ${isRuleLength ? "met" : "unmet"}`}>
                  <span className="icon">{isRuleLength ? "✓" : "✕"}</span>
                  <span>8자 이상 16자 이하 입력 (공백 제외)</span>
                </div>
                <div className={`pw-rule-item ${isRuleCombo ? "met" : "unmet"}`}>
                  <span className="icon">{isRuleCombo ? "✓" : "✕"}</span>
                  <span>영문/숫자/특수문자 중, 2가지 이상 조합</span>
                </div>
                <div className={`pw-rule-item ${isRuleChars ? "met" : "unmet"}`}>
                  <span className="icon">{isRuleChars ? "✓" : "✕"}</span>
                  <span>사용 가능한 특수문자 32자 외 문자 미포함</span>
                </div>
                <div className="pw-rule-special-note">
                  ※ 사용 가능한 특수문자 32자 : ! &quot; # $ % &amp; &apos; ( ) * + , - . / : ; &lt; = &gt; ? @ [ ₩ ] ^ _ ` &#123; | &#125; ~
                </div>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="auth-field">
            <label htmlFor="reg-pw-conf">비밀번호 확인 <span className="required">*</span></label>
            <input
              id="reg-pw-conf"
              type="password"
              placeholder="비밀번호 다시 입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              onFocus={() => setPasswordTouched(true)}
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
