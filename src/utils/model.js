let counter = 0;
export const uid = () => `${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** A blank task; pass a previous task to carry over its action word. */
export const newTask = (prev) => ({
  id: uid(),
  action: prev?.action ?? 'completed',
  customAction: prev?.customAction ?? '',
  text: '',
});

export const newClient = (details = {}) => ({
  id: uid(),
  name: '',
  profile: '',
  progress: 0,
  liveUrl: '',
  figmaUrl: '',
  repoUrl: '',
  branch: '',
  collapsed: false,
  ...details,
  tasks: [newTask()],
});

/** The client fields that are saved in a template. */
export const templateFields = ({ name, profile, liveUrl, figmaUrl, repoUrl, branch }) => ({
  name,
  profile,
  liveUrl,
  figmaUrl,
  repoUrl,
  branch,
});
