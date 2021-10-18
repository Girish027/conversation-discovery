/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
class MySQLConnectorMock {
  initialize() {
  }
 
  async executeQuery(query) {
    return query;
  }
 
  getPool() {
    return;
  }
}
 
module.exports = MySQLConnectorMock;
 