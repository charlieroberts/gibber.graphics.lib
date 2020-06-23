module.exports = function( Gibber, Graphics ) {
  "use strict"
  
  var $ = Gibber.dollar
  
  var ThreeD = function( container ) {    
    var that = $.extend( {}, {
      canvas : null,
      ctx : null,
      initialized :false,
      renderer: null,
      scene: null,
      camera: null,
      lights: [],
      running: false,
      shouldReadPixels: false,
      init : function() {
        this.container = Graphics.getContainer( container )
        
        if( this.initialized ) this.setSize( Graphics.width, Graphics.height )
        this.createRenderer()
        this.createScene()
        this.createLights()        
        
        if( !Graphics.running ) {
          Graphics.start()
        }
        
        this.show()
        this.initialized = true
        this.running = true
        
        Graphics.mode = '3d'
      },

      setSize: function( w, h ) {
        this.renderer.setSize( w, h );
        this.renderer.domElement.style.width = w + 'px'
        this.renderer.domElement.style.height = h + 'px'        
        
        this.createCameras()
      },
      pixels:null,
      _update : function() {        
        if( this.initialized && this.running ) {
          this.renderer.clear()

          if( Graphics.PostProcessing && Graphics.PostProcessing.fx.length ) {
            Graphics.PostProcessing.composer.render()
            var gl = this.renderer.getContext()
            if( this.shouldReadPixels ) {
              if( this.pixels === null ) this.pixels = new Uint8Array( this.renderer.domElement.width * this.renderer.domElement.height * 4);
              gl.readPixels( 0, 0, this.renderer.domElement.width, this.renderer.domElement.height, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels );
            }
          }else{
            this.renderer.render( this.scene, this.camera )
          }
        }
      },
      
      createRenderer: function() {
        if( this.renderer !== null ) return
        
        this.renderer = new Graphics.THREE.WebGLRenderer();
        
        if( ! this.initalized ) {
          if( this.container.append ) {
            this.container.append( this.renderer.domElement )
          }else{
            this.container.appendChild( this.renderer.domElement )
          }
        }
        
        this.canvas = this.renderer.domElement
        
        //Graphics.sizeCanvas( this.canvas )
      },
      
      createScene : function() {
        if( this.scene !== null ) return
    		this.scene = new Graphics.THREE.Scene();
      },
      
      createCameras: function() {
        if( this.camera === null ) {

    		  var VIEW_ANGLE = 45,
    		  	  ASPECT = Graphics.width / Graphics.height,
    		  	  NEAR = 0.1,
    		  	  FAR = 10000;
            
         	this.camera = new Graphics.THREE.PerspectiveCamera(
    		    VIEW_ANGLE,
    		    ASPECT,
    		    NEAR,
    		    FAR
    		  )
        
          this.scene.add( this.camera );
        }
        
        this.camera.updateProjectionMatrix();
        this.camera.position.z = 250;
        this.camera.lookAt( this.scene.position )
      },
      
      createLights: function() {
        if( this.lights.length > 1 ) return 
        
        this.ambientLight = new Graphics.THREE.AmbientLight(0xFFFFFF);

    		this.pointLight = new Graphics.THREE.PointLight( 0xFFFFFF )
    		this.pointLight.position.x = 100
    		this.pointLight.position.y = 100
    		this.pointLight.position.z = -130

    		this.pointLight2 = new Graphics.THREE.PointLight( 0x666666 )
    		this.pointLight2.position.x = 0
    		this.pointLight2.position.y = 0
    		this.pointLight2.position.z = 260

    		this.lights = [ this.pointLight, this.pointLight2 ]
        this.scene.add( this.pointLight );
        this.scene.add( this.pointLight2 );
        // this.scene.remove( this.ambientLight );
      },
      
      removeCameraAndLights: function() {
        this.scene.remove( this.camera )
        this.scene.remove( this.pointLight )
        this.scene.remove( this.pointLight2 )
        this.scene.add( this.ambientLight )
        this.camera = null
        this.lights.length = 0
      },
      
      remove : function() {
        this.hide()
        this.running = false
        this.removeCameraAndLights()
        for( var i = 0; i < this.scene.children.length; i++ ) {
          this.scene.remove( this.scene.children[ i ] )
        }
      },
      show: function() { that.canvas.style.display = 'block' },
      hide: function() { that.canvas.style.display = 'none'  },
    })      
        
    return that
  }
  
  return ThreeD
}
