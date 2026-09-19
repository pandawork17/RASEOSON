import { useEffect, useState } from "react";
import { MyPageSidebar } from "../components/MyPageSidebar";
import { PasswordModal } from "../components/PasswordModal";
import { api, ApiError } from "../api";

export function MemberInfoPage({
  authUser,
  setAuthUser,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onAddress,
  onLogout,
  onGoBack,
}) {
  const [userName, setUserName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMid, setPhoneMid] = useState("");
  const [phoneEnd, setPhoneEnd] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const [customDomain, setCustomDomain] = useState("");
  const [agreeEmail, setAgreeEmail] = useState(true);
  const [agreeSms, setAgreeSms] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authUser) {
      setUserName(authUser.user_name || "");
      if (authUser.phone) {
        const parts = authUser.phone.split("-");
        if (parts.length === 3) {
          setPhonePrefix(parts[0]);
          setPhoneMid(parts[1]);
          setPhoneEnd(parts[2]);
        } else {
          setPhoneMid(authUser.phone.replace(/\D/g, ""));
        }
      }
      if (authUser.email) {
        const parts = authUser.email.split("@");
        setEmailUser(parts[0] || "");
        const domain = parts[1] || "gmail.com";
        if (["gmail.com", "naver.com", "daum.net", "kakao.com"].includes(domain)) {
          setEmailDomain(domain);
        } else {
          setEmailDomain("custom");
          setCustomDomain(domain);
        }
      }
    }
  }, [authUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    const fullPhone = phoneMid && phoneEnd ? `${phonePrefix}-${phoneMid.trim()}-${phoneEnd.trim()}` : "";
    setSaving(true);
    try {
      const updated = await api.updateMe({
        user_name: userName.trim(),
        phone: fullPhone,
      });
      setAuthUser(updated);
      alert("회원정보가 성공적으로 수정되었습니다.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "회원정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async ({ old_password, new_password }) => {
    try {
      await api.changePassword({ old_password, new_password });
      alert("비밀번호가 성공적으로 변경되었습니다.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "비밀번호 변경에 실패했습니다.");
      throw err;
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          홈 <span>&gt;</span> 마이페이지 <span>&gt;</span> 회원정보 수정
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="member"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={() => {}}
            onAddress={onAddress}
            onLogout={onLogout}
          />

          <section className="mypage-content figma-member-info-section">
            <div className="mypage-heading">
              <div>
                <h1>회원정보 수정</h1>
                <p>회원님의 정보를 수정하실 수 있습니다.</p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="figma-form-table">
                {/* 아이디 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">아이디</div>
                  <div className="figma-form-td id-col">
                    <input
                      type="text"
                      className="input-disabled"
                      value={authUser?.login_id || ""}
                      readOnly
                      disabled
                    />
                    <span className="notice-inline">아이디는 변경할 수 없습니다.</span>
                  </div>
                </div>

                {/* 이름 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">이름</div>
                  <div className="figma-form-td">
                    <input
                      type="text"
                      className="input-text-standard"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* 비밀번호 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">비밀번호</div>
                  <div className="figma-form-td password-col">
                    <div className="password-input-group">
                      <input
                        type="password"
                        className="input-password-masked"
                        value="********"
                        disabled
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn-outline-small"
                        onClick={() => setIsPasswordModalOpen(true)}
                      >
                        비밀번호 변경
                      </button>
                    </div>
                    <span className="notice-sub">※ 비밀번호를 변경하시려면 비밀번호 변경 버튼을 눌러주세요.</span>
                  </div>
                </div>

                {/* 휴대전화 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">휴대전화</div>
                  <div className="figma-form-td phone-col">
                    <select
                      className="select-prefix"
                      value={phonePrefix}
                      onChange={(e) => setPhonePrefix(e.target.value)}
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
                      className="input-phone-part"
                      value={phoneMid}
                      onChange={(e) => setPhoneMid(e.target.value.replace(/\D/g, ""))}
                    />
                    <span className="sep">-</span>
                    <input
                      type="text"
                      maxLength={4}
                      className="input-phone-part"
                      value={phoneEnd}
                      onChange={(e) => setPhoneEnd(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                {/* 이메일 */}
                <div className="figma-form-row">
                  <div className="figma-form-th">이메일</div>
                  <div className="figma-form-td email-col">
                    <div className="email-inputs">
                      <input
                        type="text"
                        className="input-email-id"
                        value={emailUser}
                        onChange={(e) => setEmailUser(e.target.value)}
                      />
                      <span className="at">@</span>
                      {emailDomain === "custom" ? (
                        <input
                          type="text"
                          className="input-email-domain"
                          placeholder="직접입력"
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                        />
                      ) : null}
                      <select
                        className="select-email-domain"
                        value={emailDomain}
                        onChange={(e) => setEmailDomain(e.target.value)}
                      >
                        <option value="gmail.com">gmail.com</option>
                        <option value="naver.com">naver.com</option>
                        <option value="daum.net">daum.net</option>
                        <option value="kakao.com">kakao.com</option>
                        <option value="custom">직접입력</option>
                      </select>
                    </div>

                    <div className="marketing-checkboxes">
                      <label className="custom-check-item">
                        <input
                          type="checkbox"
                          checked={agreeEmail}
                          onChange={(e) => setAgreeEmail(e.target.checked)}
                        />
                        <span>이메일로 이벤트 및 할인 소식을 받아보겠습니다.</span>
                      </label>
                      <label className="custom-check-item">
                        <input
                          type="checkbox"
                          checked={agreeSms}
                          onChange={(e) => setAgreeSms(e.target.checked)}
                        />
                        <span>문자(SMS)로 이벤트 및 할인 소식을 받아보겠습니다.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="figma-action-buttons">
                <button
                  type="button"
                  className="btn-action-cancel"
                  onClick={onGoBack || onOrderHistory}
                  disabled={saving}
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  className="btn-action-submit"
                  disabled={saving}
                >
                  {saving ? "수정 중..." : "수정 완료"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </main>
  );
}

