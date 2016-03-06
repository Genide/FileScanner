module.exports = function (grunt) {
	var src = 'src/**/*.js';
	var test = 'test/**/*.js';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		exec: {
			test: 'node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- -c'
		},
		jshint: {
			all: ['Gruntfile.js', src, test],
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

	grunt.registerTask('test', ['exec:test']);
	grunt.registerTask('default', ['test', 'connect', 'watch']);
};