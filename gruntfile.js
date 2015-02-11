module.exports = function(grunt) {
  grunt.initConfig ({

    /**
     * Import project information
     */
    pkg: grunt.file.readJSON('package.json'),

    /**
     * Project details
     */
    project: {
      js: [
        'src/jquery.eye.js'
      ]
    },

    /**
     * Set project banner
     */
    tag: {
      banner: '/*!\n' +
      ' * <%= pkg.name %>\n' +
      ' * <%= pkg.title %>\n' +
      ' * @author <%= pkg.author %>\n' +
      ' * @version <%= pkg.version %>\n' +
      ' * @license <%= pkg.license %>\n' +
      ' */\n'
    },

    /**
     * Minify frontend JavaScript
     */
    uglify: {
      eye: {
        options: {
          banner: '<%= tag.banner %>',
          mangle: true,
          beautify: {
            width: 80,
            beautify: false
          }
        },
        files: {
          'dist/jquery.eye.min.js': ['src/jquery.eye.js']
        }
      }
    },

    /**
     * Watch for file changes and respond
     */
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: [
          'src/*.js'
        ],
        options: {
          spawn: false
        },
        tasks: ['uglify']
      }
    }
  });

  /**
   * Load grunt plugins
   */
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  /**
   * Default task
   * Run `grunt` on the command line
   */
  grunt.registerTask('default', [
    'uglify',
    'watch'
  ]);
};
