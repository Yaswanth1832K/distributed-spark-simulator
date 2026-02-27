<div align="center">

# ⚡ ClusterFlow
### Distributed Spark Simulator — V2.0

**A real-time, full-stack distributed systems simulator built with Apache Spark, Python Flask, and React.**
Visualize data partitioning, inject node failures, and observe self-healing fault tolerance — live.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://flask.palletsprojects.com/)
[![Apache Spark](https://img.shields.io/badge/Apache_Spark-3.5-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🌐 Overview

ClusterFlow is a **hybrid distributed computing platform** that brings the internals of Apache Spark to life through a premium, interactive dashboard. It demonstrates the core concepts of distributed systems — including data partitioning, parallel execution, load balancing, and fault tolerance — in a visual and intuitive way.

Think of it as a **"Flight Simulator" for Big Data Engineering**: you set up a cluster, submit jobs, inject failures, and watch the system self-heal in real time.

---

## 🏗️ Architecture

```
┌─────────────────────┐           ┌─────────────────────┐
│   Windows Host      │           │   WSL Ubuntu (Linux) │
│                     │           │                      │
│  ┌───────────────┐  │◄─────────►│  ┌────────────────┐ │
│  │ React UI      │  │  HTTP/    │  │ Flask API      │ │
│  │ (Port 5173)   │  │  REST     │  │ (Port 5000)    │ │
│  └───────────────┘  │           │  └────────┬───────┘ │
│                     │           │           │PySpark  │
└─────────────────────┘           │  ┌────────▼───────┐ │
                                  │  │ Spark Master   │ │
                                  │  │ + Workers      │ │
                                  │  └────────────────┘ │
                                  └─────────────────────┘
```

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite + Tailwind CSS | Interactive dashboard & visualizations |
| **Backend** | Python Flask + Flask-CORS | REST API & Distributed Engine |
| **Compute** | Apache Spark 3.5 + PySpark | Real distributed job execution |
| **Animations** | Framer Motion | Smooth task migration & chaos UI |

---

## ✨ Features

- **🎛️ Job Orchestration Matrix** — Submit jobs and watch each data partition processed in real time across the cluster, animated live.
- **🔥 Chaos Engineering Panel** — Kill, slow down, or recover worker nodes on demand to observe fault injection.
- **📋 System Audit Log** — A real-time "black box" log that records every decision the Master engine makes.
- **🛡️ Fault Tolerance Demo** — Tasks on a failed node are automatically detected, logged, and re-queued to a healthy worker.
- **📊 Live Cluster Metrics** — Per-node CPU usage, memory load, and active task tracking refreshing at sub-second intervals.
- **⚡ Real Spark Results** — Jobs are executed on a real Apache Spark context, with results verified and displayed in the UI.

---

## 🚀 Getting Started

### Prerequisites
- Windows with WSL2 (Ubuntu 22.04+)
- Node.js v18+ (Windows)
- Python 3.10+ with `pip` (WSL)
- Apache Spark 3.5 installed in WSL (`~/spark`)
- Java 11+ in WSL

---

### 1. Start the Spark Cluster (WSL)

Open your **WSL Ubuntu terminal**:

```bash
cd ~/spark/sbin

# Launch the master node
./start-master.sh

# Launch a worker node (replace hostname if needed)
./start-worker.sh spark://localhost:7077
```

Spark Master UI: **[http://localhost:8080](http://localhost:8080)**

---

### 2. Start the Backend (WSL)

```bash
cd /mnt/c/path/to/distributed-spark-simulator/backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install flask flask-cors pyspark findspark

# Run the API server
python app.py
```

API: **[http://localhost:5000](http://localhost:5000)**

---

### 3. Start the Frontend (Windows PowerShell)

```powershell
cd .\frontend

# Install packages
npm install

# Start the dev server
npm run dev
```

Dashboard: **[http://localhost:5173](http://localhost:5173)**

---

## 🎮 Usage Guide

| Page | What it does |
|---|---|
| **Strategic Hub** | Landing page with live engine status indicator |
| **Orchestration** | Submit jobs, configure partitions, watch the live compute matrix |
| **Surveillance** | Monitor node health, inject failures, read the audit log |

### 🧪 Fault Tolerance Experiment
1. Go to **Orchestration** → Set partitions to **20** → Click **Execute Dispatch**
2. Immediately switch to **Surveillance**
3. When progress hits ~30%, click the **Skull 💀 icon** on any worker
4. Watch the **Audit Log** fire a `FAULT_DETECTED` event and the affected tasks migrate to a healthy node automatically

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `JavaPackage not callable` | Install `findspark` and ensure `SPARK_HOME=~/spark` is set in `~/.bashrc` |
| `Connection refused (port 5000)` | Ensure the Flask backend is running in WSL and bound to `0.0.0.0` |
| `Engine Offline` status in UI | Backend is not running. Restart `python app.py` in WSL |
| Tasks finish too fast to observe | Click **Randomize** to generate a 2000-item dataset, then run the job |

---

## 📁 Project Structure

```
distributed-spark-simulator/
├── backend/
│   └── app.py              # Flask API, Distributed Engine, Chaos & Audit logic
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Strategic Hub (landing)
│   │   │   ├── Processing.jsx  # Job Orchestration Matrix
│   │   │   └── Monitor.jsx     # Surveillance & Chaos Panel
│   │   ├── App.jsx             # Root layout & sidebar navigation
│   │   └── index.css           # Global design system & tokens
│   └── package.json
└── README.md
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Built with ❤️ to demonstrate the power of Distributed Systems.
</div>
