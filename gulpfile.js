const { src, dest } = require('gulp');

// This task copies the icon files to the dist directory
function buildIcons() {
  return src('./nodes/**/*.svg')
    .pipe(dest('./dist/nodes/'));
}

// Export the tasks
exports.build = buildIcons;
exports['build:icons'] = buildIcons;