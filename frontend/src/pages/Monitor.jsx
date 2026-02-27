import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Cpu, Server, Shield, Globe,
    RefreshCw, Zap, TrendingUp, Skull, Snail, CheckCircle2,
    AlertTriangle, ServerCrash, Flame, Terminal, History,
    Info, ChevronRight, Gauge
} from 'lucide-react'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ icon: Icon, label, value, subtext, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="p-8 rounded-[2.5rem] glass border-white/5 relative group overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
        <div className="flex items-start justify-between mb-8">
            <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 ring-1 ring-white/10 group-hover:ring-${color}-400/30`}>
                <Icon className={`w-7 h-7 text-${color}-400`} />
            </div>
            <div className={`px-3 py-1 bg-${color}-500/10 border border-${color}-400/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-${color}-400 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                Live
            </div>
        </div>
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none mb-1 block">{label}</label>
            <p className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">{value}</p>
            <p className="text-sm font-bold text-gray-500/80">{subtext}</p>
        </div>
    </motion.div>
)

const Monitor = () => {
    const [status, setStatus] = useState(null)
    const [history, setHistory] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const logEndRef = useRef(null)

    const fetchStatus = async () => {
        try {
            const [statusRes, logsRes] = await Promise.all([
                axios.get('http://localhost:5000/cluster_status'),
                axios.get('http://localhost:5000/audit_logs')
            ])

            setStatus(statusRes.data)
            setLogs(logsRes.data.reverse()) // Latest first for UI, but we'll manage display

            // Calculate aggregate CPU for the chart
            // Note: in the new engine keys are worker-1, worker-2...
            const nodesArr = Object.values(statusRes.data.nodes || {})
            const activeNodes = nodesArr.filter(n => n.state !== 'DEAD')
            const avgCpu = activeNodes.length
                ? activeNodes.reduce((acc, curr) => acc + curr.cpu_usage, 0) / activeNodes.length
                : 0

            setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), val: avgCpu }])
            setLoading(false)
        } catch (err) {
            console.error("Cluster health check failed:", err)
        }
    }

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 800)
        return () => clearInterval(interval)
    }, [])

    const handleChaos = async (nodeId, action) => {
        try {
            await axios.post('http://localhost:5000/simulate_failure', {
                node_id: nodeId,
                action: action
            })
            fetchStatus()
        } catch (err) {
            console.error(err)
        }
    }

    const getStateColor = (state) => {
        switch (state) {
            case 'ALIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
            case 'SLOW': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
            case 'DEAD': return 'text-rose-400 bg-rose-400/10 border-rose-400/20'
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
        }
    }

    const getLogIcon = (type) => {
        switch (type) {
            case 'NODE_FAILURE': return <Skull className="w-3 h-3 text-rose-400" />
            case 'TASK_RECOVERY': return <RefreshCw className="w-3 h-3 text-blue-400" />
            case 'JOB_COMPLETED': return <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            case 'TASK_ASSIGNED': return <ChevronRight className="w-3 h-3 text-slate-500" />
            default: return <Info className="w-3 h-3 text-primary-400" />
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
        >
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary-500/10 active-pulse">
                            <Activity className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary-500/70">Terminal Surveillance</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white">Executor Oversight</h1>
                    <p className="text-gray-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Precision monitoring for your distributed fleet. Simulate catastrophic failures,
                        monitor straggler detection, and watch real-time task migration.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 rounded-[2rem] glass box-shadow">
                    <div className="flex items-center gap-3 px-6 py-3">
                        <RefreshCw className="w-4 h-4 text-primary-400 animate-spin-slow" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Cloud Sync</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Latency: 4ms</span>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 glass rounded-[2.5rem] animate-pulse border border-white/5"></div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Server}
                            label="Worker Nodes"
                            value={status.workers}
                            subtext={`${Object.values(status.nodes).filter(n => n.state === 'ALIVE').length} Global Ready`}
                            color="primary"
                            delay={0.1}
                        />
                        <StatCard
                            icon={Zap}
                            label="Active Stream"
                            value={status.running_jobs}
                            subtext="Master IO Pipelines"
                            color="blue"
                            delay={0.2}
                        />
                        <StatCard
                            icon={Cpu}
                            label="Total Tasks"
                            value={status.active_tasks}
                            subtext="Distributed Threads"
                            color="emerald"
                            delay={0.3}
                        />
                        <StatCard
                            icon={Shield}
                            label="Cluster Health"
                            value={Object.values(status.nodes).some(n => n.state === 'DEAD') ? "DEGRADED" : "OPTIMAL"}
                            subtext="Fault-Tolerance Active"
                            color={Object.values(status.nodes).some(n => n.state === 'DEAD') ? "rose" : "emerald"}
                            delay={0.4}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Audit Log (New Section) */}
                        <div className="lg:col-span-4 p-8 rounded-[3rem] glass border-white/5 space-y-8 relative overflow-hidden flex flex-col h-[700px]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl pointer-events-none"></div>
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-slate-500/10">
                                        <Terminal className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight text-white">System Audit Log</h3>
                                </div>
                                <History className="w-4 h-4 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer" />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                <AnimatePresence initial={false}>
                                    {logs.map((log, i) => (
                                        <motion.div
                                            key={log.timestamp + i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1">{getLogIcon(log.type)}</div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.source}</span>
                                                        <span className="text-[9px] font-bold text-gray-700 font-mono">{new Date(log.timestamp * 1000).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-300 leading-relaxed tracking-tight underline-offset-4 decoration-primary-500/30 group-hover:underline">{log.message}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {logs.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                                        <Info className="w-12 h-12 text-gray-500" />
                                        <p className="text-sm font-black uppercase tracking-widest">Listening for Master Events...</p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
                                    <Info className="w-4 h-4 text-primary-400 shadow-sm" />
                                    <p className="text-[9px] font-black text-primary-400/80 uppercase tracking-[0.1em] leading-tight">
                                        This log records every decision made by the Distributed Master Engine.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chaos Panel */}
                        <div className="lg:col-span-8 space-y-10 relative group pt-8">
                            <div className="absolute top-10 right-10 w-96 h-96 bg-orange-500/5 blur-[120px] pointer-events-none group-hover:bg-orange-500/10 transition-colors duration-1000"></div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Flame className="w-6 h-6 text-orange-500" />
                                        <h3 className="text-3xl font-black tracking-tighter text-white">Chaos Infrastructure</h3>
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-9">Inject Systematic Failures Live</p>
                                </div>
                                <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                                    <Gauge className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Simulation Active</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Object.values(status.nodes).map((node, idx) => (
                                    <motion.div
                                        key={node.node_id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: idx * 0.05,
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20
                                        }}
                                        className={`p-6 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group/node
                                            ${node.state === 'ALIVE' ? 'bg-white/[0.02] border-white/5 hover:border-primary-500/20 hover:bg-primary-500/[0.02]' : ''}
                                            ${node.state === 'SLOW' ? 'bg-amber-500/5 border-amber-500/20' : ''}
                                            ${node.state === 'DEAD' ? 'bg-rose-500/5 border-rose-500/20 grayscale' : ''}
                                        `}
                                    >
                                        {/* Background Pulse for active node */}
                                        {node.state === 'ALIVE' && node.current_task && (
                                            <div className="absolute inset-0 bg-primary-500/5 animate-pulse"></div>
                                        )}

                                        <div className="flex justify-between items-start mb-8 relative z-10">
                                            <div>
                                                <h4 className="font-black text-xl tracking-tight text-white group-hover/node:text-primary-400 transition-colors uppercase">{node.node_id}</h4>
                                                <div className={`mt-1 text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border inline-block shadow-sm ${getStateColor(node.state)}`}>
                                                    {node.state}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover/node:opacity-100 transition-opacity">
                                                {node.state === 'ALIVE' && (
                                                    <>
                                                        <button onClick={() => handleChaos(node.node_id, 'slow')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 transition-all hover:scale-110 active:scale-90" title="Degrade Node Performance">
                                                            <Snail className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleChaos(node.node_id, 'kill')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 transition-all hover:scale-110 active:scale-90 shadow-[0_0_20px_rgba(244,63,94,0.1)]" title="Terminate Node Process">
                                                            <Skull className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {node.state !== 'ALIVE' && (
                                                    <button onClick={() => handleChaos(node.node_id, 'recover')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 transition-all hover:scale-110 active:scale-90" title="Restore Node">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            {/* CPU Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <span>CPU Usage</span>
                                                    <span>{Math.round(node.cpu_usage)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-[2px]">
                                                    <motion.div
                                                        animate={{ width: `${node.cpu_usage}%` }}
                                                        className={`h-full rounded-full ${node.state === 'SLOW' ? 'bg-amber-500' : 'bg-primary-500'} shadow-[0_0_10px_rgba(14,165,233,0.3)]`}
                                                    />
                                                </div>
                                            </div>
                                            {/* RAM Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <span>Memory Load</span>
                                                    <span>{Math.round(node.memory_usage)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-[2px]">
                                                    <motion.div
                                                        animate={{ width: `${node.memory_usage}%` }}
                                                        className="h-full rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2">
                                                <Zap className={`w-3 h-3 ${node.current_task ? 'text-primary-400' : 'text-slate-600'}`} />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Task</span>
                                            </div>
                                            <span className={`text-xs font-mono font-black ${node.current_task ? 'text-primary-400' : 'text-slate-700'}`}>
                                                {node.current_task ? '#' + node.current_task.split('-task-')[1] : 'NONE'}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    )
}

export default Monitor
