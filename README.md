# Daily Status Report Generator

Fill in your day, then copy a formatted status message into team chat. Built with React and Vite. There is no backend; data is saved in `localStorage`.

## Run

```bash
npm install
npm run dev        # open the URL it prints (usually http://localhost:5173)
```

Production build: `npm run build`, then `npm run preview` (or serve the `dist/` folder from any static host).

## Daily use

1. Your name, team and clients are remembered in this browser, and the date fills in with today's date. If you reopen the app on the same day, everything comes back. On a new day, only the client details come back (client name, profile, Live/Figma/Repo URLs, branch). Progress starts at 0 and the task list is empty.
2. Add clients, or pick them from **Load Saved Clients**. Then add tasks. Press Enter in a task to start a new row. Drag the ⋮⋮ handle to reorder tasks.
3. Click **Copy Report**. It warns you about missing required fields and clients with no tasks.
4. When your client list is set up, click **Save Clients as Template**. Saving replaces the previous template. The next day, load it and update only your tasks and progress.

**Clear Tasks** empties every task list. **Clear Clients** removes all clients; a saved template is kept.

Made by Manjurul Alam Mahi ([GitHub](https://github.com/manjurulAlamMahi) · [LinkedIn](https://www.linkedin.com/in/mahi-alam9/)). Source: https://github.com/manjurulAlamMahi/daily_status_report_generate

The report logic is in `src/utils/formatReport.js`. It's a pure function, so you can test it on its own.
