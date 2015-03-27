'use strict';

var _ = require('lodash'),
  denodeify = require('denodeify'),
  soap = require('soap');

/**
 * Represents configuration settings and helper functionality to connect to OpenAir.
 *
 * @class
 * @param {Object} credentials OpenAir credentials hash
 * @param {String} credentials.apiNamespace API namespace given by OpenAir account rep
 * @param {String} credentials.apiKey API key given by OpenAir account rep
 * @param {String} credentials.companyId OpenAir company id
 * @param {String} credentials.userId OpenAir user id
 * @param {String} credentials.password OpenAir password
 * @param {Object} [options] options hash
 * @param {String} [options.wsdl] override WSDL url
 * @param {String} [options.endpoint] override endpoint, e.g. sandbox 'https://sandbox.openair.com/soap'
 * @return {Configuration}
 */
var Configuration = module.exports = function Configuration(credentials, options) {
  this.credentials = credentials || {};
  this.options = _.merge({
    wsdl: 'https://www.openair.com/wsdl.pl?wsdl',
    endpoint: undefined
  }, options);
};

/**
 * Create an OpenAir client using Configuration credentials and options
 * @param {Boolean} [skipLogin=false] Don't try to login and setup an initial session
 * @return {Promise.<client>}
 */
Configuration.prototype.createConnection = function(skipLogin) {
  var _this = this;
  var createClient = denodeify(soap.createClient);

  // Following _.merge() results in some extra items that will be ignored by createClient()
  var options = _.merge({
    attributesKey: '$attributes'
  }, this.options);

  return createClient(this.options.wsdl, options)
    .then(function(client) {
      _this.client = client;
      if (skipLogin) {
        return new Promise(function(resolve) {
          resolve(client);
        });
      } else {
        return new Promise(function(resolve) {
          console.log('This will try to login');
          resolve(client);
        });
      }
    });
};
