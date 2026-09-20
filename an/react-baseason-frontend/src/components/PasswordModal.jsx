import { useState } from "react";

// 8~16자의 영문 대소문자, 숫자, 특수문자만 허용
const PASSWORD_REGEX = /^[A-Za-z0-9!"#$%&'()*+,\-./:;<=>?@[₩\\\]^_`{|}~]{8,16}$/;

export function PasswordModal({ isOpen, onClose, onChangePassword }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 16 || !PASSWORD_REGEX.test(newPassword)) {
      alert("새 비밀번호는 8~16자의 영문 대소문자, 숫자, 특수문자(!\"#$%&'()*+,-./:;<=>?@[₩]^_`{|}~)만 가능합니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      await onChangePassword({ old_password: oldPassword, new_password: newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch {
      // Error handled by parent or alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container password-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>비밀번호 변경</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group-row">
            <label className="form-label required">현재 비밀번호</label>
            <div className="form-field">
              <input
                type="password"
                placeholder="현재 비밀번호를 입력해주세요."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label required">새 비밀번호</label>
            <div className="form-field">
              <input
                type="password"
                placeholder="8~16자의 영문, 숫자, 특수문자"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div style={{ fontSize: "11px", color: "#8c7f76", lineHeight: "1.4", marginTop: "4px" }}>
                ※ 8~16자의 영문 대소문자, 숫자, 특수문자만 가능합니다.<br />
                (사용 가능한 특수문자 32자 : ! &quot; # $ % &amp; &apos; ( ) * + , - . / : ; &lt; = &gt; ? @ [ ₩ ] ^ _ ` &#123; | &#125; ~)
              </div>
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label required">비밀번호 확인</label>
            <div className="form-field">
              <input
                type="password"
                placeholder="새 비밀번호를 한번 더 입력해주세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? "변경 중..." : "변경하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

