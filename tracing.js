// /*tracing.js*/
// // Require dependencies
// const opentelemetry = require("@opentelemetry/sdk-node");
// const {
//   getNodeAutoInstrumentations,
// } = require("@opentelemetry/auto-instrumentations-node");
// const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
// const {
//   OTLPTraceExporter,
// } = require("@opentelemetry/exporter-trace-otlp-http");

// // For troubleshooting, set the log level to DiagLogLevel.DEBUG
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// const sdk = new opentelemetry.NodeSDK({
//   // traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
//   traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
//   traceExporter: new OTLPTraceExporter({
//     url: "http://localhost:5080/api/default/traces",
//     headers: {
//       Authorization: "Basic YWxlYWtvc0BnbWFpbC5jb206RkZRamxWRGhrV0RRM3VPTA==",
//     },
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
//   serviceName: "nodejs-javascript-service",

// });

// const { AsyncHooksContextManager } = require('@opentelemetry/context-async-hooks');
// const { context } = require('@opentelemetry/api')

// const contextManager = new AsyncHooksContextManager();
// contextManager.enable();
// context.setGlobalContextManager(contextManager);


// const { NodeSDK } = require('@opentelemetry/sdk-node');
// const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
// const {
//   getNodeAutoInstrumentations,
// } = require('@opentelemetry/auto-instrumentations-node');
// const {
//   PeriodicExportingMetricReader,
//   ConsoleMetricExporter,
// } = require('@opentelemetry/sdk-metrics');

// const sdk = new NodeSDK({
//   traceExporter: new ConsoleSpanExporter(),
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new ConsoleMetricExporter(),
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
// });

const opentelemetry = require('@opentelemetry/sdk-node');
const {
  getNodeAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-node');
const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-proto');
const {
  OTLPMetricExporter,
} = require('@opentelemetry/exporter-metrics-otlp-proto');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');


const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    // url: 'http://localhost:9193/v1/traces',
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // only instrument fs if it is part of another trace
      '@opentelemetry/instrumentation-fs': {
        requireParentSpan: true,
      },
    })
  ],
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      //url: '<your-otlp-endpoint>/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
      concurrencyLimit: 1, // an optional limit on pending requests
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on("SIGTERM", () => {
  sdk.shutdown().then(() => {
    process.exit(0);
  });
}
);
