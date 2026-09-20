import { useEffect, useState } from "react";
import { createOrgUnit, fetchOrgUnits } from "./api";
import "./App.css";


const orgTypeLabel = {
  HEADQUARTER: "본사",
  BRANCH: "지사",
  STORE: "매장",
  WAREHOUSE: "창고",
};


const initialForm = {
  org_code: "",
  org_name: "",
  phone: "",
  email: "",
  address1: "",
};


export default function App() {
  const [orgUnits, setOrgUnits] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  async function loadOrgUnits() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await fetchOrgUnits();
      setOrgUnits(data);
    } catch (error) {
      setErrorMessage(
        "본사·지점 목록을 불러오지 못했습니다. FastAPI 서버가 실행 중인지 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadOrgUnits();
  }, []);


  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }


  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.org_code.trim() || !form.org_name.trim()) {
      setErrorMessage("조직 코드와 조직명은 반드시 입력해야 합니다.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await createOrgUnit(form);

      setSuccessMessage(
        `${form.org_name}이(가) 등록되었습니다. (조직 번호: ${result.org_id})`,
      );
      setForm(initialForm);

      await loadOrgUnits();
    } catch (error) {
      const detail = error.response?.data?.detail;

      setErrorMessage(
        detail || "지사 등록에 실패했습니다. 입력 내용을 확인하세요.",
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="app">
      <header className="top-header">
        <div>
          <p className="eyebrow">SHOPDB2 ADMIN</p>
          <h1>본사·지점 관리</h1>
          <p className="description">
            MySQL → FastAPI → React로 연결한 조직 목록입니다.
          </p>
        </div>

        <div className="count-box">
          <span>운영 조직</span>
          <strong>{orgUnits.length}</strong>
        </div>
      </header>

      <section className="content-card">
        <div className="section-title">
          <div>
            <h2>지사 등록</h2>
            <p>본사 아래에 새 지사를 등록합니다.</p>
          </div>
        </div>

        <form className="branch-form" onSubmit={handleSubmit}>
          <label>
            조직 코드 *
            <input
              name="org_code"
              value={form.org_code}
              onChange={handleChange}
              placeholder="예: BR006"
              maxLength="30"
            />
          </label>

          <label>
            조직명 *
            <input
              name="org_name"
              value={form.org_name}
              onChange={handleChange}
              placeholder="예: 스마트쇼핑 광주지사"
              maxLength="100"
            />
          </label>

          <label>
            전화번호
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="예: 062-555-5555"
              maxLength="30"
            />
          </label>

          <label>
            이메일
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="예: gwangju@smartshop.co.kr"
              maxLength="100"
            />
          </label>

          <label className="address-field">
            주소
            <input
              name="address1"
              value={form.address1}
              onChange={handleChange}
              placeholder="예: 광주광역시 서구"
              maxLength="255"
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "등록 중..." : "지사 등록"}
          </button>
        </form>

        {successMessage && (
          <p className="success-message">{successMessage}</p>
        )}

        {errorMessage && (
          <p className="error-message">{errorMessage}</p>
        )}
      </section>

      <section className="content-card">
        <div className="section-title">
          <div>
            <h2>조직 목록</h2>
            <p>본사와 지점의 기본 정보를 조회합니다.</p>
          </div>

          <button
            className="refresh-button"
            type="button"
            onClick={loadOrgUnits}
          >
            목록 새로고침
          </button>
        </div>

        {loading && <p className="message">조직 목록을 불러오는 중입니다.</p>}

        {!loading && !errorMessage && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>조직 코드</th>
                  <th>조직명</th>
                  <th>구분</th>
                  <th>상위 조직</th>
                  <th>전화번호</th>
                  <th>운영 상태</th>
                </tr>
              </thead>

              <tbody>
                {orgUnits.map((org) => (
                  <tr key={org.org_id}>
                    <td>{org.org_id}</td>
                    <td>{org.org_code}</td>
                    <td className="org-name">{org.org_name}</td>
                    <td>
                      <span className={`badge ${org.org_type.toLowerCase()}`}>
                        {orgTypeLabel[org.org_type] || org.org_type}
                      </span>
                    </td>
                    <td>{org.parent_org_name || "-"}</td>
                    <td>{org.phone || "-"}</td>
                    <td>
                      <span
                        className={
                          org.active_yn === "Y"
                            ? "status active"
                            : "status inactive"
                        }
                      >
                        {org.active_yn === "Y" ? "운영 중" : "비활성"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}