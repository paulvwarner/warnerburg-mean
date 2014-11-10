module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        yeoman: {
            // configurable paths
            client: 'app'
        },
        express: {
            options: {
                port: process.env.PORT || 9000
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
                url: 'http://localhost:<%= express.options.port %>'
            }
        },
        watch: {
            livereload: {
                files: [
                    '{.tmp,<%= yeoman.client %>}/**/*.css',
                    '{.tmp,<%= yeoman.client %>}/**/*.html',
                    '{.tmp,<%= yeoman.client %>}/**/*.js',
                    '!{.tmp,<%= yeoman.client %>}**/*.spec.js',
                    '!{.tmp,<%= yeoman.client %>}/**/*.mock.js',
                    '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                options: {
                    livereload: true
                }
            },
            express: {
                files: [
                    'server/**/*.{js,json}'
                ],
                tasks: ['express:dev', 'wait'],
                options: {
                    livereload: true,
                    nospawn: true //Without this option specified express won't be reloaded
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

    express:dev
};