import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">
            ◆
          </span>
          <div>
            <h1 className="app__title">Pipeline Builder</h1>
            <p className="app__subtitle">Design, connect and validate a pipeline</p>
          </div>
        </div>
        <SubmitButton />
      </header>

      <div className="app__body">
        <PipelineToolbar />
        <PipelineUI />
      </div>
    </div>
  );
}

export default App;
