/*
a = Video()

b = Cube({ texture: a, scale:3 }).spin(.001)

c = Dots({ scale:.25 })

c.update = function() {
  this.angle += .0005
}

c.scale.seq( Rndf(0,.35), 1/8 )

f = Film()
f.sCount = 8

Graphics.resolution = 1

a.stop()
*/

module.exports = function( Gibber, Graphics ) {
  'use strict';
  
  var _videoElement, 
      _videoTexture = null, 
      video, 
      
  Video = function() {
    if( _videoTexture !== null ) { return _videoTexture }
    
    if( typeof _videoElement === 'undefined' ) {
      video = document.createElement('video');
      video.width    = 320;
      video.height   = 240;
      video.autoplay = true;
    }
    
    if( _videoTexture === null ) {
      navigator.webkitGetUserMedia(
        { video:true, audio:false }, 
        function(stream){ 
          video.stream = stream;
          video.src = webkitURL.createObjectURL( stream ); 
        }, 
        function( error ){ console.log( 'Failed to get a stream due to', error ); }
      ); 
      
      _videoTexture = new Graphics.THREE.Texture( video )
      _videoTexture.video = video
      
      _videoTexture.remove = function() {
        Graphics.graph.splice( Graphics.graph.indexOf( _videoTexture ), 1 )
        _videoTexture = null
        video.stream.stop()
      }
      
      _videoTexture.stop = function() {
        Graphics.graph.splice( Graphics.graph.indexOf( _videoTexture ), 1 ) 
        _videoTexture = null
        video.stream.stop()
      }
      
      _videoTexture.update = function() {}
      _videoTexture._update = function() {
        if( video.readyState === video.HAVE_ENOUGH_DATA ){
          _videoTexture.needsUpdate = true;
      	}
      }
      
      Graphics.graph.push( _videoTexture )
    }
    
    return _videoTexture
  }
  
  return Video 
}