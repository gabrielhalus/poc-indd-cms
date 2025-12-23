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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-base font-bold text-transparent sm:text-lg">
            CSV CMS for InDesign Data Merge
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant={activeView === 'documents' ? 'default' : 'outline'}
              onClick={() => setActiveView('documents')}
              className="relative text-xs sm:text-sm"
              size="sm"
            >
              Documents
            </Button>
            <Button
              variant={activeView === 'settings' ? 'default' : 'outline'}
              onClick={() => setActiveView('settings')}
              className="relative text-xs sm:text-sm"
              size="sm"
            >
              Settings
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-7xl flex-col px-4 py-4 sm:min-h-[calc(100vh-5rem)] sm:px-6 sm:py-8">
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
