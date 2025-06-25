# app_with_otel.py
from flask import Flask
import time
import random

# OpenTelemetry Imports
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter # Simple console exporter for demo
# For OTLP (e.g., to Jaeger, Lightstep, Honeycomb, Grafana Tempo etc.)
# from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor

# --- Setup OpenTelemetry ---
# Define a resource for your service (optional but good practice)
resource = Resource(attributes={
    "service.name": "my-flask-app",
    "service.version": "0.1.0"
})

# Set trace provider with the resource
trace_provider = TracerProvider(resource=resource)
trace.set_tracer_provider(trace_provider)
tracer = trace.get_tracer(__name__) # Get a tracer for the current module

# Configure an exporter
# For this example, we'll use ConsoleSpanExporter to print traces to the console.
# In a production setup, you'd configure an exporter for Jaeger, Zipkin, an OTLP-compatible backend,
# or a commercial APM vendor.
span_exporter = ConsoleSpanExporter()

# Example for OTLP Exporter (requires opentelemetry-exporter-otlp-proto-http or -grpc)
# Make sure your OTLP collector (e.g., Jaeger, Grafana Agent, OpenTelemetry Collector) is running.
# OTLP_ENDPOINT = "http://localhost:4318/v1/traces" # OTLP HTTP endpoint
# otlp_exporter = OTLPSpanExporter(endpoint=OTLP_ENDPOINT)

# Use BatchSpanProcessor for production for better performance.
# It batches spans before sending them to the exporter.
span_processor = BatchSpanProcessor(span_exporter) # Use otlp_exporter for OTLP
trace_provider.add_span_processor(span_processor)
# --- End OpenTelemetry Setup ---

app = Flask(__name__)

# --- Auto-instrument Flask ---
# This will automatically create spans for incoming Flask requests and can instrument
# common libraries like `requests` if they are also instrumented.
FlaskInstrumentor().instrument_app(app)
# --- End Auto-instrumentation ---

# Example of a function that might be called within a request, with custom span
def process_data_for_request():
    # Get the current tracer
    # tracer = trace.get_tracer(__name__) # Already defined globally

    # Create a custom child span for this specific operation
    with tracer.start_as_current_span("process_data_operation") as child_span:
        # Add attributes to the span for more context
        child_span.set_attribute("processing.type", "complex_calculation")
        child_span.set_attribute("input.size", random.randint(100, 1000))

        # Simulate some work
        time.sleep(random.uniform(0.02, 0.08))

        # Add an event to mark a point in time within the span
        child_span.add_event("Calculation complete", {"result_value": 42})

        return "data_processed_successfully"

@app.route('/')
def home():
    # The FlaskInstrumentor already creates a parent span for this request.
    # We can get the current span and add attributes if needed:
    current_span = trace.get_current_span()
    current_span.set_attribute("user.type", "guest" if random.random() > 0.5 else "member")

    # Call our custom instrumented function
    processing_result = process_data_for_request()
    current_span.set_attribute("processing.result", processing_result)

    # Simulate some other work
    time.sleep(random.uniform(0.01, 0.05))

    return "Hello, Traced World!"

@app.route('/user/<user_id>')
def user_profile(user_id):
    current_span = trace.get_current_span()
    current_span.set_attribute("user.id", user_id)

    with tracer.start_as_current_span("fetch_user_details") as db_span:
        db_span.set_attribute("db.system", "simulated_db")
        db_span.set_attribute("db.statement", f"SELECT * FROM users WHERE id = {user_id}")
        time.sleep(random.uniform(0.03, 0.1)) # Simulate DB call
        user_name = f"User_{user_id}"
        db_span.set_attribute("db.user.name", user_name)

    return f"Profile for {user_name}"

# If you also want to serve Prometheus metrics from app_with_metrics.py:
# from prometheus_client import generate_latest, REGISTRY # Ensure this is installed
# @app.route('/metrics')
# def metrics():
#     from flask import Response # ensure Response is imported
#     return Response(generate_latest(REGISTRY), mimetype='text/plain; version=0.0.4; charset=utf-8')


if __name__ == '__main__':
    # To run this example:
    # 1. pip install Flask opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-flask
    #    (and opentelemetry-exporter-otlp-proto-http if using OTLPExporter)
    # 2. Run the script: python app_with_otel.py
    # 3. Access http://localhost:5001/ and http://localhost:5001/user/123 in your browser.
    # 4. Observe the trace output in your console (due to ConsoleSpanExporter).
    #    If using OTLP, check your configured backend (e.g., Jaeger UI).

    print("Flask app with OpenTelemetry (Console Exporter) running on http://localhost:5001")
    print("Access endpoints like / or /user/test to generate traces.")
    print("Traces will be printed to the console.")
    app.run(host='0.0.0.0', port=5001, debug=False) # debug=False for cleaner OTel output sometimes
```
