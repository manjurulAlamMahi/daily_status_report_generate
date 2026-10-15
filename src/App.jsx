import { useEffect, useMemo, useRef, useState } from 'react';
import ReportHeader from './components/ReportHeader.jsx';
import ClientBlock from './components/ClientBlock.jsx';
import Preview from './components/Preview.jsx';
import Torch from './components/Torch.jsx';
import { ACTIONS, CUSTOM_ACTION, findIssues, formatReport, isClientEmpty } from './utils/formatReport.js';
import { KEYS, load, remove, save } from './utils/storage.js';
import { today } from './utils/date.js';
import { newClient, newTask, templateFields } from './utils/model.js';

/**
 * Clients are remembered in this browser. Reopened the same day, everything comes back;
 * on a new day only the client details are kept, with progress at 0 and no tasks.
 */
/** Saved tasks may use an action word that has since left the list; keep it as a custom word. */
const keepActionWord = (t) =>
  t.action === CUSTOM_ACTION || ACTIONS.includes(t.action) ? t : { ...t, action: CUSTOM_ACTION, customAction: t.action };

function restoreClients() {
  const draft = load(KEYS.draft, null);
  const saved = Array.isArray(draft) ? { date: null, clients: draft } : draft; // older drafts were a bare array
  if (!saved?.clients?.length) return [newClient()];
  const filled = saved.clients.map((c) => ({ ...newClient(), ...c, tasks: (c.tasks || []).map(keepActionWord) }));
  return saved.date === today() ? filled : filled.map((c) => newClient(templateFields(c)));
}

const initialTheme = () =>
  load(KEYS.theme, null) ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export default function App() {
  const [date, setDate] = useState(today);
  const [rememberDetails, setRememberDetails] = useState(() => load(KEYS.remember, true));
  const [memberName, setMemberName] = useState(() => load(KEYS.member, ''));
  const [teamName, setTeamName] = useState(() => load(KEYS.team, 'Logic Lab'));
  const [clients, setClients] = useState(restoreClients);
  const [savedClients, setSavedClients] = useState(() => load(KEYS.templates, []));
  const [theme, setTheme] = useState(initialTheme);
  const [torchOn, setTorchOn] = useState(() => load(KEYS.torch, false));
  const torchActive = theme === 'dark' && torchOn;
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState(null);
  const previewRef = useRef(null);
  const toastTimer = useRef(null);

  // Name and team are stored only while "Remember" is on; turning it off forgets them.
  useEffect(() => {
    save(KEYS.remember, rememberDetails);
    if (rememberDetails) {
      save(KEYS.member, memberName);
      save(KEYS.team, teamName);
    } else {
      remove(KEYS.member);
      remove(KEYS.team);
    }
  }, [rememberDetails, memberName, teamName]);
  useEffect(() => save(KEYS.draft, { date: today(), clients }), [clients]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    save(KEYS.theme, theme);
  }, [theme]);
  useEffect(() => {
    save(KEYS.torch, torchOn);
    document.documentElement.classList.toggle('torch-cursor', torchActive);
  }, [torchOn, torchActive]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const report = useMemo(
    () => formatReport({ date, memberName, teamName, clients }),
    [date, memberName, teamName, clients],
  );

  const notify = (message, kind = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ message, kind, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const updateHeader = (patch) => {
    if ('date' in patch) setDate(patch.date);
    if ('memberName' in patch) setMemberName(patch.memberName);
    if ('teamName' in patch) setTeamName(patch.teamName);
  };

  const updateClient = (id, patch) => setClients((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const removeClient = (id) => {
    const client = clients.find((c) => c.id === id);
    if (client && !isClientEmpty(client) && !window.confirm(`Remove ${client.name.trim() || 'this client'}?`)) return;
    setClients((cs) => cs.filter((c) => c.id !== id));
  };

  const addClient = () => setClients((cs) => [...cs, newClient()]);

  const clearTasks = () => {
    if (!window.confirm('Clear all tasks? Member and client details are kept.')) return;
    setClients((cs) => cs.map((c) => ({ ...c, tasks: [newTask()] })));
    setShowErrors(false);
    notify('Tasks cleared');
  };

  const clearClients = () => {
    if (!window.confirm('Remove all clients? Your saved template is kept.')) return;
    setClients([newClient()]);
    setShowErrors(false);
    notify('Clients cleared');
  };

  const saveTemplate = () => {
    const toSave = clients.filter((c) => c.name.trim() || c.profile.trim()).map(templateFields);
    if (!toSave.length) {
      notify('Add a client name first', 'error');
      return;
    }
    setSavedClients(toSave);
    save(KEYS.templates, toSave);
    notify(`Saved ${toSave.length} client${toSave.length === 1 ? '' : 's'} as template`);
  };

  const loadSaved = (value) => {
    if (value === '') return;
    const picked = value === 'all' ? savedClients : [savedClients[Number(value)]];
    const added = picked.map((details) => newClient(details));
    // Replace the untouched starter block instead of leaving it dangling.
    setClients((cs) => [...cs.filter((c) => !isClientEmpty(c)), ...added]);
    notify(`Loaded ${added.length} client${added.length === 1 ? '' : 's'}`);
  };

  const fallbackCopy = () => {
    const node = previewRef.current;
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    if (ok) notify('Copied!');
    else notify('Text selected. Press Ctrl/Cmd+C to copy', 'error');
  };

  const copyReport = async () => {
    const issues = findIssues({ memberName, clients });
    if (issues.length) {
      setShowErrors(true);
      if (!window.confirm(`Before you copy:\n\n• ${issues.join('\n• ')}\n\nCopy anyway?`)) return;
    }
    try {
      await navigator.clipboard.writeText(report);
      notify('Copied!');
    } catch {
      fallbackCopy();
    }
  };

  return (
    <>
      {torchActive && <Torch />}
      <header className="topbar">
        <h1>Daily Status Report</h1>
        <div className="topbar-actions">
          {theme === 'dark' && (
            <button
              type="button"
              className={`icon-btn torch-toggle${torchOn ? ' on' : ''}`}
              onClick={() => setTorchOn((on) => !on)}
              aria-pressed={torchOn}
              aria-label="Night torch"
              title={`Night torch: ${torchOn ? 'on' : 'off'}`}
            >
              🔦
            </button>
          )}
          <button
            type="button"
            className="icon-btn theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="app">
        <main className="layout">
          <div className="form-col">
            <ReportHeader
              date={date}
              memberName={memberName}
              teamName={teamName}
              onChange={updateHeader}
              showErrors={showErrors}
              remember={rememberDetails}
              onRememberChange={(on) => {
                setRememberDetails(on);
                notify(on ? 'Details will be remembered' : 'Details will not be saved');
              }}
            />

            <div className="section-bar">
              <h2>Clients</h2>
              <div className="section-actions">
                <select
                  className="load-select"
                  value=""
                  onChange={(e) => loadSaved(e.target.value)}
                  disabled={!savedClients.length}
                  aria-label="Load saved clients"
                >
                  <option value="">{savedClients.length ? 'Load Saved Clients…' : 'No saved clients'}</option>
                  {savedClients.length > 1 && <option value="all">All saved clients ({savedClients.length})</option>}
                  {savedClients.map((c, i) => (
                    <option key={i} value={i}>
                      {[c.name, c.profile].filter(Boolean).join(' · ')}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn ghost small" onClick={saveTemplate}>
                  Save Clients as Template
                </button>
                <button type="button" className="btn ghost small danger" onClick={clearClients}>
                  Clear Clients
                </button>
              </div>
            </div>

            {clients.map((client, i) => (
              <ClientBlock
                key={client.id}
                client={client}
                index={i}
                onChange={(patch) => updateClient(client.id, patch)}
                onRemove={() => removeClient(client.id)}
                showErrors={showErrors}
              />
            ))}

            <button type="button" className="btn dashed" onClick={addClient}>
              + Add Client
            </button>
          </div>

          <div className="preview-col">
            <Preview ref={previewRef} text={report} onCopy={copyReport} onClearTasks={clearTasks} />
          </div>
        </main>

        {toast && (
          <div key={toast.key} className={`toast ${toast.kind}`} role="status">
            {toast.message}
          </div>
        )}
      </div>
      <footer className="footer">
        <p>
          Made by <strong>Manjurul Alam Mahi</strong> <span aria-hidden="true">😴</span>
        </p>
        <nav className="footer-links">
          <a
            href="https://github.com/manjurulAlamMahi"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            aria-label="GitHub"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/mahi-alam9/"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
            </svg>
          </a>
          <a
            href="https://github.com/manjurulAlamMahi/daily_status_report_generate"
            target="_blank"
            rel="noopener noreferrer"
            title="Source code"
            className="code-link"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
            </svg>
            Code
          </a>
        </nav>
      </footer>
    </>
  );
}
