const utils = require('../../lib/utils');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');
const yaml = require('js-yaml');
const XError = require('xerror');

describe('utils', function() {
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
