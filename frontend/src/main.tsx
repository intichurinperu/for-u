import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global.css'
import './styles/components.css'
import './styles/tailwind.css'
import './styles/dopamineRoute.css'
import './styles/materialExperience.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)

import './experience/experience.css';
import './experience/pastelWorkspace.css';
