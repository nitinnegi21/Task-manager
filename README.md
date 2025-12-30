# Task Manager - Frontend

This is the frontend for the task management app. Built it with React because, well, that's what I know best.

## What's inside?

A clean, dark-themed interface where you can:
- Add and edit tasks
- Mark tasks as complete (satisfying checkbox clicks!)
- Filter tasks by status and priority
- See some basic stats about your tasks
- Delete tasks when they're done (or when you change your mind)

## Tech I used

- **React** - Obviously
- **Tailwind CSS** - For styling (way faster than writing custom CSS)
- **Lucide React** - Icons that actually look good
- **Axios** - For API calls (better than fetch IMO)

## Quick Start

### You'll need

- Node.js (v14 or newer should work)
- The backend running (check the backend README if you haven't set that up yet)

### Get it running

```bash
# Install everything
npm install

# Create your .env file
cp .env.example .env

# Start the dev server
npm start
```

Should open automatically at `http://localhost:3000`. If not, just open that in your browser.

## Environment Setup

Create a `.env` file with this:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Change the URL if your backend is running somewhere else.

## Project Structure

Kept it simple:

```
src/
├── components/
│   └── TaskManager.jsx      # Main component (everything's here)
├── utility/
│   └── servicecall.js       # API wrapper using axios
├── App.js
└── index.js
```

Yeah, it's all in one component right now. Could definitely split this up more if the app grows.

## Features Breakdown

### Task Management
- Create new tasks with title, description, priority, and due date
- Edit existing tasks (click the edit icon)
- Delete tasks (with confirmation, because accidents happen)
- Toggle completion status with a checkbox

### Filtering
Quick filters for:
- All tasks
- Pending only
- Completed only
- High priority tasks

### Statistics
Click the "Statistics" button to see:
- Total number of tasks
- How many are done vs pending
- Breakdown by priority level

### UI Stuff
- Loading spinner when API calls are happening
- Success messages that auto-dismiss
- Error messages if something breaks
- Dark theme (easier on the eyes)
- Responsive design (works on mobile too)

## API Integration

All API calls go through the `ServiceCall` class in `utility/servicecall.js`. It's a thin wrapper around axios that handles:
- Base URL configuration
- Request headers
- Error handling

Example of how I'm using it:

```javascript
// GET request
const response = await ServiceCall.getv2('/tasks');

// POST request
await ServiceCall.postv2('/tasks', '', taskData);

// PUT request
await ServiceCall.putv2('/tasks/', taskId, updatedData);
```

## Available Scripts

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests (if you add any)
npm test

# Eject from Create React App (don't do this unless you really need to)
npm run eject
```

## How to use it

1. **Adding a task**: Click "Add Task" button, fill in the details, hit "Create Task"
2. **Completing a task**: Just click the circle checkbox next to it
3. **Editing a task**: Click the edit icon, make your changes, save it
4. **Deleting a task**: Click the trash icon (it'll ask you to confirm)
5. **Filtering**: Use the filter buttons to show specific tasks
6. **Stats**: Click "Statistics" to see the numbers

## Common Issues

**"API Error: Network Error"**
- Backend probably isn't running
- Check if `REACT_APP_API_BASE_URL` in `.env` is correct
- Make sure CORS is enabled on the backend

**Tasks not loading**
- Check the browser console for errors
- Verify the backend is returning data (test with curl or Postman)

**Build errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Sometimes this just happens with npm 

**Styling looks weird**
- Make sure Tailwind is properly configured
- Check if `index.css` is importing Tailwind

## Things I'd improve

If I had more time:
- Split TaskManager into smaller components (it's getting big)
- Add proper form validation before hitting the API
- Add task search functionality
- Implement drag-and-drop for reordering
- Add keyboard shortcuts for power users
- Maybe add some animations for task completion (confetti?)
- Dark/light theme toggle

## Browser Support

Works on:
- Chrome (and anything Chromium-based)
- Firefox
- Safari
- Edge

Probably breaks on IE11, but who's using that in 2024?

## Production Build

To build for production:

```bash
npm run build
```

This creates an optimized build in the `build/` folder. You can serve it with any static hosting service (Netlify, Vercel, etc.).

For quick testing:

```bash
npm install -g serve
serve -s build
```

## Customization

### Changing colors

All colors are defined using Tailwind classes. Main ones to look for:
- `bg-gray-900` - Main background
- `bg-blue-600` - Primary buttons
- `text-gray-100` - Primary text

### Adding new filters

In the filters section, just add to the array:

```javascript
{ key: 'medium', label: 'Medium Priority' }
```

Then add the filter logic in the `filteredTasks` function.

## Notes

- All timestamps from the backend are in UTC, converted to local time for display
- The loading overlay blocks the entire screen - maybe change this to per-component loading states
- I'm using localStorage... wait, no I'm not. Everything's in state. Refresh = lose everything
- Error handling could be better - right now just showing a basic error message

## Dependencies

Main ones:
```json
{
  "react": "^18.2.0",
  "axios": "^1.6.2",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.3.0"
}
```

## Contributing

If you want to add features:
1. Make your changes
2. Test it actually works
3. Make sure it doesn't break existing stuff
4. Submit a PR

## License

Same as the backend - MIT

---

Made this for a college assignment. Feel free to use it for yours too 