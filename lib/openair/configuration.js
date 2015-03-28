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
 * @param {String} [credentials.clientName] OpenAir client name
 * @param {String} [credentials.clientVersion] OpenAir client version
 * @param {Object} [options] options hash
 * @param {String} [options.wsdl] override WSDL url
 * @param {String} [options.endpoint] override endpoint, e.g. sandbox 'https://sandbox.openair.com/soap'
 * @return {Configuration}
 */
var Configuration = module.exports = function Configuration(credentials, options) {
  this.credentials = _.merge({
    clientName: 'openair-js client',
    version: '1.0'
  }, credentials);
  this.options = _.merge({
    wsdl: 'https://www.openair.com/wsdl.pl?wsdl',
    endpoint: undefined
  }, options);
};

/**
 * Namespace mappings
 * @constant
 * @type {Object}
 */
Configuration.NAMESPACES = {
  'oair': 'https://www.openair.com/OAirService'
};

/**
 * Add SOAP header. This method does NOT replace existing SOAP headers with same name.
 * @param {Object} header in `node-soap` format
 */
Configuration.prototype.addSoapHeader = function(header) {
  if (!this.client) {
    throw new Error('Client not initialized');
  }

  this.client.addSoapHeader(header);
};

/**
 * Remove all SOAP headers with given name
 * @param  {String} headerName header to remove
 */
Configuration.prototype.removeSoapHeader = function(headerName) {
  if (!this.client || !this.client.soapHeaders) {
    return;
  }

  // This uses `node-soap` Client internals. Client maintains array
  // of flattened (string) headers, so do a basic "startsWith" check
  for (var i = this.client.soapHeaders.length - 1; i >= 0; i--) {
    if (this.client.soapHeaders[i].indexOf('<' + headerName) === 0) {
      this.client.soapHeaders.splice(i, 1);
    }
  }
};

/**
 * Create an OpenAir client using Configuration credentials and options
 * @return {Promise.<client>}
 */
Configuration.prototype.createConnection = function() {
  var _this = this;
  var createClient = denodeify(soap.createClient);

  // Following _.merge() results in some extra items that will be ignored by createClient()
  var options = _.merge({
    attributesKey: '$attributes'
  }, this.options);

  return createClient(this.options.wsdl, options)
    .then(function(client) {
      // Add all namespaces to SOAP envelope. Note this uses some private API methods
      // TODO: subclass soap WSDL class
      // TODO: detect and only add needed namespaces
      _.assign(client.wsdl.definitions.xmlns, Configuration.NAMESPACES);
      client.wsdl.xmlnsInEnvelope = client.wsdl._xmlnsMap();

      // Workaround `node-soap` not handling operations with separate namespace
      client.wsdl.definitions.$targetNamespace = Configuration.NAMESPACES.oair;

      _this.client = client;
      return new Promise(function(resolve) {
        resolve(client);
      });
    });
};
