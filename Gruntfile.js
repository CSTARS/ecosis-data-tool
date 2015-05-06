/*jshint camelcase: false*/

module.exports = function (grunt) {
  'use strict';

  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-vulcanize');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // configurable paths
  /*var config = {
    app: 'app',
    dist: 'dist',
    distMac32: 'dist/MacOS32',
    distMac64: 'dist/MacOS64',
    distLinux32: 'dist/Linux32',
    distLinux64: 'dist/Linux64',
    distWin: 'dist/Win',
    tmp: 'buildTmp',
    resources: 'resources'
  };*/

  grunt.initConfig({
      //config: config,
      nodewebkit: {
        options: {
            version : 'v0.12.0',
            platforms: ['win','osx','linux'],
            buildDir: './webkitbuilds', // Where the build version of my node-webkit app is saved
        },
        src: ['./dist/**/*'] // Your node-webkit app
      },

    // Project settings
        yeoman: {
            // Configurable paths
            app: 'app',
            dist: 'dist',
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        //'<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{gif,jpeg,jpg,png,webp}',
                        //'<%= yeoman.dist %>/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>',
                verbose : true
            },
            html: '<%= yeoman.app %>/index.html'
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/index.html']
            //,css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        'scripts/{,*/}*.*',
                        'lib/{,*/}*.*',
                        'index.html',
                        'package.json',
                        'schema.json',
                    ]
                },{
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/font-awesome/',
                    dest: '<%= yeoman.dist %>',
                    src: ['fonts/{,*/}*.*']
                },
                {
                    expand: true,
                    dot: true,
                    cwd: 'node_modules',
                    dest: '<%= yeoman.dist %>/node_modules',
                    src: [
                        'archiver/**/*',
                        'async/**/*',
                        'csv/**/*',
                        'csv-parse/**/*',
                        'csv-stringify/**/*',
                        'fast-csv/**/*',
                        'md5/**/*',
                        'adm-zip/**/*',
                        'jszip/**/*',
                        'node-uuid/**/*',
                        'request/**/*',
                        'rimraf/**/*',
                        'xlsjs/**/*',
                        'xlsx/**/*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        vulcanize: {
            default : {
                options: {
                    inline : true
                },
                files : {
                    '<%= yeoman.dist %>/elements.html': ['<%= yeoman.app %>/elements.html']
                }
            }
        },


        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: [
                //'compass:server',
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                //'compass',
                'copy:styles',
                'imagemin',
                'svgmin'
            ]
        },

        shell: {
            // the vulconizer imports all the custom elements everything we need
            // usemin compresses the css and js, makeing the components lib
            // unnecessary except the polymer script, only need to move over the font-awesome fontes
            'clear-bower-components' : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'mv <%= yeoman.dist %>/components/font-awesome/fonts <%= yeoman.dist %>/ && '+
                         'rm -rf <%= yeoman.dist %>/components && '+
                         'rm -rf <%= yeoman.dist %>/elements'

            },
            zipClean : {
              options: {
                  stdout: true,
                  stderr: true
              },
              command: 'cd webkitbuilds/EcoSISDataTool && rm -rf *.zip'
            },
            zipWin : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'cd webkitbuilds/EcoSISDataTool && zip -q -r win64{.zip,} && '+
                         'zip -q -r win32{.zip,}'
            },
            zipOSX : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'cd webkitbuilds/EcoSISDataTool && zip -q -r osx64{.zip,} && '+
                         'zip -q -r osx32{.zip,}'
            },
            zipLinux : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'cd webkitbuilds/EcoSISDataTool && zip -q -r linux64{.zip,} && '+
                         'zip -q -r linux32{.zip,}'
            },

            run : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node_modules/nw/bin/nw app/'
            },
            'run-schema' : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node_modules/nw/bin/nw app/schema'
            },
            'run-ms' : {
                options: {
                    stdout: true,
                    stderr: true
                },
                command: '.\\node_modules\\nodewebkit\\nodewebkit\\nw.exe app'
            },
            expand : {
                dir : '',
                prmname : '',
                options: {
                    stdout: true,
                    stderr: true
                },
                command: 'node scripts/expand.js <%= shell.expand.dir %> <%= shell.expand.prmname %>'
            }
        }
    });

    grunt.task.registerTask('expand', 'Given a repo dir and prmname, expand a node', function() {
        grunt.config.set('shell.expand.dir', grunt.option('dir'));
        grunt.config.set('shell.expand.prmname', grunt.option('prmname'));

        grunt.task.run('shell:expand');
    });

    grunt.registerTask('run', 'Run node webkit app based on OS', function() {
        var tasks = grunt.config('shell');
        console.log(process.platform);
        if (/win32/.test(process.platform) ) {
            grunt.task.run('shell:run-ms');
        } else {
            grunt.task.run('shell:run');
        }
    });
/*
  grunt.registerTask('run',[
    'shell:run'
  ]);
*/
  grunt.registerTask('build',[
    'clean:dist',
    'copy:dist',
    'useminPrepare',
    'concat:generated',
    'cssmin:generated',
    'uglify:generated',
    'usemin',
    'vulcanize',
    'nodewebkit'
  ]);

  grunt.registerTask('zip',[
    'shell:zipClean',
    'shell:zipWin',
    'shell:zipOSX',
    'shell:zipLinux'
  ]);


};
