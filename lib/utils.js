const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const XError = require('xerror');

exports.getPath = function(app, file) {
	if (file) return path.resolve(process.cwd(), file);
	return path.resolve(os.homedir(), `${app}.conf.yml`);
};

exports.read = function(path, allowFNF = false) {
	let text;
	try {
		text = fse.readFileSync(path, 'utf8');
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
