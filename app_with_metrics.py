from flask import Flask, Response
from prometheus_client import Counter, Histogram, Summary, generate_latest, REGISTRY
import time
import random

app = Flask(__name__)

# --- Define Prometheus Metrics ---
# Counter: For things that only go up (e.g., number of requests)
REQUESTS_TOTAL = Counter(
    'myflaskapp_requests_total',
    'Total number of HTTP requests processed',
    ['method', 'endpoint', 'status_code']
)

# Histogram: For timing things, gives configurable buckets (e.g., request latency)
# Buckets can be customized based on expected latency ranges.
REQUEST_LATENCY_SECONDS = Histogram(
    'myflaskapp_request_latency_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, float("inf")] # Added inf
)

# Summary: Also for timing, gives quantiles (e.g., p50, p90, p99 latency)
# Can be more resource-intensive than histograms for high-cardinality labels.
# REQUEST_LATENCY_SUMMARY_SECONDS = Summary(
# 'myflaskapp_request_latency_summary_seconds',
# 'HTTP request latency summary in seconds',
# ['method', 'endpoint']
# )

# --- Application Routes ---
@app.route('/')
def home():
    start_time = time.time()
    # Simulate some work
    time.sleep(random.uniform(0.05, 0.2))
    status_code = 200
    REQUESTS_TOTAL.labels(method='GET', endpoint='/', status_code=status_code).inc()
    latency = time.time() - start_time
    REQUEST_LATENCY_SECONDS.labels(method='GET', endpoint='/').observe(latency)
    # REQUEST_LATENCY_SUMMARY_SECONDS.labels(method='GET', endpoint='/').observe(latency)
    return f"Hello! Processed in {latency:.4f}s", status_code

@app.route('/data')
def data_endpoint():
    start_time = time.time()
    # Simulate more work, sometimes an error
    work_time = random.uniform(0.1, 0.5)
    time.sleep(work_time)
    if random.random() < 0.1: # 10% chance of error
        status_code = 500
        REQUESTS_TOTAL.labels(method='GET', endpoint='/data', status_code=status_code).inc()
        latency = time.time() - start_time
        REQUEST_LATENCY_SECONDS.labels(method='GET', endpoint='/data').observe(latency)
        return "Internal Server Error", status_code

    status_code = 200
    REQUESTS_TOTAL.labels(method='GET', endpoint='/data', status_code=status_code).inc()
    latency = time.time() - start_time
    REQUEST_LATENCY_SECONDS.labels(method='GET', endpoint='/data').observe(latency)
    return f"Data response. Processed in {latency:.4f}s", status_code

@app.route('/metrics')
def metrics():
    """Expose Prometheus metrics."""
    return Response(generate_latest(REGISTRY), mimetype='text/plain; version=0.0.4; charset=utf-8')

if __name__ == '__main__':
    # In a real deployment, use a WSGI server like Gunicorn or uWSGI
    # Example: gunicorn -w 4 -b 0.0.0.0:8000 app_with_metrics:app
    # Make sure to install Flask and prometheus_client: pip install Flask prometheus_client
    print("Flask app running on http://localhost:5000")
    print("Metrics available at http://localhost:5000/metrics")
    app.run(host='0.0.0.0', port=5000)
