'use strict';
const constants = require('../constants');

module.exports.getHigherRole = (role1, role2) => 
constants.roleHierarchy[role1] > constants.roleHierarchy[role2] ?
role1 : role2;