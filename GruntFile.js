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
                    debug: true
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>/comic'
            }
        },
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.appFolder %>/**/*.css',
                    '<%= yeoman.appFolder %>/**/*.html',
                    '<%= yeoman.appFolder %>/**/*.js',
                    '<%= yeoman.appFolder %>/images/{,*//*}*.{png,jpg,jpeg,gif}'
                ],
                options: {
                    livereload: true
                }
            },
            express: {
                files: [

                    '<%= yeoman.appFolder %>/**/*.css',
                    '<%= yeoman.appFolder %>/**/*.html',
                    '<%= yeoman.appFolder %>/**/*.js',
                    '<%= yeoman.appFolder %>/images/{,*//*}*.{png,jpg,jpeg,gif}',
                    '/*.{js,json}',
                    '/node_modules/warnerburg-common/*.{js,json}'
                ],
                tasks: ['express:dev', 'wait'],
                options: {
                    livereload: true,
                    nospawn: true // reload express
                }
            }
        }
    });

    grunt.registerTask('serve', function (target) {
        grunt.task.run([
            /*
            'clean:server',
            'env:all',
            'injector:sass',
            'concurrent:server',
            'injector',
            'wiredep',
            'autoprefixer',
            */
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