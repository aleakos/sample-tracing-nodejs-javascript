/*app.js*/
const express = require("express");

const PORT = parseInt(process.env.PORT || "8082");
const app = express();
const { context, trace, propagation } = require("@opentelemetry/api");

const logger = require('./logger')
const http = require('http');

const databaseTracer = trace.getTracer("database-operations");
const rollChainTracer = trace.getTracer("roll-some-friggin-chain");

const serviceName = process.env.OTEL_SERVICE_NAME;
console.log(`OTEL_SERVICE_NAME: ${serviceName}`);

app.get("/", (req, res) => {
  // const span = context.active().span;
  setTimeout(() => {
    res.send("Hello World");
  }, 1000);
});


app.get("/roll", (req, res) => {

  logger.info('Rolling a dice')
  const span = trace.getSpan(context.active());
  // const span = context.active().span;
  span.addEvent("Rolling a dice");
  const roll = Math.floor(Math.random() * 6) + 1;
  logger.info('Rolling a dice 2')
  span.setAttributes({ 'trace_id': span.spanContext().traceId })
  span.end();
  res.send(`You rolled a ${roll}`);
});

app.get("/roll-chain", (req, res) => {
  console.log('Rolling a dice chain');

  // const span = trace.getSpan(context.active());
  const span = rollChainTracer.startSpan("roll-chain-tracer");
  span.setAttributes({ 'trace_id': span.spanContext().traceId })
  span.addEvent("roll-chain begins");

  logger.info('roll-chain')

  const options = {
    hostname: 'localhost',
    port: 8083,
    path: '/roll',
    method: 'GET',
    headers: {}
  };

  // Inject the current trace context into the outgoing HTTP request headers
  // trace.propagation.inject(context.active(), options.headers);
  // opentelemetry.inject(context.active(), options.headers);
  propagation.inject(context.active(), options.headers);

  const request = http.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      span.addEvent("roll-chain END");
      res.send(data);
    });
  });

  request.on('error', (error) => {
    console.error(`Error making roll-chain request: ${error}`);
    res.status(500).send("Error making request");
  });

  span.addEvent("roll-chain ENDs");

  span.end();


  request.end(); // Don't forget to end the request
});


app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
