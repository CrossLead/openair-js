/*
 * openair-js
 * https://github.com/CrossLead/openair-js
 *
 * Copyright (c) 2015 McChrystal Group
 * Licensed under the Apache license.
 *
 * @ignore
 */

'use strict';

require('es6-promise').polyfill();

/**
 * Main OpenAir package
 * @return {OpenAir}
 */
var OpenAir = module.exports = {};

OpenAir.Configuration = require('./openair/configuration');
