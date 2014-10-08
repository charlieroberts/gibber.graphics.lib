module.exports = function( Gibber, Graphics) {
  
  var ThreeD = function( container ) {    
    var that = $.extend( {}, {
      canvas : null,
      ctx : null, //_canvas.getContext( '3d' ),
      init : function() {
        this.container = Graphics.getContainer( container )
        
        this.createRenderer()
        this.createScene()
        this.createLights()        
        
        if( !Graphics.running ) {
          Graphics.start()
        }
      },
      
      setSize: function( w, h ) {
        this.renderer.setSize( w, h );
        this.renderer.domElement.style.width = w + 'px'
        this.renderer.domElement.style.height = h + 'px'        
        
        this.createCameras()
      },
      
      _update : function() {
        this.renderer.clear()

        if( Graphics.PostProcessing && Graphics.PostProcessing.fx.length ) {
          Graphics.PostProcessing.composer.render()
        }else{
          this.renderer.render( this.scene, this.camera )
        }
      },
      
      createRenderer: function() {
        this.renderer = new Graphics.THREE.WebGLRenderer();
    
        if( this.container.append ) {
          this.container.append( this.renderer.domElement )
        }else{
          this.container.appendChild( this.renderer.domElement )
        }
        
        console.log( "RENDERER", this.renderer.domElement )
        this.canvas = this.renderer.domElement
        
        Graphics.sizeCanvas( this.canvas )
      },
      
      createScene : function() {
    		this.scene = new Graphics.THREE.Scene();
      },
      
      createCameras: function() {
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
        this.camera.updateProjectionMatrix();
        
        this.camera.position.z = 250;
        this.camera.lookAt( this.scene.position )
      },
      
      createLights: function() {
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
      
      remove : function() {
        that.hide()
        
        if( canvas.remove ) {
          canvas.remove()
        }else{
          container.removeChild( canvas )
        }

      },
      show: function() { canvas.style.display = 'block' },
      hide: function() { canvas.style.display = 'none'  },
    })      
        
    return that
  }
  
  return ThreeD
}