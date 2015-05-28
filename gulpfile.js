var gulp =       require('gulp');
var gutil =      require('gulp-util');
var uglify =     require('gulp-uglify');
var jshint =     require('gulp-jshint');
var webpack =    require('gulp-webpack');
var rename =     require('gulp-rename');
var coffee =     require('gulp-coffee');
var concat =     require('gulp-concat');
var header =     require('gulp-header');
var git =        require('gulp-git');
var runSeq =     require('run-sequence');
var fs =         require('fs');
var exec =       require('child_process').exec;

var config = {
  chains: ['silver', 'common'],
  tasks: [ 'clone-ds', 'copy-ds'],
  tasksClone: [],
  tasksCopy: [],
  branch: 'master'
};

// get the current branch name
gulp.task('current-branch', function(cb) {
  return git.exec({ args: 'branch' }, function(err, stdout) {
    if (err) throw err;
    config.branch = stdout.replace('* ', '').replace(/\s*$/gi, '');
    cb();
  });
});

function createCopyTask(chain) {
  var srcFile = 'git_components/ds-' + chain + '/asset/' + chain + '/**';
  var destFile = 'asset/' + chain;
  if (chain == 'common')
  {
    srcFile = 'git_components/ds-' + chain + '/asset/**';
    destFile = 'asset';
  }
  
  // create copy tasks
  gulp.task('copy-ds-' + chain, function() {
    return gulp.src(srcFile,
      { base: srcFile.replace('/**', ''), env: process.env })
      .pipe(gulp.dest(destFile));
  });

  config.tasksCopy.push('copy-ds-' + chain);
}

function createChainTask(chain) {
  // create clone tasks
  gulp.task('clone-ds-' + chain, function(cb) {
    if (!fs.existsSync('./git_components/ds-' + chain )) {
      var arg = 'clone -b ' + config.branch + ' https://github.com/gsn/ds-' + chain + '.git git_components/ds-' + chain;
      // console.log(arg)
      return git.exec({args:arg }, function (err, stdout) {
        if (err) throw err;
        createCopyTask(chain);
        cb();
      })
    }
    else {
      var arg = 'git pull origin ' + config.branch;
      exec(arg, { cwd: process.cwd() + '/git_components/ds-' + chain },
          function (error, stdout, stderr) {
            if (stdout.indexOf('up-to-date') < 0 || !fs.existsSync('./asset/' + chain)) {
              createCopyTask(chain);
            }
            cb();
        });
    }
  });
  config.tasksClone.push('clone-ds-' + chain);
}

// build task off current branch name
for(var c in config.chains) {
  var chain = config.chains[c];
  createChainTask(chain);
};

gulp.task('build-copy', function(cb){
  if (config.tasksCopy.length > 0)
    runSeq(config.tasksCopy, cb);
  else cb();
});

gulp.task('build-src', function(){
  return gulp.src('./src/**')
    .pipe(gulp.dest('./asset/280'));
});

// run tasks in sequential order
gulp.task('default', function(cb) {
  runSeq('current-branch', config.tasksClone, 'build-copy', 'build-src', 'build-core', cb);
});

gulp.task('build-core', function() {
  return gulp.src(["./src/gsn.js",
    "./src/module.js",
    "./src/directives/ctrlBody.js",
    "./src/directives/ctrlHome.js",
    "./src/directives/facebook.js",
    "./src/directives/gsnCarousel.js",
    "./src/directives/gsnFeatured.js",
    "./src/directives/gsnModal.js",
    "./src/directives/gsnPartial.js",
    "./src/directives/gsnPathPixel.js",
    "./src/directives/gsnShoppingList.js",
    "./src/directives/gsnSpinner.js",
    "./src/directives/gsnSticky.js",
    "./src/directives/gsnStoreInfo.js",
    "./src/directives/gsnWatchHead.js",
    "./src/directives/ngGiveHead.js",
    "./src/directives/placeholder.js",
    "./src/filters/pagingFilter.js",
    "./src/filters/range.js",
    "./src/filters/removeAspx.js",
    "./src/filters/trustedHtml.js",
    "./src/services/gsnAdvertising.js",
    "./src/services/gsnDfp.js",
    "./src/services/gsnGlobal.js",
    "./src/services/gsnList.js",
    "./src/services/gsnMiscServices.js",
    "./src/services/gsnPrinter.js",
    "./src/services/gsnProfile.js",
    "./src/services/gsnStorage.js",
    "./src/services/gsnStore.js",
    "./src/services/gsnYoutech.js"])
  .pipe(concat('gsncore.refactor.js'))
  .pipe(gulp.dest('./src/'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.js', ['build-core']);
});