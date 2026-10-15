export const CUSTOM_ACTION = 'custom';

export const ACTIONS = [
  'fixed',
  'developed',
  'optimized',
  'implemented',
  'designed',
  'completed',
  'updated',
  'added',
];

const CLIENT_SEPARATOR = '------------------------';
const REPORT_END = '------------ X -------------';

export function repoLabel(url) {
  const lower = url.toLowerCase();
  if (lower.includes('gitlab')) return 'GitLab';
  if (lower.includes('github')) return 'GitHub';
  return 'Repo';
}

/** Returns the formatted line for a task, or null if the task is empty. */
export function formatTask(task) {
  const text = (task.text || '').trim();
  if (!text) return null;
  const action = (task.action === CUSTOM_ACTION ? task.customAction || '' : task.action || '').trim();
  const line = `- I've ${action ? `${action} ` : ''}${text}`;
  return /[.!?]$/.test(line) ? line : `${line}.`;
}

export function isClientEmpty(client) {
  return (
    !client.name.trim() &&
    !client.profile.trim() &&
    !client.liveUrl.trim() &&
    !(client.figmaUrl || '').trim() &&
    !client.repoUrl.trim() &&
    client.tasks.every((t) => !formatTask(t))
  );
}

function formatClient(client) {
  const lines = [
    `Client name: ${client.name.trim()} | Profile name: ${client.profile.trim()}`,
    '',
  ];

  const tasks = client.tasks.map(formatTask).filter(Boolean);
  if (tasks.length) lines.push(...tasks, '');

  lines.push(`Working progress: ${Number(client.progress) || 0}%`);

  const live = client.liveUrl.trim();
  const figma = (client.figmaUrl || '').trim();
  const repo = client.repoUrl.trim();
  const branch = client.branch.trim();
  if (live) lines.push(`Live server: ${live}`);
  if (figma) lines.push(`Figma: ${figma}`);
  if (repo) lines.push(`${repoLabel(repo)}: ${repo}`);
  if (branch) lines.push(`branch: ${branch}`);

  return lines.join('\n');
}

/** Pure function: report state -> plain-text status message. */
export function formatReport({ date, memberName, teamName, clients }) {
  const header = [
    'STATUS OF THE DAY',
    `Date:${date.trim()}`,
    `Name: ${memberName.trim()}`,
    `Team Name: ${teamName.trim()}`,
  ].join('\n');

  const blocks = clients.filter((c) => !isClientEmpty(c)).map(formatClient);
  const body = blocks.join(`\n\n${CLIENT_SEPARATOR}\n\n`);
  return [header, body, REPORT_END].filter(Boolean).join('\n\n');
}

/** Problems worth warning about before the report is copied. */
export function findIssues({ memberName, clients }) {
  const issues = [];
  if (!memberName.trim()) issues.push('Member name is empty.');
  clients.forEach((c, i) => {
    const label = c.name.trim() || `Client ${i + 1}`;
    if (!c.name.trim()) issues.push(`Client ${i + 1}: client name is empty.`);
    if (!c.profile.trim()) issues.push(`${label}: profile name is empty.`);
    if (c.tasks.every((t) => !formatTask(t))) issues.push(`${label}: no tasks.`);
  });
  return issues;
}
