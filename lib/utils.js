const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const XError = require('xerror');

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
