# Pipeline Builder — VectorShift Frontend Assessment

A drag-and-drop pipeline editor (React + React Flow) with a FastAPI backend that
validates the pipeline graph.

## Running

**Backend** (from `/backend`):

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend** (from `/frontend`):

```bash
npm i
npm start
```

The frontend expects the backend at `http://localhost:8000`. Override with a
`REACT_APP_API_URL` environment variable if needed.

## How it's built

### Part 1 — Node abstraction

Every node is one `BaseNode` component driven by a plain config object. To add a
node you add a single entry to [`src/nodes/nodeConfigs.js`](frontend/src/nodes/nodeConfigs.js) —
no new component, JSX or styling. A config declares its header, its fields, and
its handles:

```js
{
  type: 'math', label: 'Math', icon: '∑', accent: 'cyan',
  fields: [
    { name: 'operation', label: 'Operation', type: 'select',
      default: 'add', options: ['add', 'subtract', 'multiply', 'divide'] },
  ],
  handles: [
    { name: 'a', type: 'target', position: 'left', label: 'a' },
    { name: 'b', type: 'target', position: 'left', label: 'b' },
    { name: 'result', type: 'source', position: 'right' },
  ],
}
```

Key pieces:

- [`components/BaseNode.js`](frontend/src/components/BaseNode.js) — renders chrome, fields, handles and store wiring from a config.
- [`components/NodeField.js`](frontend/src/components/NodeField.js) — one place that maps a field type (`text`, `textarea`, `select`, `number`, `checkbox`, `slider`, `readonly`) to a control.
- [`nodes/index.js`](frontend/src/nodes/index.js) — builds the React Flow `nodeTypes`, the toolbar list and each node's initial data from the configs.

`fields` and `handles` can be **functions of the node's own data**, which is how a
node derives handles from live state. The five demo nodes (Filter, Math, API
Request, Condition, Merge) exercise every field type and both static and
data-driven handles — Merge grows its input handles to match an "Inputs" field.

### Part 2 — Styling

A token-based design system in [`src/index.css`](frontend/src/index.css) (`:root`
custom properties) drives every component and supports light/dark automatically.
Changing one token restyles the whole app. Each node/accent is a single token
name in its config.

### Part 3 — Text node logic

- **Autosize** — [`components/AutosizeTextarea.js`](frontend/src/components/AutosizeTextarea.js) grows the field in width (longest line) and height (measured scrollHeight), both clamped.
- **Variables** — [`nodes/textVariables.js`](frontend/src/nodes/textVariables.js) extracts `{{ variable }}` references (valid, non-reserved JS identifiers only). The Text config maps each to a left-side target handle, so handles appear/disappear as you type. Removing a variable prunes any edge that was attached to it.

### Part 4 — Backend integration

- [`submit.js`](frontend/src/submit.js) POSTs the nodes and edges to `/pipelines/parse` and shows the analysis in a dialog ([`components/PipelineResultDialog.js`](frontend/src/components/PipelineResultDialog.js)) — node count, edge count, and whether the graph is a DAG, with a plain-language verdict.
- [`backend/main.py`](backend/main.py) returns `{num_nodes, num_edges, is_dag}`. DAG detection uses Kahn's algorithm (topological sort); self-loops and cycles are correctly reported as non-DAG.
