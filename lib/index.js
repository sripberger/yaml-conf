const _ = require('lodash');
const path = require('path');
const utils = require('./utils');

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
