#!/usr/bin/env sh

if [ -z "$NODE_ENV" ]; then
    NODE_ENV=dev
    echo "Defaulting NODE_ENV to $NODE_ENV";
fi

if [ -n "$GREP" ]; then
    GREPPARAM="--grep $GREP"
fi

NODE_ENV=$NODE_ENV node_modules/.bin/mocha --inspect-brk $GREPPARAM 2>&1 | \
  sed 's@ws://@chrome-devtools://devtools/bundled/inspector.html?experiments=true\&v8only=true\&ws=@'
