import { useEffect, useState } from "react";
import { openDaumPostcode } from "../utils";

export function AddressModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  saving = false,
}) {
  const [receiverName, setReceiverName] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [phoneMid, setPhoneMid] = useState("");
  const [phoneEnd, setPhoneEnd] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [addressName, setAddressName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialData) {
      setReceiverName(initialData.receiver_name || "");
      const phoneParts = (initialData.receiver_phone || "").split("-");
      if (phoneParts.length === 3) {
        setPhonePrefix(phoneParts[0] || "010");
        setPhoneMid(phoneParts[1] || "");
        setPhoneEnd(phoneParts[2] || "");
      } else {
        setPhonePrefix("010");
        setPhoneMid("");
        setPhoneEnd("");
      }
      setZipcode(initialData.zipcode || "");
      setAddress1(initialData.address1 || "");
      setAddress2(initialData.address2 || "");
      setAddressName(initialData.address_name || "");
      setIsDefault(initialData.default_yn === "Y");
    } else {
      setReceiverName("");
      setPhonePrefix("010");
      setPhoneMid("");
      setPhoneEnd("");
      setZipcode("");
      setAddress1("");
      setAddress2("");
      setAddressName("");
      setIsDefault(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePostcode = () => {
    openDaumPostcode(({ zonecode, address }) => {
      setZipcode(zonecode);
      setAddress1(address);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      alert("받는 분 이름을 입력해주세요.");
      return;
    }
    if (!phoneMid.trim() || !phoneEnd.trim()) {
      alert("연락처를 모두 입력해주세요.");
      return;
    }
    if (!zipcode.trim() || !address1.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    const fullPhone = `${phonePrefix}-${phoneMid.trim()}-${phoneEnd.trim()}`;
    onSave({
      address_id: initialData?.address_id,
      receiver_name: receiverName.trim(),
      receiver_phone: fullPhone,
      zipcode: zipcode.trim(),
      address1: address1.trim(),
      address2: address2.trim(),
      address_name: addressName.trim() || "기본배송지",
      default_yn: isDefault ? "Y" : "N",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? "배송지 수정" : "배송지 추가"}</h2>
          <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">
            &times;
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group-row">
            <label className="form-label required">받는 분</label>
            <div className="form-field">
              <input
                type="text"
                placeholder="이름을 입력해주세요."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label required">연락처</label>
            <div className="form-field phone-field-group">
              <select
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
              <span>-</span>
              <input
                type="text"
                maxLength={4}
                value={phoneMid}
                onChange={(e) => setPhoneMid(e.target.value.replace(/\D/g, ""))}
                required
              />
              <span>-</span>
              <input
                type="text"
                maxLength={4}
                value={phoneEnd}
                onChange={(e) => setPhoneEnd(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label required">우편번호</label>
            <div className="form-field zip-field-group">
              <input
                type="text"
                placeholder="우편번호"
                value={zipcode}
                readOnly
                required
              />
              <button
                type="button"
                className="btn-search-postcode"
                onClick={handlePostcode}
              >
                우편번호 찾기
              </button>
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label required">주소</label>
            <div className="form-field">
              <input
                type="text"
                placeholder="기본 주소를 입력해주세요."
                value={address1}
                readOnly
                onClick={handlePostcode}
                required
              />
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label">상세주소</label>
            <div className="form-field">
              <input
                type="text"
                placeholder="상세 주소를 입력해주세요. (선택)"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row">
            <label className="form-label">배송지 별칭</label>
            <div className="form-field">
              <input
                type="text"
                placeholder="예) 집, 회사, 부모님댁 (선택)"
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group-row checkbox-row">
            <div className="form-label"></div>
            <div className="form-field">
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span>기본 배송지로 설정</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              취소하기
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
