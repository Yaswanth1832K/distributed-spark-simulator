import os
import sys

# Critical configuration for PySpark on Windows Anaconda
os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
os.environ['HADOOP_HOME'] = "C:\\hadoop"
os.environ['PYSPARK_PIN_THREAD'] = "true"

from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("Test") \
    .master("local[1]") \
    .config("spark.driver.bindAddress", "127.0.0.1") \
    .config("spark.driver.host", "127.0.0.1") \
    .getOrCreate()

def f(x):
    return x * x

try:
    rdd = spark.sparkContext.parallelize([1, 2, 3, 4], 1)
    print("Result:", rdd.map(f).collect())
except Exception as e:
    print("FAILED:", e)
