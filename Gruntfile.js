module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks.

	var src = 'src/**/*.js';
	var test = 'test/**/*.js';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		shell: {
			test: "node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -c",
			clean: "rm -rf ./coverage",
			update_doc: "git subtree push --prefix doc origin gh-pages"
		},
		jshint: {
			src: src,
			test: test,
			Gruntfile: 'Gruntfile.js',
			options: {
				esversion: 6,
				node: true,
				mocha: true,
				undef: true
			}
		},
		watch: {
			options: {
				livereload: true
			},
			src: {
				files: [src],
				tasks: ['jshint:src', 'exec:test']
			},
			test: {
				files: [test],
				tasks: ['jshint:test', 'exec:test']
			},
			Gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:Gruntfile']
			}
		},
		jsdoc: {
			doc: {
				src: [src],
				options: {
					destination: 'doc/',
					readme: "README.md",
					template: 'node_modules/ink-docstrap/template',
					configure: 'conf.json'
				}
			}
		},
		connect: {
			server:{
				options: {
					livereload: true,
					hostname: '127.0.0.1',
					port: '9001',
					open: true,
					base: './coverage/lcov-report/'
				}
			}
		}
	});

	grunt.registerTask('test', ['jshint', 'shell:test']);
	grunt.registerTask('clean', ['shell:clean']);
	grunt.registerTask('debug', ['test', 'connect', 'watch']);
	grunt.registerTask('update_doc', ['shell:update_doc']);
	grunt.registerTask('default', ['test', 'jsdoc:doc']);
};
