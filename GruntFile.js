module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        yeoman: {
            // configurable paths
            appFolder: 'app'
        },
        express: {
            options: {
                port: process.env.PORT || 3001
            },
            dev: {
                options: {
                    script: 'server.js',
                    debug: true,
                    node_env: 'development'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>/'
            }
        },
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.appFolder %>/server/**/*.js',
                    '<%= yeoman.appFolder %>/client/modules/**/*.css',
                    '<%= yeoman.appFolder %>/client/modules/**/*.html',
                    '<%= yeoman.appFolder %>/client/modules/**/*.js',
                    '<%= yeoman.appFolder %>/client/routes/**/*.css',
                    '<%= yeoman.appFolder %>/client/routes/**/*.html',
                    '<%= yeoman.appFolder %>/client/routes/**/*.js',
                    '<%= yeoman.appFolder %>/client/views/**/*.css',
                    '<%= yeoman.appFolder %>/client/views/**/*.html',
                    '<%= yeoman.appFolder %>/client/views/**/*.js',
                    '<%= yeoman.appFolder %>/client/images/{,*//*}*.{png,jpg,jpeg,gif}',
                    '!<%= yeoman.appFolder %>/client/bower_components/*.*'
                ],
                options: {
                    livereload: true
                }
            },
            express: {
                files: [
                    '<%= yeoman.appFolder %>/server/**/*.js',
                    '<%= yeoman.appFolder %>/client/modules/**/*.css',
                    '<%= yeoman.appFolder %>/client/modules/**/*.html',
                    '<%= yeoman.appFolder %>/client/modules/**/*.js',
                    '<%= yeoman.appFolder %>/client/routes/**/*.css',
                    '<%= yeoman.appFolder %>/client/routes/**/*.html',
                    '<%= yeoman.appFolder %>/client/routes/**/*.js',
                    '<%= yeoman.appFolder %>/client/views/**/*.css',
                    '<%= yeoman.appFolder %>/client/views/**/*.html',
                    '<%= yeoman.appFolder %>/client/views/**/*.js',
                    '<%= yeoman.appFolder %>/client/images/{,*//*}*.{png,jpg,jpeg,gif}',
                    '!<%= yeoman.appFolder %>/client/bower_components/*.*'
                ],
                tasks: ['express:dev', 'wait'],
                options: {
                    livereload: true,
                    nospawn: true // reload express
                }
            }
        }
    });

    grunt.registerTask('serve', function () {
        grunt.task.run([
            'express:dev',
            'wait',
            'open',
            'watch'
        ]);
    });

    // delay live reload until after server has restarted
    grunt.registerTask('wait', function () {
        grunt.log.ok('Waiting for server reload...');

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln('Done waiting!');
            done();
        }, 1500);
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');

};