var browserify = require( 'browserify' ),
    gulp = require( 'gulp' ),
    gutil = require('gulp-util'),  
    buffer = require( 'vinyl-buffer' ),
    uglify = require( 'gulp-uglify' ),
    rename = require( 'gulp-rename' ),
    watchify = require( 'watchify' ),
    insert = require( 'gulp-insert' ),
    source = require('vinyl-source-stream');

gulp.task( 'client', function(){
    var out = gulp.src( [ './scripts/gibber/graphics.lib.js' ] )
    .pipe( browserify({ 
      standalone:'Gibber', 
      bare:true, 
      ignore:[
        'gibber.graphics.lib/scripts/gibber/graphics/graphics',
        'gibber.interface.lib/scripts/gibber/interface/interface',
        'gibber.audio.lib/scripts/gibber/audio'
      ],
      noParse:[ require.resolve( './scripts/external/three/three.min.js' ) ]
    }) )
    .pipe( rename('gibber.graphics.lib.js') )
    .pipe( gulp.dest( './build/' ) )
    .pipe( buffer() )
    .pipe( uglify() )
    .pipe( rename('gibber.graphics.lib.min.js') )
    .pipe( gulp.dest('./build/') )
    
    return out
});

gulp.task('watch', function() {
  var bundler = watchify( browserify('./scripts/gibber/graphics.lib.js', { standalone:'Gibber', cache: {}, packageCache: {}, fullPaths: true } ) );

  // Optionally, you can apply transforms
  // and other configuration options on the
  // bundler just as you would with browserify
  //bundler.transform('brfs');

  bundler.on('update', rebundle);

  function rebundle() {
    console.log("recompiling... ", Date.now() )
    return bundler.bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe( source( 'bundle.js' ) )
      .pipe( rename( 'gibber.graphics.lib.js' ) )
      .pipe( gulp.dest( './build' ) )
//      .pipe( uglify() )
      .pipe( rename('gibber.graphics.lib.min.js') )
      .pipe( gulp.dest('./build/') )
  }

  return rebundle();
});

gulp.task( 'default', [ 'client' ] )
