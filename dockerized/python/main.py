from fastapi import FastAPI
from random import randint
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.semconv.resource import ResourceAttributes

from opentelemetry.exporter.otlp.proto.grpc._log_exporter import (
    OTLPLogExporter,
)

import os
import logging

app = FastAPI()

# Set up the tracer provider
trace.set_tracer_provider(TracerProvider())

# otlp_exporter = OTLPSpanExporter(endpoint="http://localhost:4317", insecure=True) # Use this for gRPC
otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4317", insecure=True) # Use this for gRPC

service_name = os.environ.get('OTEL_SERVICE_NAME')
print(f'service_name: {service_name}')


trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(otlp_exporter)
)

FastAPIInstrumentor.instrument_app(app)

def must_map_env(key: str):
    value = os.environ.get(key)
    if value is None:
        raise Exception(f'{key} environment variable must be set')
    return value


@app.get("/roll-python")
async def roll_python():
    # Create a tracer
    service_name = must_map_env('OTEL_SERVICE_NAME')
    tracer = trace.get_tracer(service_name)
    with tracer.start_as_current_span("third-step-in-the-chain") as span:

        logger = logging.getLogger('main')
        logger.info(f'WHERE IS THIS PRINTIED')


    # Start a new span for this custom operation
        roll = randint(1, 6)  # Simulate rolling a dice
        # Add an event (log) to the span
        trace_id_hex = format(span.context.trace_id, '032x')
        span.add_event("Dice rolled", {"dice_value": str(roll), "trace_id": trace_id_hex })
        # Set an attribute on the span
        span.set_attribute("dice_roll", roll)
        span.set_attribute("trace_id", trace_id_hex)
        # throw an error

        print("span", span)

        if roll != 1:
            span.set_attribute("is_lucky", True)
        else:
            span.set_attribute("is_lucky", False)
            #throw an error
            raise Exception("Bad luck!")


        return {"python_dice_roll": roll}