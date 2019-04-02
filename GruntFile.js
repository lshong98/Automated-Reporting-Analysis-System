module.exports = function(grunt) {
    grunt.iniConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            myFiles: ['server.js']
        },
        nodemon: {
            script: 'server.js'
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.registerTask('default', ['jshint', 'nodemon']);
};