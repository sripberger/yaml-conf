const yamlConf = require('../../lib');
const sinon = require('sinon');
const _ = require('lodash');
const utils = require('../../lib/utils');

describe('index', function() {
	describe('::build', function() {
		let options, confPath, defaultPath, conf, defaultConf;

		beforeEach(function() {
			options = {
				app: 'foo',
				path: 'relative/conf/path',
				projectDir: '/path/to/project',
				overrides: { override: 'bar' }
			};
			confPath = '/absolute/conf/path';
			defaultPath = '/path/to/project/default.conf.yml';
			conf = { conf: 'baz' };
			defaultConf = { default: 'qux' };

			sandbox.stub(utils, 'getPath').returns(confPath);
			sandbox.stub(utils, 'read')
				.withArgs(confPath, sinon.match.any).returns(conf)
				.withArgs(defaultPath, sinon.match.any).returns(defaultConf);
			sandbox.stub(_, 'defaultsDeep').returnsArg(0);
		});

		it('creates config from provided options and project defaults', function() {
			let result = yamlConf.build(options);

			expect(utils.getPath).to.be.calledOnce;
			expect(utils.getPath).to.be.calledWith(
				options.app,
				options.path
			);
			expect(utils.read).to.be.calledTwice;
			expect(utils.read).to.be.calledWith(confPath, false);
			expect(utils.read).to.be.calledWith(defaultPath, true);
			expect(_.defaultsDeep).to.be.calledOnce;
			expect(_.defaultsDeep).to.be.calledWithExactly(
				{},
				options.overrides,
				conf,
				defaultConf
			);
			expect(result).to.equal(_.defaultsDeep.firstCall.returnValue);
		});

		it('allows FNF if path option is not provided', function() {
			delete options.path;

			yamlConf.build(options);

			expect(utils.read).to.be.calledTwice;
			expect(utils.read).to.be.calledWith(confPath, true);
			expect(utils.read).to.be.calledWith(defaultPath, true);
		});
	});
});
