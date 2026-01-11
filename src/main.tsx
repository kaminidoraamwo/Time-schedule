/// <reference types="vite-plugin-pwa/client" />
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'

// Register Service Worker
registerSW({
  onNeedRefresh() {
    console.log('New content available, verify to update.')
  },
  onOfflineReady() {
    console.log('App is ready for offline usage.')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
