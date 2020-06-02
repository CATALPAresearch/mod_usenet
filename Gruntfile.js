/**
 * Gruntfile for compiling theme_shoelace .less files.
 *
 * This file configures tasks to be run by Grunt
 * http://gruntjs.com/ for the current theme.
 *
 *
 * Requirements:
 * -------------
 * nodejs, npm, grunt-cli.
 *
 * Installation:
 * -------------
 * node and npm: instructions at http://nodejs.org/
 *
 * grunt-cli: `[sudo] npm install -g grunt-cli`
 *
 * node dependencies: run `npm install` in the root directory.
 *
 *
 * Usage:
 * ------
 * Call tasks from the theme root directory. Default behaviour
 * (calling only `grunt`) is to run the watch task detailed below.
 *
 *
 * Porcelain tasks:
 * ----------------
 * The nice user interface intended for everyday use. Provide a
 * high level of automation and convenience for specific use-cases.
 *
 * grunt amd     Create the Asynchronous Module Definition JavaScript files.  See: MDL-49046.
 *               Done here as core Gruntfile.js currently *nix only.
 
 * Plumbing tasks & targets:
 * -------------------------
 * Lower level tasks encapsulating a specific piece of functionality
 * but usually only useful when called in combination with another.
 *
 * grunt replace             Run all text replace tasks.
 *
 * @package theme
 * @subpackage shoelace
 * @author Niels Seidel niels.seidel@fernuni-hagen.de
 * @license MIT
 */

module.exports = function (grunt) { // jshint ignore:line

    // Import modules.
    var path = require('path');
    var moodleroot = path.dirname(path.dirname(__dirname)); // jshint ignore:line
    console.log(moodleroot);


    grunt.initConfig({
        ts: {
            amd: {
                //tsconfig: moodleroot + '/format/ladtopics/amd/src/tsconfig.json',
                src: ["amd/src/*.ts", "!node_modules/**"]
            }
        },
        jshint: {
            options: { jshintrc: './.jshintrc' },
            files: ['./amd/src/*.js']
        },
        terser: {
            lib: {
                options: {
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    src: ['*.js', '!*.min.js'],
                    dest: 'lib/build',
                    cwd: './lib/src',
                    rename: function (dst, src) {
                        return dst + '/' + src.replace('.js', '.min.js');
                    }
                }]
            },
            amd: {
                options: {
                    sourceMap: true,
                },
                files: [{
                    expand: true,
                    src: ['*.js', '!*.min.js'],
                    dest: 'amd/build',
                    cwd: './amd/src',
                    rename: function (dst, src) {
                        return dst + '/' + src.replace('.js', '.min.js');
                    }
                }]
            }
        }
    });

    // Load core tasks.
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-terser');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask("build-plugin", ["terser"]);
    grunt.registerTask("check", ["jshint"]);
};
