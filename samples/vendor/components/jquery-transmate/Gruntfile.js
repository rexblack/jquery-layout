module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'), 
    clean: {
      tmp: ["tmp"], 
      dist: ["dist"]
    }, 
    wrap: {
      dist: {
        src: ['src/vendor/components/arian-css-matrix/CSSMatrix.js'],
        dest: 'tmp/js/CSSMatrix.js'
      }, 
      options: {
        wrapper: ["(function() { if (typeof CSSMatrix == 'undefined') { \nvar module = {};\n (function (module) {\n", "\n})(module); \nwindow.CSSMatrix = module.exports; }\n})();"]
      }
    },
    concat: {
      options: {
        stripBanners: false,
        banner: '/*!\n' + 
          ' * <%= pkg.name %> - v<%= pkg.version %> - \n' + 
          ' * build: <%= grunt.template.today("yyyy-mm-dd") %>\n' + 
          ' */\n\n',
      },
      dist: {
        src: [
          'tmp/js/CSSMatrix.js', 
          'src/js/jquery.fx.step-transform.js', 
          'src/js/jquery.fx.tweener-transitions.js', 
          'src/js/jquery.transmate.js', 
          'src/js/jquery.transmate-blocks.js', 
          'src/js/jquery.transmate-itemopts.js'
        ],
        dest: 'tmp/js/jquery.transmate.js',
      },
    }, 
    uglify: {
      options: {
        stripBanners: false
      },
      dist: {
        files: {
          'tmp/js/jquery.transmate.min.js': [ 'src/js/jquery.transmate.js']
        }
      }
    }, 
    copy: {
      build: {
        expand: true,
        cwd: 'tmp/js',
        src: ['jquery.transmate.min.js', 'jquery.transmate.js'], 
        dest: 'dist/js',
        flatten: true,
        filter: 'isFile'
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('default', ['clean:dist', 'wrap', 'concat', 'uglify', 'copy', 'clean:tmp']);
  
};