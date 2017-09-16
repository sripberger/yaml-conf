const _ = require('lodash');
const path = require('path');
const utils = require('./utils');

exports.build = function(options) {
	let confPath = utils.getConfigPath(options.app, options.path);
	let defaultPath = path.resolve(options.projectDir, 'default.conf.yml');
	return _.defaultsDeep(
		{},
		options.overrides,
		utils.readConfig(confPath, !options.path),
		utils.readConfig(defaultPath, true)
	);
};
