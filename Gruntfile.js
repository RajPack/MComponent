module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  var babel = require("rollup-plugin-babel");
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    rollup: {
      options: {
        plugins: [
          babel({
            exclude: "./node_modules/**"
          })
        ],
        output: {
          format: "iife"
        }
      },
      files: {
        dest: "dist/mcomponent.js",
        src: "src/component.js"
      }
    },
    clean: ["./dist/"]
  });
  // Load the plugin
  // grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-rollup");
  grunt.registerTask("default", ["clean", "rollup"]);
};
