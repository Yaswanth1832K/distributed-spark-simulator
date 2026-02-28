import time
import uuid
import threading
import random
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# --- Windows Environment Fixes ---
# Force current python from venv/absolute path
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
os.environ['PYSPARK_PIN_THREAD'] = 'false'

print(f"DEBUG: sys.executable = {sys.executable}")
print(f"DEBUG: PYSPARK_PYTHON = {os.environ.get('PYSPARK_PYTHON')}")

# --- Spark Integration ---
# findspark is optional if pyspark is in site-packages
try:
    import findspark
    spark_home = os.environ.get("SPARK_HOME")
    
    # Only try WSL paths if NOT on Windows or if specifically requested
    if not spark_home and os.name != 'nt':
        possible_spark_homes = ["/usr/local/spark", "/opt/spark"]
        for path in possible_spark_homes:
            if os.path.exists(path):
                spark_home = path
                break
    
    if spark_home:
        print(f"Init: findspark.init('{spark_home}')")
        findspark.init(spark_home)
    else:
        print("Init: findspark.init() - searching in PATH or using pip-installed pyspark")
        findspark.init()
except Exception as e:
    print(f"Note: findspark initialization skipped or failed: {e}")
except ImportError:
    print("Warning: findspark not installed. PySpark may fail on Windows/WSL.")

from pyspark.sql import SparkSession

app = Flask(__name__)
CORS(app)

# --- Real Spark Integration (WSL Ubuntu) Setup ---
# (findspark initialized above)

# --- Spark Initialization (Fail-Safe Mode) ---
# We default to local mode so the backend ALWAYS starts, even if your cluster is off.
# --- Spark Initialization (REAL DISTRIBUTED CLUSTER MODE) ---
try:
    MASTER_IP = "10.175.64.64"   # Your Windows laptop IP
    DRIVER_PORT = "5050"

    print(f"Initializing Spark CLUSTER MODE → spark://{MASTER_IP}:7077")

    spark = (
        SparkSession.builder
        .appName("ClusterFlow")
        .master(f"spark://{MASTER_IP}:7077")

        # ★★★ CRITICAL NETWORK FIX ★★★
        # workers connect to this address
        .config("spark.driver.host", MASTER_IP)

        # driver binds to all interfaces inside WSL
        .config("spark.driver.bindAddress", "0.0.0.0")

        # fixed port so firewall can allow
        .config("spark.driver.port", DRIVER_PORT)

        # prevents executor timeout while connecting
        .config("spark.network.timeout", "300s")
        .config("spark.executor.heartbeatInterval", "60s")

        # stability configs
        .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
        .config("spark.python.worker.reuse", "true")

        .config("spark.executor.memory", "1g")
        .config("spark.executor.cores", "1")

        .getOrCreate()
    )

    sc = spark.sparkContext

    print("✅ Spark Driver successfully connected to distributed cluster!")
    print(f"Driver reachable at: {MASTER_IP}:{DRIVER_PORT}")

except Exception as e:
    print("❌ Spark cluster connection failed")
    print(e)
    sc = None

# Note: To use your REAL cluster, you'd change .master("local[*]") 
# back to .master("spark://127.0.0.1:7077") once you verify it's running.

# Constants
NODE_STATES = ["ALIVE", "SLOW", "DEAD"]
TASK_STATES = ["QUEUED", "RUNNING", "COMPLETED", "FAILED"]

class Task:
    def __init__(self, task_id, partition_idx, data, job_type):
        self.task_id = task_id
        self.partition_idx = partition_idx
        self.data = data
        self.job_type = job_type
        
        self.status = "QUEUED"
        self.assigned_node = None
        self.progress = 0
        self.start_time = None
        self.end_time = None
        self.result = None
        self.history = []  # Track nodes this task was assigned to
        self.data_snippet = str(data[:3]) + "..." if isinstance(data, list) and len(data) > 3 else str(data)

class Job:
    def __init__(self, job_id, job_type, num_partitions, data):
        self.job_id = job_id
        self.job_type = job_type
        self.status = "RUNNING"
        self.start_time = time.time()
        self.end_time = None
        self.tasks = []
        
        # Partition data
        chunk_size = math.ceil(len(data) / num_partitions) if num_partitions > 0 else 1
        partitions = [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
        
        for idx, p_data in enumerate(partitions):
            t = Task(f"{job_id}-task-{idx}", idx, p_data, job_type)
            self.tasks.append(t)
            
        self.real_result = None # Store real spark result

class WorkerNode:
    def __init__(self, node_id):
        self.node_id = node_id
        self.state = "ALIVE"
        self.current_task = None
        self.cpu_usage = random.randint(5, 15)
        self.memory_usage = random.randint(20, 40)
        self._thread = None
        self._stop_event = threading.Event()

    def process_task(self, task, on_complete, on_fail):
        self.current_task = task
        task.status = "RUNNING"
        task.assigned_node = self.node_id
        if self.node_id not in task.history:
            task.history.append(self.node_id)
        task.start_time = time.time()
        
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_task, args=(task, on_complete, on_fail))
        self._thread.daemon = True
        self._thread.start()

    def _run_task(self, task, on_complete, on_fail):
        try:
            total_steps = len(task.data) if task.data else 10
            steps_completed = 0
            
            while steps_completed < total_steps:
                if self._stop_event.is_set() or self.state == "DEAD":
                    task.status = "FAILED"
                    self.current_task = None
                    self.cpu_usage = 0
                    on_fail(task)
                    return

                # Simulate work
                sleep_time = 0.05
                if self.state == "SLOW":
                    sleep_time = 0.5  # 10x slower
                    self.cpu_usage = min(100, self.cpu_usage + random.randint(10, 20))
                else:
                    self.cpu_usage = random.randint(60, 95)

                time.sleep(sleep_time)
                
                steps_completed += 1
                task.progress = min(100, int((steps_completed / total_steps) * 100))

            # Finish task
            task.progress = 100
            task.status = "COMPLETED"
            task.end_time = time.time()
            if task.job_type == "word_count":
                task.result = len(task.data)
            elif task.job_type == "sort":
                task.result = sorted(task.data)
            elif task.job_type == "stats":
                task.result = {"count": len(task.data), "max": max(task.data) if task.data else 0}
            else:
                task.result = "DONE"
                
            self.current_task = None
            self.cpu_usage = random.randint(5, 15)
            on_complete(task)
            
        except Exception as e:
            task.status = "FAILED"
            self.current_task = None
            self.cpu_usage = random.randint(5, 15)
            on_fail(task)

    def kill(self):
        self.state = "DEAD"
        self.cpu_usage = 0
        self.memory_usage = 0
        self._stop_event.set()

    def make_slow(self):
        if self.state != "DEAD":
            self.state = "SLOW"

    def recover(self):
        self.state = "ALIVE"
        self.cpu_usage = random.randint(5, 15)
        self.memory_usage = random.randint(20, 40)


class DistributedEngine:
    def __init__(self, num_nodes=0):
        # Start with 0 workers, we will sync with real Spark cluster
        self.nodes = {} 
        self.worker_id_map = {} # Maps real Spark ID to worker-1, worker-2...
        self.worker_counter = 0
        self.jobs = {}
        self.task_queue = []
        self.audit_logs = []
        self._log_event("SYSTEM_BOOT", "Distributed Master Engine Initialized", "SYSTEM")
        
        # Master scheduling loop
        self.running = True
        self.scheduler_thread = threading.Thread(target=self._scheduler_loop)
        self.scheduler_thread.daemon = True
        self.scheduler_thread.start()
        
        # Cluster Synchronization thread
        self.sync_thread = threading.Thread(target=self._sync_with_spark_master)
        self.sync_thread.daemon = True
        self.sync_thread.start()

    def _get_worker_alias(self, real_id):
        if real_id not in self.worker_id_map:
            self.worker_counter += 1
            self.worker_id_map[real_id] = f"worker-{self.worker_counter}"
        return self.worker_id_map[real_id]

    def _sync_with_spark_master(self):
        import urllib.request, json
        print("DEBUG: Cluster Sync Thread Started (Polling 10.175.64.64:8080/json)")
        while self.running:
            try:
                # Poll Spark Master JSON API
                with urllib.request.urlopen("http://10.175.64.64:8080/json", timeout=2) as url:
                    data = json.loads(url.read().decode())
                    # Get ALIVE workers
                    real_workers = [w for w in data.get("workers", []) if w.get("state") == "ALIVE"]
                    
                    # Create consistent IDs for the UI
                    # Using full Spark Worker ID (e.g., worker-YYYYMMDDHHMMSS-IP-PORT)
                    real_ids = {}
                    for w in real_workers:
                        w_id = w.get("id")
                        real_ids[w_id] = w
                    
                    # Add new workers to simulation
                    for worker_id, w_info in real_ids.items():
                        # Get a clean alias: worker-1, worker-2...
                        alias = self._get_worker_alias(worker_id)
                        
                        if alias not in self.nodes:
                            # Use the alias as the key for consistency in UI
                            addr = w_info.get("address", "worker").split("://")[-1]
                            self.nodes[alias] = WorkerNode(alias) # Use alias as ID
                            self._log_event("NODE_JOINED", f"Real Worker {alias} (@{addr}) joined cluster.", "SPARK_MASTER")
                            print(f"DEBUG: Synchronized new worker: {alias} (Spark ID: {worker_id})")
                            
                    # Remove or kill lost workers
                    # We check if any of our active aliases no longer correspond to a live Spark Worker ID
                    active_aliases = [self._get_worker_alias(wid) for wid in real_ids.keys()]
                    for alias in list(self.nodes.keys()):
                        if alias not in active_aliases:
                            if self.nodes[alias].state != "DEAD":
                                self.nodes[alias].kill()
                                self._log_event("NODE_LOST", f"Real Worker {alias} left cluster.", "SPARK_MASTER")
                                print(f"DEBUG: Worker lost: {alias}")
            except Exception as e:
                # Master offline or network issue
                if len(self.nodes) > 0 and not any(n.state == "DEAD" for n in self.nodes.values()):
                    print(f"DEBUG: Sync Error (Master Offline?): {e}")
            
            time.sleep(3)

    def _log_event(self, event_type, message, source="MASTER"):
        event = {
            "timestamp": time.time(),
            "type": event_type,
            "message": message,
            "source": source
        }
        self.audit_logs.append(event)
        # Keep only last 100 logs
        if len(self.audit_logs) > 100:
            self.audit_logs.pop(0)

    def submit_job(self, job_type, num_partitions, data):
        job_id = f"job-{str(uuid.uuid4())[:8]}"
        job = Job(job_id, job_type, num_partitions, data)
        self.jobs[job_id] = job
        
        for t in job.tasks:
            self.task_queue.append(t)
        
        self._log_event("JOB_SUBMITTED", f"Job {job_id} ({job_type}) received with {num_partitions} partitions", "USER")
        return job_id

    def simulate_failure(self, node_id, action):
        if node_id in self.nodes:
            node = self.nodes[node_id]
            if action == "kill":
                node.kill()
                self._log_event("NODE_FAILURE", f"Node {node_id} was killed.", "USER_ACTION")
            elif action == "slow":
                node.make_slow()
                self._log_event("NODE_DEGRADATION", f"Node {node_id} was made slow.", "USER_ACTION")
            elif action == "recover":
                node.recover()
                self._log_event("NODE_RECOVERY", f"Node {node_id} was recovered.", "USER_ACTION")
            return True
        self._log_event("INVALID_ACTION", f"Attempted action '{action}' on non-existent node {node_id}.", "USER_ACTION")
        return False

    def _on_task_complete(self, task):
        # Check if job is fully completed
        job_id = task.task_id.split("-task-")[0]
        if job_id in self.jobs:
            job = self.jobs[job_id]
            if all(t.status == "COMPLETED" for t in job.tasks):
                job.status = "COMPLETED"
                job.end_time = time.time()
                self._log_event("JOB_COMPLETED", f"Job {job_id} completed successfully.", "MASTER")
            self._log_event("TASK_COMPLETED", f"Task {task.task_id} completed on {task.assigned_node}.", "SCHEDULER")

    def _on_task_fail(self, task):
        # Re-queue failed task
        print(f"Task {task.task_id} failed on {task.assigned_node}. Re-queueing...")
        self._log_event("TASK_FAILED", f"Task {task.task_id} failed on {task.assigned_node}. Re-queueing.", "SCHEDULER")
        
        # Mark current node as failed in history if not already there
        if task.assigned_node and f"FAILED:{task.assigned_node}" not in task.history:
            task.history.append(f"FAILED:{task.assigned_node}")
            
        task.status = "QUEUED"
        task.assigned_node = None
        task.progress = 0
        self.task_queue.append(task)

    def _scheduler_loop(self):
        while self.running:
            time.sleep(0.5) # Master tick
            
            # Find free, alive nodes
            free_nodes = [n for n in self.nodes.values() if n.state == "ALIVE" and n.current_task is None]
            
            # If no healthy free nodes but slow free nodes exist, use them as fallback
            if not free_nodes:
                free_nodes = [n for n in self.nodes.values() if n.state == "SLOW" and n.current_task is None]
            
            # Schedule tasks
            while free_nodes and self.task_queue:
                task = self.task_queue.pop(0)
                node = free_nodes.pop(0)
                node.process_task(task, self._on_task_complete, self._on_task_fail)
                self._log_event("TASK_ASSIGNED", f"Task {task.task_id} assigned to {node.node_id}.", "SCHEDULER")


engine = DistributedEngine(num_nodes=0)

# REST API

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "online", "spark": "sc_initialized" if sc else "sc_failed"})

@app.route("/audit_logs", methods=["GET"])
def get_audit_logs():
    return jsonify(engine.audit_logs)

def run_real_spark_job(dataset, partitions):
    if sc is None:
        print("Real Spark Context (sc) is not initialized. Skipping real computation.")
        return "Real Spark Offline"
    try:
        rdd = sc.parallelize(dataset, partitions)
        result = rdd.map(lambda x: x*x).collect()
        return result
    except Exception as e:
        print(f"Native Spark Execution Error: {e}")
        return f"Error: {e}"

@app.route("/submit_job", methods=["POST"])
def submit_job():
    data = request.json.get("data", [])
    try:
        num_partitions = int(request.json.get("num_partitions", 6))
    except (ValueError, TypeError):
        num_partitions = 6
        
    job_type = request.json.get("job_type", "word_count")
    
    if not data:
        return jsonify({"error": "Data cannot be empty"}), 400
        
    job_id = engine.submit_job(job_type, num_partitions, data)
    
    # Trigger real distributed computation on the actual Spark cluster in a BACKGROUND THREAD
    if sc:
        def background_job():
            try:
                print(f"DEBUG: Starting real Spark job for {job_id}")
                result = run_real_spark_job(data, num_partitions)
                if job_id in engine.jobs:
                    engine.jobs[job_id].real_result = result
                print(f"DEBUG: Real Spark job for {job_id} finished")
            except Exception as e:
                print(f"DEBUG: Real Spark job for {job_id} failed: {e}")
                if job_id in engine.jobs:
                    engine.jobs[job_id].real_result = f"Error: {e}"
                    
        threading.Thread(target=background_job, daemon=True).start()
    else:
        if job_id in engine.jobs:
            engine.jobs[job_id].real_result = "Real Spark Context (sc) Offline"
        
    return jsonify({"status": "submitted", "job_id": job_id})

@app.route("/active_job", methods=["GET"])
def active_job():
    # Find the most recent running or just submitted job
    running_jobs = [j_id for j_id, j in engine.jobs.items() if j.status == "RUNNING"]
    if running_jobs:
        return jsonify({"job_id": running_jobs[-1]})
    
    # If no running, return the last completed one if it's recent (optional, but let's keep it simple)
    if engine.jobs:
        last_id = list(engine.jobs.keys())[-1]
        return jsonify({"job_id": last_id})
        
    return jsonify({"job_id": None})

@app.route("/cluster_status", methods=["GET"])
def cluster_status():
    nodes_info = []
    
    for n_id, node in engine.nodes.items():
        # Jitter the metrics slightly for alive/slow nodes
        if node.state != "DEAD":
            if node.current_task is None:
                node.cpu_usage = max(1, min(100, node.cpu_usage + random.randint(-2, 2)))
                node.memory_usage = max(10, min(100, node.memory_usage + random.randint(-1, 1)))
            else:
                if node.state == "SLOW":
                    node.cpu_usage = min(100, node.cpu_usage + random.randint(5, 10))
                else:
                    node.cpu_usage = max(60, min(100, node.cpu_usage + random.randint(-5, 5)))
                    
        nodes_info.append({
            "node_id": n_id,
            "state": node.state,
            "cpu_usage": node.cpu_usage,
            "memory_usage": node.memory_usage,
            "current_task": node.current_task.task_id if node.current_task else None
        })
        
    running_jobs = sum(1 for j in engine.jobs.values() if j.status == "RUNNING")
    active_tasks = sum(1 for n in engine.nodes.values() if n.current_task is not None)
    
    return jsonify({
        "workers": len(engine.nodes),
        "active_tasks": active_tasks,
        "running_jobs": running_jobs,
        "nodes": nodes_info
    })

@app.route("/job_status/<job_id>", methods=["GET"])
def job_status(job_id):
    if job_id not in engine.jobs:
        return jsonify({"error": "Job not found"}), 404
        
    job = engine.jobs[job_id]
    
    tasks_info = []
    for t in job.tasks:
        tasks_info.append({
            "task_id": t.task_id,
            "partition": t.partition_idx,
            "status": t.status,
            "assigned_node": t.assigned_node,
            "progress": t.progress,
            "execution_time": round((t.end_time or time.time()) - t.start_time, 2) if t.start_time else 0,
            "history": t.history,
            "data_snippet": t.data_snippet
        })
        
    # Add node health information for the UI
    node_states = {n_id: n.state for n_id, n in engine.nodes.items()}
    
    return jsonify({
        "job_id": job.job_id,
        "job_type": job.job_type,
        "status": job.status,
        "execution_time": round((job.end_time or time.time()) - job.start_time, 2),
        "total_partitions": len(job.tasks),
        "tasks": tasks_info,
        "node_states": node_states,
        "real_spark_result": job.real_result
    })

@app.route("/simulate_failure", methods=["POST"])
def simulate_failure():
    node_id = request.json.get("node_id")
    action = request.json.get("action") # "kill", "slow", "recover"
    
    if not node_id or not action:
        return jsonify({"error": "Missing parameters"}), 400
        
    success = engine.simulate_failure(node_id, action)
    if success:
        return jsonify({"status": "success", "message": f"Node {node_id} marked as {action}"})
    return jsonify({"error": "Node not found"}), 404

# Backward compatibility for old React code if needed during dev
@app.route("/cluster", methods=["GET"])
def old_cluster():
    return cluster_status()

@app.route("/process", methods=["POST"])
def old_process():
    # Submit job and wait for it synchronously for old frontend
    import time
    data = request.json.get("numbers", [])
    job_id = engine.submit_job("stats", 6, data)
    
    while engine.jobs[job_id].status == "RUNNING":
        time.sleep(0.5)
        
    result = engine.jobs[job_id]
    return jsonify({
        "status": "success",
        "partitions": len(result.tasks),
        "result": [t.result for t in result.tasks],
        "time": round(result.end_time - result.start_time, 3) if result.end_time else 0
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
