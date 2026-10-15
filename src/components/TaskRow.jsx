import { useEffect, useRef, useState } from 'react';
import { ACTIONS, CUSTOM_ACTION } from '../utils/formatReport.js';

export default function TaskRow({
  task,
  shouldFocus,
  onFocused,
  onChange,
  onRemove,
  onEnter,
  isDragging,
  onDragStart,
  onDragOver,
  onDragEnd,
}) {
  const inputRef = useRef(null);
  const customRef = useRef(null);
  // Only the handle makes the row draggable, so text inside the inputs stays selectable.
  const [dragArmed, setDragArmed] = useState(false);
  const isCustom = task.action === CUSTOM_ACTION;

  useEffect(() => {
    if (shouldFocus) {
      inputRef.current?.focus();
      onFocused();
    }
  }, [shouldFocus, onFocused]);

  const handleActionChange = (value) => {
    onChange({ action: value });
    if (value === CUSTOM_ACTION) requestAnimationFrame(() => customRef.current?.focus());
  };

  return (
    <li
      className={`task-row${isDragging ? ' dragging' : ''}`}
      draggable={dragArmed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        onDragStart();
      }}
      onDragOver={onDragOver}
      onDragEnd={() => {
        setDragArmed(false);
        onDragEnd();
      }}
    >
      <span
        className="drag-handle"
        title="Drag to reorder"
        aria-hidden="true"
        onMouseDown={() => setDragArmed(true)}
        onMouseUp={() => setDragArmed(false)}
      >
        ⋮⋮
      </span>
      <span className="ive">I've</span>
      <select
        value={task.action}
        onChange={(e) => handleActionChange(e.target.value)}
        aria-label="Action"
        className="action-select"
      >
        {ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
        <option value={CUSTOM_ACTION}>Custom...</option>
      </select>
      {isCustom && (
        <input
          ref={customRef}
          type="text"
          className="custom-action"
          value={task.customAction}
          onChange={(e) => onChange({ customAction: e.target.value })}
          placeholder="action word"
          aria-label="Custom action"
        />
      )}
      <input
        ref={inputRef}
        type="text"
        className="task-text"
        value={task.text}
        onChange={(e) => onChange({ text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder="e.g. Trilingual FAQ System"
        aria-label="Module or task name"
      />
      <button type="button" className="icon-btn remove-task" onClick={onRemove} title="Remove task">
        ×
      </button>
    </li>
  );
}
