export function CommunitySidebar({ active = "qna", onNotice, onQnA }) {
  return (
    <aside className="community-sidebar">
      <h2 className="community-sidebar-title">COMMUNITY</h2>
      <nav className="community-nav">
        <button
          className={active === "notice" ? "active" : ""}
          type="button"
          onClick={onNotice}
        >
          NOTICE
        </button>
        <button
          className={active === "qna" ? "active" : ""}
          type="button"
          onClick={onQnA}
        >
          Q&A
        </button>
      </nav>
    </aside>
  );
}

