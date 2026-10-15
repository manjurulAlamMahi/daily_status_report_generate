import { useCallback, useRef, useState } from 'react';
import TextField from './TextField.jsx';
import TaskRow from './TaskRow.jsx';
import { formatTask } from '../utils/formatReport.js';
import { newTask } from '../utils/model.js';

export default function ClientBlock({ client, index, onChange, onRemove, showErrors }) {
  const [focusId, setFocusId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragId = useRef(null);
  const clearFocus = useCallback(() => setFocusId(null), []);

  const setTasks = (tasks) => onChange({ tasks });

  // New rows reuse the action word of the row above, so runs of "implemented" etc. are quick to enter.
  const insertTask = (at) => {
    const task = newTask(client.tasks[at - 1]);
    const tasks = [...client.tasks];
    tasks.splice(at, 0, task);
    setTasks(tasks);
    setFocusId(task.id);
  };

  const updateTask = (id, patch) =>
    setTasks(client.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTask = (id) => setTasks(client.tasks.filter((t) => t.id !== id));

  const handleDragOver = (e, overId) => {
    if (!dragId.current) return; // a drag from another client block
    e.preventDefault();
    if (dragId.current === overId) return;
    const tasks = [...client.tasks];
    const from = tasks.findIndex((t) => t.id === dragId.current);
    const to = tasks.findIndex((t) => t.id === overId);
    if (from < 0 || to < 0) return;
    tasks.splice(to, 0, tasks.splice(from, 1)[0]);
    setTasks(tasks);
  };

  const endDrag = () => {
    dragId.current = null;
    setDraggingId(null);
  };

  const taskCount = client.tasks.filter((t) => formatTask(t)).length;
  const title = [client.name.trim(), client.profile.trim()].filter(Boolean).join(' · ') || `Client ${index + 1}`;

  return (
    <section className={`card client${client.collapsed ? ' collapsed' : ''}`}>
      <header className="client-head">
        <button
          type="button"
          className="collapse-btn"
          onClick={() => onChange({ collapsed: !client.collapsed })}
          aria-expanded={!client.collapsed}
        >
          <span className="chevron" aria-hidden="true">▾</span>
          <span className="client-title">{title}</span>
        </button>
        <span className="client-meta">
          {taskCount} task{taskCount === 1 ? '' : 's'} · {client.progress}%
        </span>
        <button type="button" className="icon-btn danger" onClick={onRemove} title="Remove client">
          ×
        </button>
      </header>

      {!client.collapsed && (
        <div className="client-body">
          <div className="grid-2">
            <TextField
              label="Client name"
              value={client.name}
              onChange={(v) => onChange({ name: v })}
              required
              showErrors={showErrors}
              placeholder="e.g. Acme Corp"
            />
            <TextField
              label="Profile name"
              value={client.profile}
              onChange={(v) => onChange({ profile: v })}
              required
              showErrors={showErrors}
              placeholder="e.g. demo_profile"
            />
          </div>

          <label className="field">
            <span className="field-label">Working progress</span>
            <span className="progress-row">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={client.progress}
                onChange={(e) => onChange({ progress: Number(e.target.value) })}
                style={{ '--pct': `${client.progress}%` }}
              />
              <span className="progress-num">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={client.progress}
                  onChange={(e) =>
                    onChange({ progress: Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0))) })
                  }
                  aria-label="Working progress percent"
                />
                %
              </span>
            </span>
          </label>

          <div className="grid-2">
            <TextField
              label="Live server URL"
              optional
              value={client.liveUrl}
              onChange={(v) => onChange({ liveUrl: v })}
              placeholder="https://example.com/"
              inputMode="url"
            />
            <TextField
              label="Figma URL"
              optional
              value={client.figmaUrl}
              onChange={(v) => onChange({ figmaUrl: v })}
              placeholder="https://www.figma.com/design/…"
              inputMode="url"
            />
            <TextField
              label="Repo URL (GitLab/GitHub)"
              optional
              value={client.repoUrl}
              onChange={(v) => onChange({ repoUrl: v })}
              placeholder="https://gitlab.com/team/repo"
              inputMode="url"
            />
            <TextField
              label="Branch"
              optional
              value={client.branch}
              onChange={(v) => onChange({ branch: v })}
              placeholder="main"
            />
          </div>

          <div className="tasks">
            <span className="field-label">Tasks</span>
            <ul className={`task-list${showErrors && taskCount === 0 ? ' empty-warning' : ''}`}>
              {client.tasks.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  shouldFocus={focusId === task.id}
                  onFocused={clearFocus}
                  onChange={(patch) => updateTask(task.id, patch)}
                  onRemove={() => removeTask(task.id)}
                  onEnter={() => insertTask(i + 1)}
                  isDragging={draggingId === task.id}
                  onDragStart={() => {
                    dragId.current = task.id;
                    setDraggingId(task.id);
                  }}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDragEnd={endDrag}
                />
              ))}
            </ul>
            {showErrors && taskCount === 0 && <p className="hint warn">This client has no tasks yet.</p>}
            <button type="button" className="btn ghost small" onClick={() => insertTask(client.tasks.length)}>
              + Add Task
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
