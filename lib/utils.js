const _ = require('lodash');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const XError = require('xerror');

/**
 * Internal utility functions.
 * @name utils
 * @kind module
 * @private
 */

/**
 * Synchronously locates the app's project directory by traversing upwards,
 * checking each directory for the existence of package.json. Throws if none is
 * found.
 * @memberof utils
 * @returns {String} - Path to app's project directory.
 */
exports.getProjectDir = function() {
	let lastDir;
	let dir = path.dirname(require.main.filename);
	// Dir will stop changing when root is reached.
	while(dir !== lastDir) {
		if (fse.existsSync(path.resolve(dir, 'package.json'))) return dir;
		lastDir = dir;
		dir = path.dirname(dir);
	}
	throw new XError(
		XError.INVALID_ARGUMENT,
		'Project directory could not be found automatically.'
	);
};

/**
 * Reads the app's name from package.json. Throws if none is found.
 * @memberof utils
 * @param {String} projectDir - Directory that contains package.json.
 * @returns {String} - App name from package.json.
 */
exports.getAppName = function(projectDir) {
	let packagePath = path.resolve(projectDir, 'package.json');
	let name;
	try {
		({ name } = fse.readJsonSync(packagePath));
	} catch(err) {
		throw new XError(
			XError.INVALID_ARGUMENT,
			'App name could not be found automatically, ' +
			'package.json could not be read',
			{ path: packagePath },
			err
		);
	}
	if (name) return name;
	throw new XError(
		XError.INVALID_ARGUMENT,
		'App name could not be found automatically, ' +
		'was not set in package.json'
	);
};

/**
 * Ensures that an options object has a projectDir set.
 * @memberof utils
 * @param {Object} options - Options object.
 * @returns {Object} - A copy of `options` with the default projectDir added, or
 *   `options` directly if it already has a projectDir.
 */
exports.addProjectDir = function(options) {
	if (options.projectDir) return options;
	let result = _.clone(options);
	result.projectDir = exports.getProjectDir();
	return result;
};

/**
 * Ensures that an options object has an appName set.
 * @memberof utils
 * @param {Object} options - Options object.
 * @returns {Object} - A copy of `options` with the default appName added, or
 *   `options` directly if it already has a appName.
 */
exports.addAppName = function(options) {
	if (options.appName) return options;
	let result = _.clone(options);
	result.appName = exports.getAppName(options.projectDir);
	return result;
};

/**
 * Ensures that an options object has a both projectDir and appName set.
 * @memberof utils
 * @param {Object} options - Options object.
 * @returns {Object} - A copy of `options` with the defaults added, or
 *   `options` directly if it already has both projectDir and appName.
 */
exports.addDefaults = function(options) {
	return exports.addAppName(exports.addProjectDir(options));
};

/**
 * Gets the path to the configuration file.
 * @memberof utils
 * @param {Object} options - Options object.
 *   @param {String} options.appName - Name of app.
 *   @param {String} [options.path] - Relative path to config file. If omitted,
 *     will return a path to a file in the user's home directory with the name
 *     `${options.appName}.conf.yml`.
 * @returns {String} - Full path to configuration file.
 */
exports.getPath = function(options) {
	if (options.path) return path.resolve(process.cwd(), options.path);
	return path.resolve(os.homedir(), `${options.appName}.conf.yml`);
};

/**
 * Synchronously reads a config file.
 * @memberof utils
 * @param {String} file - Full path to file.
 * @param {boolean} [allowFNF=false] - If true, a missing or otherwise
 *   inaccessible file will cause this to return an empty object instead of
 *   throwing.
 * @returns {Object} - Parsed yaml from file.
 */
exports.read = function(file, allowFNF = false) {
	let text;
	try {
		text = fse.readFileSync(file, 'utf8');
	} catch(err) {
		if (allowFNF) return {};
		throw new XError(
			XError.INVALID_ARGUMENT,
			'Could not read config file.',
			{ path },
			err
		);
	}

	try {
		return yaml.safeLoad(text);
	} catch(err) {
		throw new XError(
			XError.INVALID_ARGUMENT,
			'Invalid YAML in config file.',
			{ path },
			err
		);
	}
};
