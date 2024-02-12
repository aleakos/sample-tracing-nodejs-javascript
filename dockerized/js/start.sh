#!/bin/sh
node --require ./tracing.js --require ./chained-app.js app.js --config ./config.json
