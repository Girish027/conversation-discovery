#!/usr/bin/env bash
IDXDIFF=`git diff index.js`
if [ -n "$IDXDIFF" ]; then
  echo Commit changes to index.js before running this script.
  echo
  exit 1
fi

if [ "$1" = "install" ]; then
  PKGDIFF=`git diff package.json`
  if [ -n "$PKGDIFF" ]; then
    echo Commit changes to package.json before running this script.
    echo
    exit 1
  fi

  npm install wdio-browserstack-service@0.1.18
  npm install wdio-mocha-framework@0.6.4
  npm install wdio-selenium-standalone-service@0.0.12
  npm install wdio-spec-reporter@0.1.5
  npm install webdriverio@4.14.1
  npm install
  git checkout package.json
  exit 0
fi

# replace application server.run with webdriverio server run
grep -v 'server.run' index.js  > temp.js
mv temp.js index.js
cat src/client/wdio/server.run.js >> index.js

npm run start

# # run tests that do not require Okta authentication
# REQUIRE_OKTA_AUTHENTICATION=0 npm run start

# # run tests that require Okta authentication
CFD_SERVER_CONFIG="./src/server/config/conversation-discovery.json"
# node -e "
#   const c=require('$CFD_SERVER_CONFIG');
#   c.security.enabled=true;
#   console.log(JSON.stringify(c, null, 2));
# " > temp.js
# mv temp.js $CFD_SERVER_CONFIG

# REQUIRE_OKTA_AUTHENTICATION=1 npm run start

# cleanup
git checkout $CFD_SERVER_CONFIG
git checkout index.js
