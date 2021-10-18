const constants = require('../lib/constants');

class UpdateQueryBuilder {

  constructor(logger) {
    this.updateParameters = '';
    this.whereClause = '';
    this.tableName = '';
    this.logger = logger;
  }

  table(tableName) {
    this.tableName = tableName;
    return this;
  }

  setStringUpdateParameters(name, value) {
    this.updateParameters += `${name} = '${value}',`;
    return this;
  }

  setIntegerUpdateParameters(name, value) {
    this.updateParameters += `${name} = ${value},`;
    return this;
  }

  setWhereClauseParameters(name, value, operator) {
    this.whereClause += `${name} ${operator} '${value}' AND `;
    return this;
  }

  build() {
    if (this.updateParameters.length === 0) throw new Error(constants.ERRORS.BODY_PARAMETERS_MISSING);
    if (this.whereClause.length === 0) this.logger.warn('There is no where clause specified on update query.');
    this.updateParameters = this.updateParameters.substring(0, this.updateParameters.length - 1);
    this.whereClause = this.whereClause.substring(0, this.whereClause.length - 5);
    const query = `UPDATE ${this.tableName} SET ${this.updateParameters} WHERE ${this.whereClause}`;
    return query;
  }

}

module.exports = UpdateQueryBuilder;