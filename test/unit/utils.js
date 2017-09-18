const utils = require('../../lib/utils');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const XError = require('xerror');

describe('utils', function() {
	describe('::getProjectDir', function() {
		let mainFilename;

		beforeEach(function() {
			mainFilename = require.main.filename;
			require.main.filename = '/path/to/main';
			sandbox.stub(fse, 'existsSync').returns(false);
		});

		afterEach(function() {
			require.main.filename = mainFilename;
		});

		it('checks each directory until root for package.json', function() {
			fse.existsSync.withArgs('/package.json').returns(true);

			let result = utils.getProjectDir();

			expect(fse.existsSync).to.be.calledThrice;
			expect(fse.existsSync).to.always.be.calledOn(fse);
			expect(fse.existsSync).to.be.calledWith('/path/to/package.json');
			expect(fse.existsSync).to.be.calledWith('/path/package.json');
			expect(fse.existsSync).to.be.calledWith('/package.json');
			expect(result).to.equal('/');
		});

		it('stops early if package.json is found', function() {
			fse.existsSync.withArgs('/path/package.json').returns(true);

			let result = utils.getProjectDir();

			expect(fse.existsSync).to.be.calledTwice;
			expect(fse.existsSync).to.always.be.calledOn(fse);
			expect(fse.existsSync).to.be.calledWith('/path/to/package.json');
			expect(fse.existsSync).to.be.calledWith('/path/package.json');
			expect(result).to.equal('/path');
		});

		it('throws invalid argument if package.json is not found', function() {
			expect(() => utils.getProjectDir())
				.to.throw(XError).that.satisfies((err) => {
					expect(err.code).to.equal(XError.INVALID_ARGUMENT);
					expect(err.message).to.equal(
						'Project directory could not be found automatically.'
					);
					return true;
				});
		});
	});

	describe('::getAppName', function() {
		const projectDir = '/path/to/project';
		const name = 'app-name';

		beforeEach(function() {
			sandbox.stub(fse, 'readJsonSync').returns({ name });
		});

		it('reads name from package.json', function() {
			let result = utils.getAppName(projectDir);

			expect(fse.readJsonSync).to.be.calledOnce;
			expect(fse.readJsonSync).to.be.calledOn(fse);
			expect(fse.readJsonSync).to.be.calledWithExactly(
				`${projectDir}/package.json`
			);
			expect(result).to.equal(name);
		});

		it('throws invalid argument if package.json has no name', function() {
			fse.readJsonSync.returns({});

			expect(() => utils.getAppName(projectDir))
				.to.throw(XError).that.satisfies((err) => {
					expect(err.code).to.equal(XError.INVALID_ARGUMENT);
					expect(err.message).to.equal(
						'App name could not be found automatically, ' +
						'was not set in package.json'
					);
					return true;
				});
		});

		it('throws invalid arugment if package.json could not be read', function() {
			let readErr = new Error('read error');
			fse.readJsonSync.throws(readErr);

			expect(() => utils.getAppName(projectDir))
				.to.throw(XError).that.satisfies((err) => {
					expect(err.code).to.equal(XError.INVALID_ARGUMENT);
					expect(err.message).to.equal(
						'App name could not be found automatically, ' +
						'package.json could not be read'
					);
					expect(err.data).to.deep.equal({
						path: `${projectDir}/package.json`
					});
					expect(err.cause).to.equal(readErr);
					return true;
				});
		});
	});

	describe('::addProjectDir', function() {
		const projectDir = '/path/to/project';

		beforeEach(function() {
			sandbox.stub(utils, 'getProjectDir').returns(projectDir);
		});

		it('returns copy of options with project dir from ::getProjectDir', function() {
			let result = utils.addProjectDir({ foo: 'bar' });

			expect(utils.getProjectDir).to.be.calledOnce;
			expect(utils.getProjectDir).to.be.calledOn(utils);
			expect(result).to.deep.equal({ foo: 'bar', projectDir });
		});

		it('returns unchanged options if project dir is already provided', function() {
			let options = { foo: 'bar', projectDir };

			let result = utils.addProjectDir(options);

			expect(utils.getProjectDir).to.not.be.called;
			expect(result).to.equal(options);
		});
	});

	describe('::addAppName', function() {
		const projectDir = '/path/to/project';
		const appName = 'app-name';

		beforeEach(function() {
			sandbox.stub(utils, 'getAppName').returns(appName);
		});

		it('returns copy of options with app name from ::getAppName', function() {
			let result = utils.addAppName({ foo: 'bar', projectDir });

			expect(utils.getAppName).to.be.calledOnce;
			expect(utils.getAppName).to.be.calledOn(utils);
			expect(utils.getAppName).to.be.calledWith(projectDir);
			expect(result).to.deep.equal({ foo: 'bar', projectDir, appName });
		});

		it('returns unchanged options if app name is already provided', function() {
			let options = { foo: 'bar', projectDir, appName };

			let result = utils.addAppName(options);

			expect(utils.getAppName).to.not.be.called;
			expect(result).to.equal(options);
		});
	});

	describe('::getPath', function() {
		it('returns the full path to the configuration file', function() {
			let file = 'path/to/config';
			let expected = path.resolve(process.cwd(), file);

			expect(utils.getPath('foo', file)).to.deep.equal(expected);
		});

		it('supports absolute paths', function() {
			let file = '/path/to/config';

			expect(utils.getPath('foo', file)).to.deep.equal(file);
		});

		it('defaults to app config in home folder', function() {
			let expected = path.resolve(os.homedir(), 'foo.conf.yml');

			expect(utils.getPath('foo')).to.deep.equal(expected);
		});
	});

	describe('::read', function() {
		const path = '/path/to/config';
		const text = 'foo: bar';
		const obj = { foo: 'bar' };

		beforeEach(function() {
			sandbox.stub(fse, 'readFileSync').returns(text);
			sandbox.stub(yaml, 'safeLoad').returns(obj);
		});

		it('synchronously reads parsed yaml from provided path', function() {
			let result = utils.read(path);

			expect(fse.readFileSync).to.be.calledOnce;
			expect(fse.readFileSync).to.be.calledOn(fse);
			expect(fse.readFileSync).to.be.calledWith(path, 'utf8');
			expect(yaml.safeLoad).to.be.calledOnce;
			expect(yaml.safeLoad).to.be.calledOn(yaml);
			expect(yaml.safeLoad).to.be.calledWithExactly(text);
			expect(result).to.deep.equal(obj);
		});

		it('throws invalid argument if file could not be read', function() {
			let readErr = new Error('read error');
			fse.readFileSync.throws(readErr);

			expect(() => utils.read(path))
				.to.throw(XError).that.satisfies((err) => {
					expect(err.code).to.equal(XError.INVALID_ARGUMENT);
					expect(err.message).to.equal('Could not read config file.');
					expect(err.data).to.deep.equal({ path });
					expect(err.cause).to.equal(readErr);
					return true;
				});
		});

		it('returns empty object if allowFNF is true and file could not be read', function() {
			let readErr = new Error('read error');
			fse.readFileSync.throws(readErr);

			let result = utils.read(path, true);

			expect(yaml.safeLoad).to.not.be.called;
			expect(result).to.deep.equal({});
		});

		it('throws invalid argument if yaml parsing fails', function() {
			let parseErr = new Error('parsing error');
			yaml.safeLoad.throws(parseErr);

			expect(() => utils.read(path))
				.to.throw(XError).that.satisfies((err) => {
					expect(err.code).to.equal(XError.INVALID_ARGUMENT);
					expect(err.message).to.equal('Invalid YAML in config file.');
					expect(err.data).to.deep.equal({ path });
					expect(err.cause).to.equal(parseErr);
					return true;
				});
		});
	});
});
