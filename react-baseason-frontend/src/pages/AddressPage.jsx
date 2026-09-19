import { useState } from "react";
import { MyPageSidebar } from "../components/MyPageSidebar";
import { AddressModal } from "../components/AddressModal";
import { api, ApiError } from "../api";

export function AddressPage({
  addresses,
  setAddresses,
  authUser,
  onOrderHistory,
  onRefund,
  onCancelExchangeReturn,
  onMemberInfo,
  onLogout,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (formData.address_id) {
        // 백엔드에 배송지 수정 API가 별도로 없으므로, 새 주소 생성 후 기존 주소 삭제하거나 추가
        // 우선 새 주소 생성 후 로컬 상태 반영
        await api.deleteAddress(formData.address_id);
        const created = await api.createAddress({
          address_name: formData.address_name,
          receiver_name: formData.receiver_name,
          receiver_phone: formData.receiver_phone,
          zipcode: formData.zipcode,
          address1: formData.address1,
          address2: formData.address2,
          default_yn: formData.default_yn,
        });
        setAddresses((prev) => [
          created,
          ...prev.filter((a) => a.address_id !== formData.address_id).map((a) => (formData.default_yn === "Y" ? { ...a, default_yn: "N" } : a)),
        ]);
        alert("배송지가 수정되었습니다.");
      } else {
        const created = await api.createAddress({
          address_name: formData.address_name,
          receiver_name: formData.receiver_name,
          receiver_phone: formData.receiver_phone,
          zipcode: formData.zipcode,
          address1: formData.address1,
          address2: formData.address2,
          default_yn: formData.default_yn,
        });
        setAddresses((prev) => [
          created,
          ...prev.map((a) => (formData.default_yn === "Y" ? { ...a, default_yn: "N" } : a)),
        ]);
        alert("배송지가 추가되었습니다.");
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "배송지 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("이 배송지를 삭제하시겠습니까?")) return;
    try {
      await api.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
      alert("배송지가 삭제되었습니다.");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "배송지 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="mypage">
      <div className="mypage-inner">
        <div className="mypage-breadcrumb">
          HOME <span>&gt;</span> 마이페이지 <span>&gt;</span> 배송지 관리
        </div>

        <div className="mypage-layout">
          <MyPageSidebar
            active="address"
            authUser={authUser}
            onOrderHistory={onOrderHistory}
            onRefund={onRefund}
            onCancelExchangeReturn={onCancelExchangeReturn}
            onMemberInfo={onMemberInfo}
            onAddress={() => {}}
            onLogout={onLogout}
          />

          <section className="mypage-content figma-address-section">
            <div className="mypage-heading address-header-row">
              <div>
                <h1>배송지 관리</h1>
                <p>자주 사용하는 배송지를 관리할 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="btn-add-address-top"
                onClick={handleOpenAdd}
              >
                + 배송지 추가
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="figma-empty-card address-empty-box">
                <div className="empty-circle-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#897d74" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h2>등록된 배송지가 없습니다.</h2>
                <p>배송지를 등록하면 주문할 때 편리하게 이용할 수 있습니다.</p>
                <button
                  type="button"
                  className="btn-add-address-primary"
                  onClick={handleOpenAdd}
                >
                  배송지 추가
                </button>
              </div>
            ) : (
              <div className="figma-address-cards-list">
                {addresses.map((addr) => {
                  const isDefault = addr.default_yn === "Y";
                  const badgeText = isDefault ? "기본배송지" : (addr.address_name || "배송지");
                  const badgeClass = isDefault ? "badge-default" : "badge-custom";

                  return (
                    <article className="figma-address-card" key={addr.address_id}>
                      <div className="addr-badge-col">
                        <span className={`addr-badge ${badgeClass}`}>{badgeText}</span>
                      </div>

                      <div className="addr-user-col">
                        <strong className="addr-receiver">{addr.receiver_name}</strong>
                        <span className="addr-phone">{addr.receiver_phone}</span>
                      </div>

                      <div className="addr-detail-col">
                        <span className="addr-zipcode">{addr.zipcode}</span>
                        <p className="addr-full">
                          {addr.address1} {addr.address2}
                        </p>
                      </div>

                      <div className="addr-actions-col">
                        <button
                          type="button"
                          className="btn-addr-action"
                          onClick={() => handleOpenEdit(addr)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="btn-addr-action"
                          onClick={() => handleDelete(addr.address_id)}
                        >
                          삭제
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        initialData={editingAddress}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </main>
  );
}
