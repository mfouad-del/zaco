
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/tailwind.css';
import App from './App';

console.log('[ARCHIVX] Starting application...');
console.log('[ARCHIVX] React version:', React.version);

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('[ARCHIVX] Root element not found!');
    throw new Error("Root element not found");
  }
  
  console.log('[ARCHIVX] Root element found, creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('[ARCHIVX] Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('[ARCHIVX] App rendered successfully!');
} catch (error) {
  console.error('[ARCHIVX] Fatal error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial; direction: rtl;">
      <h1 style="color: red;">خطأ في تحميل التطبيق</h1>
      <p>حدث خطأ أثناء تحميل التطبيق. يرجى التحقق من Console للحصول على التفاصيل.</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error}</pre>
    </div>
  `;
}

