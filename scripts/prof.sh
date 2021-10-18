#!/usr/bin/env sh

if [ -z "$NODE_ENV" ]; then
    NODE_ENV=dev
    echo "Defaulting NODE_ENV to $NODE_ENV";
fi

touch heartbeat.txt
mkdir -p logs

# https://nodejs.org/en/docs/guides/simple-profiling/
NODE_ENV=$NODE_ENV node \
  --prof \
  --use_strict \
  index.js \
  --config src/server/config/conversation_discovery.json

# afterward:
# node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
