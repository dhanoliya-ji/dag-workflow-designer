# DAG Workflow Designer

A full-stack, drag-and-drop workflow builder that allows users to visually design, connect, and validate complex node pipelines. 

The application features an extensible, configuration-driven UI frontend built with **React, React Flow, and Zustand**, backed by a high-performance **FastAPI** server that runs topological graph analysis (Kahn's Algorithm) to validate pipeline structure.

---

## ✨ Features

- **🔌 Data-Driven Node Abstraction**: Add new nodes in seconds! A generic, unified node engine renders widgets (sliders, inputs, dropdowns) and socket connections dynamically from simple JavaScript config objects.
- **📝 Dynamic Text Variables**: Use double-curly brackets (e.g. `{{ variable_name }}`) to add parameters inside template strings on-the-fly. The frontend automatically parses variables, generates target socket handles, and prunes dangling edges upon removal.
- **🌐 Topological DAG Validation**: Validate your graph's structure. The backend detects circular loops and self-connections using **Kahn's Algorithm** (topological sorting) to verify Directed Acyclic Graph (DAG) compliance.
- **🎨 Premium Interface & Design System**: Responsive glassmorphism canvas, adaptive light/dark mode styling, smooth transitions, and distinct custom color accents.

---

## 🛠️ Tech Stack

- **Frontend**: React (v18), React Flow, Zustand (State Management), Vanilla CSS (Token-based custom properties)
- **Backend**: Python, FastAPI, Uvicorn, Pydantic (data parsing)

---

## 📂 Project Structure

```
├── backend/                   # FastAPI Python backend
│   ├── main.py                # Graph parsing API & Kahn's Algorithm logic
│   └── requirements.txt       # Python dependencies
├── frontend/                  # React frontend web app
│   ├── public/                # Static assets & HTML template
│   └── src/
│       ├── components/        # BaseNode, AutosizeTextarea, UI elements
│       ├── nodes/             # Dynamic handles parsing, configs list
│       ├── store.js           # Zustand global state (edges, nodes, pruning)
│       └── ui.js              # React Flow canvas wrapper
└── README.md
```

---

## 🚀 Running the Project

### 1. Start the Backend API
Navigate to the `backend` directory, install requirements, and run the server using Uvicorn:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*The API server will listen on `http://localhost:8000`.*

### 2. Start the Frontend Web App
Open a separate terminal window, navigate to the `frontend` directory, install packages, and start the development server:
```bash
cd frontend
npm install

# Start the dev server (defaults to port 3000, or override port if needed)
npm start
```
*Open `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied) to view the builder.*

---

## ⚙️ Adding New Custom Nodes

Adding a new node requires **zero new components, JSX, or CSS styles**. Simply add a plain configuration object to `frontend/src/nodes/nodeConfigs.js`:

```javascript
{
  type: 'math',
  label: 'Math Operator',
  icon: '∑',
  accent: 'cyan', // Maps to standard index.css color tokens
  description: 'Combine two inputs',
  fields: [
    { 
      name: 'operation', 
      label: 'Operation', 
      type: 'select', 
      default: 'add', 
      options: ['add', 'subtract', 'multiply', 'divide'] 
    }
  ],
  handles: [
    { name: 'a', type: 'target', position: 'left', label: 'a' },
    { name: 'b', type: 'target', position: 'left', label: 'b' },
    { name: 'result', type: 'source', position: 'right' }
  ]
}
```
The node abstraction layer handles component mounting, property updates, user state sync, handle alignments, and React Flow connections automatically.
