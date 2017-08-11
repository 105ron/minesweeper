const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

gulp.task('styles', function() {
  gulp.src('build/styles.css')
  .pipe(autoprefixer())
  .pipe(gulp.dest('stylesheets'))
  .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: ''
    },
    browser: ["google chrome", "firefox"]
  })
})

gulp.task('watch', ['browserSync'], function() {
  gulp.watch('build/styles.css', ['styles']);
  gulp.watch('index.html', browserSync.reload);
  gulp.watch('scripts/minesweeper.js', browserSync.reload);
})
