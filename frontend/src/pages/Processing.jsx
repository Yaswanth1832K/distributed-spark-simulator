import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
    Play, Loader2, Database, Box, CheckCircle2, Cpu,
    RefreshCw, Trash2, Layers, AlertCircle, Clock,
    Server, ArrowRight, Activity, Terminal, Zap,
    Share2, Workflow, Gauge
} from 'lucide-react'
import axios from 'axios'

const API_BASE = 'http://localhost:5000'

const Processing = () => {
    const [input, setInput] = useState('1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40')
    const [numPartitions, setNumPartitions] = useState(12)
    const [jobType, setJobType] = useState('stats')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Live execution state
    const [activeJobId, setActiveJobId] = useState(null)
    const [jobStatus, setJobStatus] = useState(null)

    const pollInterval = useRef(null)

    const generateRandomData = () => {
        const count = 2000
        const randomNumbers = Array.from({ length: count }, () => Math.floor(Math.random() * 1000))
        setInput(randomNumbers.join(', '))
        setError(null)
    }

    const startPolling = (jobId) => {
        if (pollInterval.current) clearInterval(pollInterval.current)

        pollInterval.current = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE}/job_status/${jobId}`)
                setJobStatus(res.data)

                if (res.data.status === "COMPLETED" || res.data.status === "FAILED") {
                    clearInterval(pollInterval.current)
                    setLoading(false)
                }
            } catch (err) {
                console.error("Polling error:", err)
                clearInterval(pollInterval.current)
                setError("Lost connection to Job Tracker")
                setLoading(false)
            }
        }, 400) // Slightly faster poll for smoother animations
    }

    useEffect(() => {
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current)
        }
    }, [])

    const submitJob = async () => {
        if (!input.trim()) {
            setError("Input dataset cannot be empty.")
            return
        }

        setLoading(true)
        setJobStatus(null)
        setActiveJobId(null)
        setError(null)

        try {
            const numbers = input.split(',').map(n => n.trim()).filter(n => n !== '').map(Number)

            const response = await axios.post(`${API_BASE}/submit_job`, {
                data: numbers,
                num_partitions: numPartitions,
                job_type: jobType
            })

            setActiveJobId(response.data.job_id)
            startPolling(response.data.job_id)

        } catch (err) {
            console.error(err)
            setError(err.response?.data?.error || "Failed to submit job to Distributed Master")
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'QUEUED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20'
            case 'RUNNING': return 'text-primary-400 bg-primary-500/10 border-primary-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]'
            case 'COMPLETED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20'
            case 'FAILED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            default: return 'text-slate-500 bg-white/5 border-white/10'
        }
    }

    const getProgressBarColor = (status) => {
        switch (status) {
            case 'RUNNING': return 'bg-primary-500'
            case 'COMPLETED': return 'bg-emerald-500'
            case 'FAILED': return 'bg-rose-500'
            default: return 'bg-slate-700'
        }
    }

    const overallProgress = jobStatus?.tasks
        ? (jobStatus.tasks.filter(t => t.status === 'COMPLETED').length / (jobStatus.total_partitions || 1)) * 100
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12 min-h-screen pb-20"
        >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-primary-500/10">
                            <Workflow className="w-4 h-4 text-primary-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-[0.4em] text-primary-500/70">Execution Pipeline</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-white">Job Orchestration</h1>
                    <p className="text-gray-400 font-medium max-w-2xl text-lg leading-relaxed">
                        Define compute strategies and witness real-time scheduling.
                        Watch partitions dynamically migrate across the cluster as the Master rebalances load.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.03] border border-white/10 p-2 rounded-[2rem] glass">
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${loading ? 'text-primary-400 bg-primary-500/10 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'text-gray-500'}`}>
                        {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
                        {loading ? 'Master Active' : 'Cluster Idle'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-10 rounded-[3rem] glass border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                        <div className="mb-10 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-4 h-4 text-primary-400" />
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Job Type</label>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {['stats', 'sort', 'word_count'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setJobType(type)}
                                        className={`py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${jobType === type
                                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-[0_5px_15px_-5px_rgba(14,165,233,0.3)]'
                                            : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-transparent'
                                            }`}
                                    >
                                        {type.replace('_', ' ')}
                                        {jobType === type && <motion.div layoutId="jobTypeActive" className="absolute inset-0 bg-primary-400/5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8 mb-10">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-emerald-400" />
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Parallelism</label>
                                    </div>
                                    <p className="text-xl font-black text-white tracking-tight">{numPartitions} Partitions</p>
                                </div>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/40 text-[9px] font-black uppercase tracking-widest">
                                    {numPartitions} Global Tasks
                                </div>
                            </div>
                            <div className="relative h-2 flex items-center">
                                <input
                                    type="range"
                                    min="4"
                                    max="32"
                                    step="4"
                                    value={numPartitions}
                                    onChange={(e) => setNumPartitions(parseInt(e.target.value))}
                                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="absolute top-full left-0 right-0 flex justify-between text-[10px] text-gray-600 font-black mt-3 uppercase tracking-widest">
                                    <span>Low (4)</span>
                                    <span>Extreme (32)</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 space-y-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-purple-400" />
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Source Payload</label>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={generateRandomData} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-primary-400 transition-all active:scale-90" title="Random Generation">
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setInput('')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-all active:scale-90" title="Wipe Data">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <textarea
                                className="w-full bg-black/40 border border-white/5 rounded-[1.5rem] p-6 text-sm font-mono h-40 focus:border-primary-500/50 outline-none transition-all resize-none custom-scrollbar placeholder:text-gray-800 text-gray-300 leading-relaxed shadow-inner"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Awaiting dataset entry..."
                            />
                        </div>

                        <button
                            onClick={submitJob}
                            disabled={loading}
                            className={`
                                w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 transition-all active:scale-[0.98] group relative overflow-hidden
                                ${loading
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                    : 'bg-primary-600 hover:bg-primary-500 text-white shadow-[0_10px_40px_-10px_rgba(14,165,233,0.5)] hover:scale-[1.02]'
                                }
                            `}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                            {loading ? 'Computing Graph...' : 'Execute Dispatch'}
                            {!loading && <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]"></div>}
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex gap-4">
                                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Master Exception</p>
                                    <p className="text-[11px] text-rose-200/60 font-medium leading-relaxed">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Execution Matrix */}
                <div className="lg:col-span-8 space-y-8">
                    {!jobStatus && !loading ? (
                        <div className="h-full min-h-[700px] flex flex-col items-center justify-center text-center p-20 border-2 border-dashed border-white/5 rounded-[4rem] group hover:border-primary-500/10 transition-all duration-1000 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative mb-10">
                                <Activity className="w-24 h-24 text-white/5 group-hover:text-primary-500/20 transition-all duration-1000 group-hover:scale-110" />
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -inset-10 border border-dashed border-primary-500/10 rounded-full"></motion.div>
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-16 border border-dashed border-white/5 rounded-full"></motion.div>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter text-white/20 mb-4 uppercase tracking-[0.2em]">Matrix Offline</h3>
                            <p className="text-gray-600 font-bold max-w-sm text-sm leading-relaxed uppercase tracking-widest opacity-80">
                                Initializing a job will spawn the compute grid here.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Execution Header Card */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3rem] glass border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/[0.03] blur-[120px] pointer-events-none group-hover:bg-primary-500/[0.05] transition-colors"></div>
                                <div className="flex items-center gap-6 z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center relative shadow-inner ring-1 ring-white/10">
                                        {jobStatus?.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                                        ) : jobStatus?.status === 'FAILED' ? (
                                            <AlertCircle className="w-10 h-10 text-rose-400" />
                                        ) : (
                                            <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
                                        )}
                                        {jobStatus?.status === 'RUNNING' && <div className="absolute inset-0 rounded-3xl border-2 border-primary-500/30 animate-pulse"></div>}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500/70">Surveillance ID: {jobStatus?.job_id || '---'}</span>
                                            <span className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border ${getStatusColor(jobStatus?.status || 'QUEUED')}`}>
                                                {jobStatus?.status || 'INIT'}
                                            </span>
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tighter text-white uppercase">{jobStatus?.job_type || 'COMPUTE'} PIPELINE</h2>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 z-10 px-8 py-4 bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-inner">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Time Elapsed</p>
                                        <p className="text-3xl font-black text-white font-mono tracking-tighter">{jobStatus?.execution_time?.toFixed(2) || '0.00'}s</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Compute Load</p>
                                        <p className="text-3xl font-black text-primary-400 font-mono tracking-tighter">{jobStatus?.total_partitions || 0}</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Job Progress Strip */}
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="px-5 space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Pipeline saturation</span>
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Global Synchronization Index</h4>
                                    </div>
                                    <span className={`text-2xl font-black tabular-nums ${jobStatus?.status === 'COMPLETED' ? 'text-emerald-400' : 'text-primary-400'}`}>{overallProgress.toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/10 relative p-1 shadow-inner">
                                    <motion.div
                                        className={`h-full rounded-full ${jobStatus?.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-primary-500 shadow-[0_0_20px_rgba(14,165,233,0.4)]'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${overallProgress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                    <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
                                        {Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="w-[1px] h-full bg-white/5"></div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Matrix Grid */}
                            <div className="p-10 rounded-[3.5rem] glass border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none"></div>
                                <div className="flex items-center justify-between mb-10 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400">
                                            <LayoutGroupIcon size={18} />
                                        </div>
                                        <h3 className="text-2xl font-black tracking-tight text-white">Partition Compute Matrix</h3>
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Live Orchestration</span>
                                    </div>
                                </div>

                                <LayoutGroup>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                                        <AnimatePresence mode="popLayout">
                                            {jobStatus?.tasks.map((task) => (
                                                <motion.div
                                                    key={task.task_id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 30
                                                    }}
                                                    className={`p-6 rounded-[2rem] border-2 transition-all duration-500 relative overflow-hidden group/task ${getStatusColor(task.status)} ${task.status === 'RUNNING' ? 'ring-1 ring-primary-500/30' : ''}`}
                                                >
                                                    {/* Animated glow for running tasks */}
                                                    {task.status === 'RUNNING' && (
                                                        <motion.div
                                                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                            className="absolute inset-0 bg-primary-500/10 pointer-events-none"
                                                        />
                                                    )}

                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="space-y-0.5">
                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Logical Unit</span>
                                                            <h5 className="text-xl font-black font-mono tracking-tight text-white">#{(task.partition).toString().padStart(2, '0')}</h5>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover/task:border-white/10 transition-colors`}>
                                                                <Cpu className="w-4 h-4 opacity-50" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <div className="flex items-center gap-2">
                                                                <Server className="w-3.5 h-3.5 text-slate-500" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{task.assigned_node ? task.assigned_node : 'PENDING'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500">
                                                                <Clock className="w-3 h-3" />
                                                                {task.execution_time.toFixed(1)}s
                                                            </div>
                                                        </div>

                                                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                                                            <motion.div
                                                                className={`h-full rounded-full ${getProgressBarColor(task.status)} group-hover/task:brightness-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                                                                animate={{ width: `${task.progress}%` }}
                                                                transition={{ type: "spring", stiffness: 100 }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] opacity-30 pt-4 border-t border-white/5">
                                                        <span>Status</span>
                                                        <span>{task.status}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </LayoutGroup>
                            </div>

                            {/* Verification Block */}
                            <AnimatePresence>
                                {jobStatus?.real_spark_result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-10 rounded-[3.5rem] bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20"></div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                    <Terminal className="text-emerald-400 w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black tracking-tight text-white uppercase">Verification Layer</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">Truth Source: Apache Spark (Ubuntu Context)</p>
                                                </div>
                                            </div>
                                            <Gauge className="w-8 h-8 text-emerald-500/20" />
                                        </div>
                                        <div className="bg-black/60 rounded-[2rem] p-8 border border-white/5 shadow-2xl relative group">
                                            <div className="absolute top-4 right-6 text-[10px] font-mono text-emerald-500/30 group-hover:text-emerald-500/50 transition-colors">spark_output.log</div>
                                            <pre className="text-[13px] font-mono text-emerald-200/80 leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                                {typeof jobStatus.real_spark_result === 'string'
                                                    ? jobStatus.real_spark_result
                                                    : JSON.stringify(jobStatus.real_spark_result, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

const LayoutGroupIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H9V9H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 3H21V9H15V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 15H21V21H15V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 15H9V21H3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export default Processing
