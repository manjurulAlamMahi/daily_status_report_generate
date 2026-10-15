import { forwardRef } from 'react';

const Preview = forwardRef(function Preview({ text, onCopy, onClearTasks }, ref) {
  return (
    <aside className="card preview">
      <header className="preview-head">
        <h2 className="card-title">Live preview</h2>
        <div className="preview-actions">
          <button type="button" className="btn ghost small" onClick={onClearTasks}>
            Clear Tasks
          </button>
          <button type="button" className="btn primary" onClick={onCopy}>
            Copy Report
          </button>
        </div>
      </header>
      <pre ref={ref} className="preview-text" tabIndex={0} aria-label="Report preview">
        {text}
      </pre>
    </aside>
  );
});

export default Preview;
