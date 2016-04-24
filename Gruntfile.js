module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

	var src = 'src/**/*.js';
	var test = 'test/**/*.js';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// exec: {  //grunt-exec is not supported anymore
		// 	test: 'node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -c',
		// 	clean: 'rm -rf ./coverage'
		// },
		shell: {
			test: {
				command: "node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -c"				
			},
			clean: {
				command: "rm -rf ./coverage"
			}
		},
		jshint: {
			src: src,
			test: test,
			Gruntfile: 'Gruntfile.js',
			options: {
				esversion: 6
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

	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('test', ['jshint', 'shell:test']);
	grunt.registerTask('clean', ['shell:clean']);
	grunt.registerTask('default', ['test', 'connect', 'watch']);
};