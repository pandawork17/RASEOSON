import { useEffect, useState } from "react";
import { fetchCompanyPolicies } from "./api";

export default function CompanyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadPolicies() {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await fetchCompanyPolicies();
      setPolicies(data);
    } catch {
      setErrorMessage(
        "회사 정책을 불러오지 못했습니다. FastAPI 서버를 확인하세요.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <section className="content-card">
      <div className="section-title">
        <div>
          <h2>회사 정책</h2>
          <p>백업 DB에 저장된 회사 정책과 버전을 조회합니다.</p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={loadPolicies}
        >
          정책 새로고침
        </button>
      </div>

      {loading && (
        <p className="message">회사 정책을 불러오는 중입니다.</p>
      )}

      {errorMessage && (
        <p className="error-message">{errorMessage}</p>
      )}

      {!loading && !errorMessage && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>번호</th>
                <th>정책 코드</th>
                <th>정책명</th>
                <th>버전</th>
                <th>종류</th>
                <th>소속 조직</th>
                <th>적용 시작일</th>
                <th>적용 종료일</th>
                <th>상태</th>
                <th>내용</th>
              </tr>
            </thead>

            <tbody>
              {policies.map((policy) => (
                <tr key={policy.policy_id}>
                  <td>{policy.policy_id}</td>
                  <td>{policy.policy_code}</td>
                  <td className="org-name">{policy.policy_name}</td>
                  <td>{policy.policy_version}</td>
                  <td>{policy.policy_type || "-"}</td>
                  <td>{policy.org_name || "-"}</td>
                  <td>{policy.effective_from || "-"}</td>
                  <td>{policy.effective_to || "-"}</td>
                  <td>
                    <span
                      className={
                        policy.active_yn === "Y"
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {policy.active_yn === "Y" ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      내용 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPolicy && (
        <div className="content-card" style={{ marginTop: "24px" }}>
          <div className="section-title">
            <div>
              <h2>
                {selectedPolicy.policy_name} {selectedPolicy.policy_version}
              </h2>
              <p>기존 company_policies 정책 내용입니다.</p>
            </div>

            <button
              className="cancel-button"
              type="button"
              onClick={() => setSelectedPolicy(null)}
            >
              닫기
            </button>
          </div>

          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
            {selectedPolicy.policy_content || "등록된 정책 내용이 없습니다."}
          </p>
        </div>
      )}
    </section>
  );
}