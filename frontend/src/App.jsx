import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Activity, Database, Settings,
  ChevronRight, Zap, Shield, Globe, Terminal,
  Layers, Cpu, Workflow
} from 'lucide-react'
import Home from './pages/Home'
import Processing from './pages/Processing'
import Monitor from './pages/Monitor'
import axios from 'axios'

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className="group px-4">
    <div className={`
            flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 relative overflow-hidden
            ${active
        ? 'bg-primary-500/10 text-primary-400 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.3)] border border-primary-500/20'
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
      }
        `}>
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />}
      <Icon className={`w-5 h-5 transition-transform duration-500 group-hover:scale-110 ${active ? 'fill-primary-400/10' : ''}`} />
      <span className={`text-xs font-black uppercase tracking-[0.2em] transition-all duration-500`}>
        {label}
      </span>
      <ChevronRight className={`ml-auto w-4 h-4 transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
    </div>
  </Link>
)

const App = () => {
  const location = useLocation()
  const [apiStatus, setApiStatus] = useState('offline') // offline, checking, online

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get('http://localhost:5000/ping')
        if (res.data.status === 'online') {
          setApiStatus('online')
        } else {
          setApiStatus('offline')
        }
      } catch (err) {
        setApiStatus('offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-primary-500/30">
      {/* Sidebar */}
      <div className="w-80 h-screen sticky top-0 flex flex-col premium-sidebar z-50">
        <div className="p-10 mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(14,165,233,0.6)] group hover:scale-110 transition-transform duration-500">
              <Workflow className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none mb-1 text-white">ClusterFlow</h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'online' ? 'bg-emerald-500 active-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${apiStatus === 'online' ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                  {apiStatus === 'online' ? 'Engine Ready' : 'Engine Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-4">
          <SidebarLink to="/" icon={LayoutDashboard} label="Strategic Hub" active={location.pathname === '/'} />
          <SidebarLink to="/processing" icon={Layers} label="Orchestration" active={location.pathname === '/processing'} />
          <SidebarLink to="/monitor" icon={Activity} label="Surveillance" active={location.pathname === '/monitor'} />
        </nav>

        <div className="p-8 mt-auto">
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-primary-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Hybrid Mode</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-[0.05em]">
              Distributed Spark Sim V2.0 <br />
              <span className="text-primary-500/50">Master IP: 127.0.0.1</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-12 max-w-[1600px] mx-auto overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/monitor" element={<Monitor />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
