const _ = require('lodash');
const path = require('path');
const utils = require('./utils');

/**
 * Synchronously builds a configuration object from files and options.
 * @param {Object} [options={}] - Build options.
 *   @param {String} [options.projectDir] - Directory where the app's
 *     package.json can be found. If omitted, this method will attempt to locate
 *     it by traversing directories upward and checking each for the existence
 *     of package.json. Will throw if it cannot be found.
 *     Default configuration, if any, should be placed in a file in this
 *     directory called `defaults.conf.yml`.
 *   @param {String} [options.appName] - Name of the application. If omitted,
 *     this method will read the name property from package.json. Will throw if
 *     package.json cannot be read or doesn't have a name property.
 *   @param {String} [options.path] - Path to the configuration file. If
 *     omitted, this method will use a file in the user's home directory with
 *     the name `${options.appName}.conf.yml`, if any exists.
 *   @param {Object} [overrides={}] - Properties set here will override
 *     properties from files in the result object. Use this to allow
 *     configuration through command-line arguments or other non-yaml means.
 * @returns {Object} - Built configuration object.
 */
exports.build = function(options = {}) {
	let withDefaults = utils.addDefaults(options);
	let confPath = utils.getPath(withDefaults);
	let defaultPath = path.resolve(withDefaults.projectDir, 'default.conf.yml');
	return _.defaultsDeep(
		{},
		options.overrides || {},
		utils.read(confPath, !options.path),
		utils.read(defaultPath, true)
	);
};
