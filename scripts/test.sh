#!/usr/bin/env bash
set -e
mkdir -p logs
#npm run eslint
node_modules/.bin/jest --coverage -c jest.config.js