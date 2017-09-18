const _ = require('lodash');
const path = require('path');
const utils = require('./utils');

exports.build = function(options) {
	let confPath = utils.getPath(options);
	let defaultPath = path.resolve(options.projectDir, 'default.conf.yml');
	return _.defaultsDeep(
		{},
		options.overrides,
		utils.read(confPath, !options.path),
		utils.read(defaultPath, true)
	);
};
