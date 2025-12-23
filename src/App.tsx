import { useState } from 'react';
import './App.css';
import { StoreProvider } from './store/StoreProvider';
import { Button } from './components/ui/button';
import { SchemaSettings } from './features/schema/SchemaSettings';
import { DocumentsPage } from './features/documents/DocumentsPage';

type ActiveView = 'settings' | 'documents';

function AppShell() {
  const [activeView, setActiveView] = useState<ActiveView>('documents');

  return (
    <div className="min-h-screen text-slate-900">
      <header className="glass sticky top-0 z-30 border-b border-white/20 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent">
            CSV CMS for InDesign Data Merge
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant={activeView === 'documents' ? 'default' : 'outline'}
              onClick={() => setActiveView('documents')}
              className="relative"
            >
              Documents
            </Button>
            <Button
              variant={activeView === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveView('settings')}
              className="relative"
            >
              Settings
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeView === 'settings' ? <SchemaSettings /> : <DocumentsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
