const os = require('os');
const Constants = require('../lib/constants');

const getAuthentications = async (req, res) => {
  let name,email;
  // TODO: name should be having user's full name.
  // email should also be sent as a different property
  if (req.isAuthenticated() && req.userContext && req.userContext.userinfo) {
    name = req.userContext.userinfo.name;
    email = req.userContext.userinfo.email;
  } else {
    name = os.userInfo().username.replace('.', ' ');
    email = 'email';
  }

  const config = req.app.locals._config;
  const analyticsKey = config.get(Constants.ANALYTICSKEY_CONFIG_KEY);
  const oktaUrl = config.get(Constants.OKTA_URL);
  const isAuthenticated = req.isAuthenticated();

  if (req.query && req.query.self && req.query.self === 'true') {
    res.status(200).send([{ name, analyticsKey, isAuthenticated, oktaUrl, email }]);
  } else {
    // currently, caller may only request profile info about itself
    res.sendStatus(400);
  }
};

module.exports = {
  getAuthentications
};
