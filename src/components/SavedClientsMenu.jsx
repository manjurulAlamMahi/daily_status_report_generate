import { useEffect, useRef, useState } from 'react';

/** Dropdown of saved clients: click one to add it to the report, or × to delete it from the saved list. */
export default function SavedClientsMenu({ saved, onLoad, onRemove }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  useEffect(() => {
    if (!saved.length) setOpen(false);
  }, [saved.length]);

  const load = (value) => {
    onLoad(value);
    setOpen(false);
  };

  return (
    <div className="saved-menu" ref={rootRef}>
      <button
        type="button"
        className="btn ghost small saved-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={!saved.length}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {saved.length ? `Saved Clients (${saved.length})` : 'No saved clients'}
        <span className="chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="saved-popover">
          {saved.length > 1 && (
            <button type="button" className="saved-item all" onClick={() => load('all')}>
              Load all saved clients
            </button>
          )}
          <ul>
            {saved.map((c, i) => (
              <li key={`${c.name}-${c.profile}-${i}`} className="saved-row">
                <button type="button" className="saved-item" onClick={() => load(i)} title="Add to report">
                  <span className="saved-name">{c.name || 'Untitled client'}</span>
                  {c.profile && <span className="saved-profile">{c.profile}</span>}
                </button>
                <button
                  type="button"
                  className="icon-btn remove-saved"
                  onClick={() => onRemove(i)}
                  title="Remove from saved clients"
                  aria-label={`Remove ${c.name || 'client'} from saved clients`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
