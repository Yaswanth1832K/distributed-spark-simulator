# ClusterFlow: Hybrid Distributed Platform

This project implements a hybrid architecture where the **Distributed Computing Engine** runs on Linux (WSL) for maximum stability, while the **Interactive Dashboard** runs on Windows for a premium user experience.

---

## 🏗️ Architecture Overview

- **WSL Ubuntu (Linux)**: Runs the Spark Master, Spark Worker, and the Python Flask Backend (PySpark).
- **Windows host**: Runs the React Frontend (Vite), Browser UI, and VS Code.
- **Port 5000**: Flask API (Accessible from Windows via localhost).
- **Port 8080**: Spark Master UI (Accessible from Windows browser).
- **Port 5173**: React Frontend (Windows native).

---

## 🚀 Setup Instructions

Follow these exact steps to boot the entire platform.

### 1. Start the Spark Cluster (Inside WSL)
Open your **WSL Ubuntu Terminal** and run:

```bash
# Navigate to your Spark sbin directory
cd ~/spark/sbin

# Start the Master node
./start-master.sh

# Start the Worker node (connects to your local master)
./start-worker.sh spark://Yaswanth.localdomain:7077
```

### 2. Start the Backend API (Inside WSL)
In the same or a new **WSL Ubuntu Terminal**:

```bash
# Navigate to the project backend
cd /mnt/c/Users/yaswa/.gemini/antigravity/scratch/distributed-spark-simulator/backend

# Install dependencies in WSL
pip3 install flask flask-cors pyspark findspark

# Start the Flask server
python3 app.py
```

### 3. Start the Frontend Dashboard (Windows)
Open a **Windows PowerShell** terminal:

```powershell
# Navigate to the project frontend
cd c:\Users\yaswa\.gemini\antigravity\scratch\distributed-spark-simulator\frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

---

## 🎮 How to use the Platform

1. Open **[http://localhost:5173](http://localhost:5173)** in your Windows browser.
2. Go to **Data Processing** and submit a job.
3. Open **[http://localhost:8080](http://localhost:8080)** to see the real Spark job appear in the history.
4. Go to **Cluster Monitor** to inject chaos and observe fault tolerance simulation.

---

## 🛠️ Troubleshooting (WSL)

### 1. `TypeError: 'JavaPackage' object is not callable`
This happens if Python cannot find your Spark installation's Java JARs.
- Ensure you have `findspark` installed: `pip3 install findspark`.
- Ensure `SPARK_HOME` is set. You can add this to your `~/.bashrc`:
  ```bash
  export SPARK_HOME=~/spark
  export PATH=$PATH:$SPARK_HOME/bin
  ```
- **Restart your WSL terminal** after setting these.

### 2. Connection Refused
Ensure the Flask backend is running in WSL and binding to port 5000.
If `Yaswanth.localdomain` doesn't resolve in WSL, check the Spark Master UI (localhost:8080) for the correct Master URL and update it in `app.py`.

