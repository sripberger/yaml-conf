const yamlConf = require('../../lib');
const sinon = require('sinon');
const _ = require('lodash');
const utils = require('../../lib/utils');

describe('index', function() {
	describe('::build', function() {
		let options, withDefaults, confPath, defaultPath, conf, defaultConf;

		beforeEach(function() {
			options = {
				path: 'relative/conf/path',
				overrides: { override: 'bar' }
			};
			withDefaults = _.assign({}, options, {
				projectDir: '/path/to/project',
				appName: 'foo'
			});
			confPath = '/absolute/conf/path';
			defaultPath = '/path/to/project/default.conf.yml';
			conf = { conf: 'baz' };
			defaultConf = { default: 'qux' };

			sandbox.stub(utils, 'addDefaults').returns(withDefaults);
			sandbox.stub(utils, 'getPath').returns(confPath);
			sandbox.stub(utils, 'read')
				.withArgs(confPath, sinon.match.any).returns(conf)
				.withArgs(defaultPath, sinon.match.any).returns(defaultConf);
			sandbox.stub(_, 'defaultsDeep').returnsArg(0);
		});

		it('creates config from provided options and project defaults', function() {
			let result = yamlConf.build(options);

			expect(utils.addDefaults).to.be.calledOnce;
			expect(utils.addDefaults).to.be.calledOn(utils);
			expect(utils.addDefaults).to.be.calledWith(options);
			expect(utils.getPath).to.be.calledOnce;
			expect(utils.getPath).to.be.calledWith(withDefaults);
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

			let result = yamlConf.build(options);

			expect(utils.addDefaults).to.be.calledOnce;
			expect(utils.addDefaults).to.be.calledOn(utils);
			expect(utils.addDefaults).to.be.calledWith(options);
			expect(utils.getPath).to.be.calledOnce;
			expect(utils.getPath).to.be.calledWith(withDefaults);
			expect(utils.read).to.be.calledTwice;
			expect(utils.read).to.be.calledWith(confPath, true);
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

		it('defaults to empty options object', function() {
			let result = yamlConf.build();

			expect(utils.addDefaults).to.be.calledOnce;
			expect(utils.addDefaults).to.be.calledOn(utils);
			expect(utils.addDefaults).to.be.calledWith({});
			expect(utils.getPath).to.be.calledOnce;
			expect(utils.getPath).to.be.calledWith(withDefaults);
			expect(utils.read).to.be.calledTwice;
			expect(utils.read).to.be.calledWith(confPath, true);
			expect(utils.read).to.be.calledWith(defaultPath, true);
			expect(_.defaultsDeep).to.be.calledOnce;
			expect(_.defaultsDeep).to.be.calledWithExactly(
				{},
				{},
				conf,
				defaultConf
			);
			expect(result).to.equal(_.defaultsDeep.firstCall.returnValue);
		});
	});
});
