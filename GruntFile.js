module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            myFiles: ['server.js']
        },
        nodemon: {
            script: 'server.js'
        },
        watch: {
            js: {
                files: [
                    '!./node_modules/**',
                    '！./variable.js'
                ],
                tasks: ['default'],
                options: {
                    spawn: true,
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['jshint', 'nodemon']);
};