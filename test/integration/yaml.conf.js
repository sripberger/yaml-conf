const yamlConf = require('../../lib');
const fs = require('fs');
const os = require('os');
const path = require('path');
const rimraf = require('rimraf');

describe('yaml-conf', function() {
	const tmpDir = path.resolve(__dirname, 'tmp');
	const homeDir = path.resolve(tmpDir, 'home');
	const projectDir = path.resolve(tmpDir, 'project');
	const appName = 'yaml-conf-test';
	const homeConfPath = path.resolve(homeDir, `${appName}.conf.yml`);
	const defaultPath = path.resolve(projectDir, 'default.conf.yml');

	beforeEach(function() {
		fs.mkdirSync(tmpDir);
		fs.mkdirSync(homeDir);
		fs.mkdirSync(projectDir);

		sandbox.stub(os, 'homedir').returns(homeDir);
	});

	afterEach(function() {
		rimraf.sync(tmpDir);
	});

	context('path option provided', function() {
		const confPath = path.resolve(tmpDir, 'conf.yml');

		beforeEach(function() {
			fs.writeFileSync(confPath, 'foo: asdf\nbar: 42', 'utf8');
		});

		it('builds conf from file at path', function() {
			expect(yamlConf.build({
				projectDir,
				appName,
				path: confPath
			})).to.deep.equal({
				foo: 'asdf',
				bar: 42
			});
		});

		it('supports project-level defaults and overrides', function() {
			fs.writeFileSync(defaultPath, 'foo: default\nbaz: default', 'utf8');

			expect(yamlConf.build({
				projectDir,
				appName,
				path:confPath,
				overrides: { foo: 'override' }
			})).to.deep.equal({
				foo: 'override',
				bar: 42,
				baz: 'default'
			});
		});
	});

	context('path option not provided', function() {
		beforeEach(function() {
			fs.writeFileSync(homeConfPath, 'foo: asdf\nbar: 42', 'utf8');
		});

		it('builds conf from app conf file in home directory', function() {
			expect(yamlConf.build({
				projectDir,
				appName
			})).to.deep.equal({
				foo: 'asdf',
				bar: 42
			});
		});

		it('supports project-level defaults and overrides', function() {
			fs.writeFileSync(defaultPath, 'foo: default\nbaz: default', 'utf8');

			expect(yamlConf.build({
				projectDir,
				appName,
				overrides: { foo: 'override' }
			})).to.deep.equal({
				foo: 'override',
				bar: 42,
				baz: 'default'
			});
		});

		it('does not require home app conf file to exist', function() {
			fs.unlinkSync(homeConfPath);

			expect(yamlConf.build({
				projectDir,
				appName,
				overrides: { foo: 'override' }
			})).to.deep.equal({
				foo: 'override'
			});
		});
	});
});
