import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Network, Zap, ShieldCheck, ArrowRight, Activity, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: "easeOut" }}
        className="p-8 rounded-3xl glass glass-hover relative group overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
            <Icon className="w-24 h-24 text-primary-400" />
        </div>

        <div className="w-14 h-14 bg-primary-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-600/20 transition-all duration-500">
            <Icon className="w-7 h-7 text-primary-400 group-hover:text-primary-300" />
        </div>

        <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {description}
        </p>

        <div className="h-1 w-0 bg-primary-500/50 absolute bottom-0 left-0 group-hover:w-full transition-all duration-700"></div>
    </motion.div>
)

const ArchitectureNode = ({ icon: Icon, label, sublabel, color, glowColor }) => (
    <div className="flex flex-col items-center gap-4 group">
        <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-28 h-28 rounded-[2.5rem] glass flex items-center justify-center flex-col border-2 border-white/5 relative z-10 group-hover:border-${color}-500/50 shadow-2xl transition-all duration-500`}
        >
            <div className={`absolute inset-0 bg-${color}-500/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <Icon className={`w-8 h-8 text-${color}-400 mb-2 group-hover:animate-pulse`} />
            <span className="text-xs font-black tracking-widest text-gray-500 uppercase">{label}</span>
        </motion.div>
        <div className="text-center">
            <p className="text-sm font-bold text-white mb-0.5 tracking-tight">{sublabel}</p>
            <span className={`text-[10px] text-${color}-400 font-black uppercase tracking-widest opacity-60`}>Component</span>
        </div>
    </div>
)

const Home = () => {
    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="h-0.5 w-12 bg-primary-500"></span>
                        <span className="text-primary-400 text-sm font-black uppercase tracking-[0.3em] text-glow">
                            Advanced Distributed Platform
                        </span>
                    </div>

                    <h1 className="text-7xl font-black tracking-tighter leading-[0.9] mb-8 lg:max-w-4xl">
                        Master the Power of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-blue-500 to-primary-600 animate-pulse-slow">
                            Data Partitioning
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 leading-relaxed max-w-2xl font-medium antialiased mb-10">
                        Experience real-time distributed computing execution. Observe how the ClusterFlow engine transforms massive datasets into parallelized chunks for maximum performance and dynamic fault recovery.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/processing">
                            <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black tracking-tight flex items-center gap-3 glow-primary transition-all hover:scale-105 active:scale-95">
                                Start Processing <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link to="/monitor">
                            <button className="px-8 py-4 glass text-white rounded-2xl font-black tracking-tight border border-white/10 hover:bg-white/5 transition-all active:scale-95">
                                View Cluster State
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Decorative floating terminal element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="hidden xl:block absolute top-0 right-0 w-[400px] glass rounded-3xl border border-white/10 p-6 shadow-2xl skew-x-1"
                >
                    <div className="flex gap-2 mb-4 pb-4 border-b border-white/5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        <div className="ml-auto flex items-center gap-2">
                            <Terminal className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] uppercase font-bold text-gray-600">spark-shell --local</span>
                        </div>
                    </div>
                    <div className="space-y-2 font-mono text-[11px] text-primary-400/80">
                        <p className="text-gray-500"># Initializing Spark Session...</p>
                        <p><span className="text-blue-400">val</span> rdd = sc.parallelize(data, 12)</p>
                        <p><span className="text-purple-400">val</span> results = rdd.map(x =&gt; x * x).collect()</p>
                        <p className="text-green-400">Spark Job Finished in 0.42s</p>
                        <p className="text-yellow-400 opacity-50">Partitions Distributed: [6, 6, 6, 6, 6, 6]</p>
                    </div>
                </motion.div>
            </section>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                    icon={Cpu}
                    title="Parallel Execution"
                    description="Multiple tasks run simultaneously across different partitions, significantly reducing computation time."
                    delay={0.1}
                />
                <FeatureCard
                    icon={Network}
                    title="Data Partitioning"
                    description="Large datasets are split into smaller 'chunks' called partitions to be processed by worker nodes."
                    delay={0.2}
                />
                <FeatureCard
                    icon={Zap}
                    title="Load Balancing"
                    description="Spark's scheduler assigns tasks to available workers based on their current load and data locality."
                    delay={0.3}
                />
                <FeatureCard
                    icon={ShieldCheck}
                    title="Fault Tolerance"
                    description="RDDs track lineage to reconstruct data in case of worker failure, ensuring zero data loss."
                    delay={0.4}
                />
            </div>

            {/* Architecture section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="p-12 rounded-[3.5rem] relative overflow-hidden glass border border-white/5"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                <h2 className="text-3xl font-black tracking-tighter mb-16 text-center">System Architecture</h2>

                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative max-w-5xl mx-auto">
                    {/* Connections background */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-white/10 -translate-y-12 hidden lg:block z-0"></div>

                    <ArchitectureNode
                        icon={Activity}
                        label="Frontend"
                        sublabel="React UI"
                        color="primary"
                    />

                    <ArchitectureNode
                        icon={Terminal}
                        label="Backend"
                        sublabel="Flask API"
                        color="green"
                    />

                    <ArchitectureNode
                        icon={Zap}
                        label="Engine"
                        sublabel="ClusterFlow Core"
                        color="blue"
                    />

                    <ArchitectureNode
                        icon={Cpu}
                        label="Cluster"
                        sublabel="Worker Nodes"
                        color="purple"
                    />
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center text-gray-500">
                    <p className="text-sm italic font-medium">Currently orchestrating on <span className="text-primary-400 font-bold not-italic">Standalone Local Cluster</span></p>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Healthy</span>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    )
}

export default Home
