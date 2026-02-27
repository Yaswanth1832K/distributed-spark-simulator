import os
import sys

# Try forcing PYSPARK_PYTHON to exactly python.exe instead of the sys.executable full path
# Sometimes the Anaconda full path breaks the Windows socket piping in PySpark
os.environ['PYSPARK_PYTHON'] = 'python'
os.environ['PYSPARK_DRIVER_PYTHON'] = 'python'
# Force Spark to use standard threads instead of pinned daemon threads
os.environ['PYSPARK_PIN_THREAD'] = 'false'

from pyspark.sql import SparkSession

spark = SparkSession.builder \
    .appName("Test") \
    .master("local[*]") \
    .config("spark.driver.bindAddress", "127.0.0.1") \
    .getOrCreate()

def f(x):
    return x * x

rdd = spark.sparkContext.parallelize([1, 2, 3, 4], 2)
print("Result:", rdd.map(f).collect())
