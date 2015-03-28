'use strict';

var denodeify = require('denodeify');

/**
 * Helper to ensure we have an OpenAir connection
 * @private
 * @param  {Service} service
 */
function assertConnection(service) {
  if (!(service && service.config && service.config.client)) {
    throw new Error('OpenAir connection not configured');
  }
}

/**
 * A service client through which requests are sent.
 *
 * @class
 * @param  {NetSuite.Configuration} config
 * @return {Service}
 */
var Service = module.exports = function Service(config) {
  this.config = config;
  /**
   * @member {String} session id if connected
   */
  this.sessionId = '';
};

/**
 * Initialize this service client with given config.
 * @param {Boolean} [skipLogin=false] Don't try to login and setup an initial session
 * @return {Promise.<client>} connected `node-soap` client
 */
Service.prototype.init = function(skipLogin) {
  var _this = this;
  return this.config.createConnection()
    .then(function(client) {
      console.log('WSDL successfully parsed');
      if (skipLogin) {
        return new Promise(function(resolve) {
          resolve(client);
        });
      } else {
        console.log('Attempting login');
        var login = denodeify(_this.config.client.OAirServiceHandlerService.OAirService.login);
        return login({
          login_par: {
            api_namespace: _this.config.credentials.apiNamespace,
            api_key: _this.config.credentials.apiKey,
            company: _this.config.credentials.companyId,
            user: _this.config.credentials.userId,
            password: _this.config.credentials.password,
            client: _this.config.credentials.clientName,
            version: _this.config.credentials.version
          }
        });
      }
    })
    .then(function(result, rawResponse, soapHeader) {
      _this.sessionId = result.loginReturn.sessionId.$value;
      console.log('Login successful. Setting SessionHeader to: ' + _this.sessionId);
      _this.config.addSoapHeader({
        SessionHeader: _this.sessionId
      });
      return new Promise(function(resolve) {
        resolve(_this.config.client);
      });
    });
};
