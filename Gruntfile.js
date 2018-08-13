module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    babel: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "temp/mcomponent.js": "src/component.js"
        }
      }
    },
    transpile: {
      main: {
        type: "amd",
        imports: {},
        files: [
          {
            src: ["./temp/**/*.js"],
            dest: "./dist/",
            ext: ".amd.js"
          }
        ]
      }
    }
  });
  // Load the plugin
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-es6-module-transpiler");
  grunt.registerTask("default", ["babel", "transpile"]);
};
