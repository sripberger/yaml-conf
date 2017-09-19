# yaml-conf

A simple yaml-based configuration utility for node apps, kept intentionally
feature-light in order to make the configuration files less intimidating to
non-technical users.


## Basic Usage

Assuming the following files exist:

In `/path/to/project/package.json`:
```
{
	"name": "application-name",
	...
}
```

In `/path/to/project/default.conf.yml`:
```yaml
foo: default foo
bar: default bar
```

In `~/application-name.conf.yml`
```yaml
foo: conf foo
baz: conf baz
```

You can create a configuration object using the `build` method:

```javascript
const yamlConf = require('yaml-conf');

let conf = yamlConf.build();

console.log(conf);
// {
//     foo: 'conf foo',
//     bar: 'default bar',
//     baz: 'conf baz'
// }
```


## Options

The `build` method allows you to provide options:

```javascript
let conf = yamlConf.build({
	projectDir: 'custom/project/dir',
	appName: 'custom-app-name',
	path: 'path/to/config/file',
	overrides: { foo: 'override foo' }
});
```
- **projectDir**: Normally, `build` obtains the project directory by traversing
  directories upward from `require.main.filename`, checking each directory for
  the existence of `package.json` as it goes. If this won't work in your project
  structure, or you want to specify a different project directory for whatever
  reason, you can do it here. If so, it must be a full path.
- **appName**: Normally, `build` obtains the app name from `package.json`in the
  project directory. If this won't work in your project, or you'd like to
  provide a different name for whatever reason, you can do it here.
- **path**: As demonstrated above, `build` defaults to reading from a file in
  the user's home directory with the name `${appName}.conf.yml`. You may use
  this option to specify an alternate configuration file. This supports both
  absolute paths as well as paths relative to the current working directory.
- **overrides**: Properties set here will override properties from files in the
  result object. Use this to allow configuration through command-line arguments
  or other non-yaml means.


## Example
`yaml-conf` fits well into the following pattern using
[commander](https://www.npmjs.com/package/commander) and
[lodash](https://www.npmjs.com/package/lodash):

```javascript
const _ = require('lodash');
const program = require('commander');
const yamlConf = require('yaml-conf');
const pkg = require('./package.json');

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-c --config', 'Path to custom configuration file')
	.option('-f --foo', 'foo option')
	.option('-b --bar', 'bar option')
	.parse(process.argv);

let conf = yamlConf.build({
	path: program.config,
	overrides: _.pick(program, [ 'foo', 'bar' ]);
});
```


## Similar Projects
As noted above, `yaml-conf` is kept intentionally feature-light. If you need
more features, you may be intersted in the following modules:

- [configurez](https://www.npmjs.com/package/configurez)
- [yaml-config](https://www.npmjs.com/package/yaml-config)
