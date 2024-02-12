/*app.js*/
const express = require("express");

const PORT = parseInt(process.env.PORT2 || "8083");
const app = express();
const { context, trace, propagation } = require("@opentelemetry/api");
const opentelemetry = require('@opentelemetry/api')

const logger = require('./logger')

const someTracer = trace.getTracer("SECOND-STEP-IN-THE-CHAIN");

const serviceName = process.env.OTEL_SERVICE_NAME;
console.log(`OTEL_SERVICE_NAME: ${serviceName}`);

app.get("/", (req, res) => {
  // const span = context.active().span;
  setTimeout(() => {
    res.send("Hello World");
  }, 1000);
});

app.get("/roll", async (req, res) => {
  // const span = trace.getSpan(context.active());
  const span = someTracer.startSpan('this-is-the-second-step-in-the-chain')
  span.addEvent("Rolling a dice");

  // Simulate dice roll
  const roll = Math.floor(Math.random() * 6) + 1;
  // trace_id
  span.setAttributes({ 'dice_roll': roll , 'trace_id': span.spanContext().traceId })

  // Call the FastAPI /roll-python endpoint
  const pythonServiceURL = 'http://localhost:8084/roll-python'; // Adjust the port if necessary
  const traceHeaders = {};
  propagation.inject(context.active(), traceHeaders);

  console.log({traceHeaders})


  try {
    const pythonResponse = await fetch(pythonServiceURL, { headers: traceHeaders });
    const pythonResult = await pythonResponse.text();

    span.addEvent("Called roll-python");
    res.send(`Rolled a ${roll} and called roll-python: ${pythonResult}`);
  } catch (error) {
    console.error('Error calling roll-python:', error);
    res.status(500).send("Error calling the Python service");
  } finally {
    span.end();
  }
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
