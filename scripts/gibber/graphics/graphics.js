!function() {

"use strict"

var $ = require('../dollar'),

Graphics = {
  Color: require( 'color' ),
  canvas :  null,
  canvas2D: null,
  canvas3D: null,
  ctx:      null,
  width:    0,
  height:   0,
  running:  false,
  resolution: 1,
  fps: null,
  graph: [],
  initialized: false,
  THREE: require('../../external/three/three.min'),
  
  export: function( target ) {
    Graphics.Geometry.export( target )
    Graphics.TwoD.export( target )
    Graphics.PostProcessing.export( target )
    Graphics.GibberShaders.export( target )
    target.Video = Graphics.Video
  },
  
  init : function( mode, container, noThree ) {
    console.log("INIT", mode, noThree )
    //if( this.initialized ) return 
    // this.canvas = document.createElement('div')
    
    if( typeof noThree !== 'undefined' ) { 
      this.noThree = noThree
    }else{
      if( mode === '2d' ) {
        this.noThree = true
      }else{
        this.noThree = false
      }
    }
    
    if( !noThree ) {
      if(!window.WebGLRenderingContext) {
        this.noThree = true
      }
    }
    
    this.mode = mode || '3d'
    console.log("MODE", this.mode)
    if( this.mode === '3d' && this.canvas3D !== null ) {
      this.canvas = this.canvas3D
    }else if( this.mode === '2d' && this.canvas2D !== null ) {
      this.canvas = this.canvas2D
    }else{
      console.log( 'CREATING GRAPHICS DIV' )
      this.canvas = document.createElement('div')
    }
    
    if( this.noThree !== noThree ) {
      //Gibber.Environment.Message.post( 'Your browser does not support WebGL. 2D drawing will work, but 3D geometries and shaders are not supported.' )
    }
    
    if( typeof container === 'undefined' || container === null ) {
      this.canvas.parent = window
    }else{
      this.canvas.parent = container.element
      container.element.find( '.editor' ).remove()
    }

    this.assignWidthAndHeight( true )
    
    this.canvas.style.left = 0
    this.canvas.style.top = 0
    this.canvas.style.position = this.canvas.parent === window ? 'fixed' : 'absolute'
    this.canvas.style.float    = this.canvas.parent === window ? 'none' : 'left'
    this.canvas.style.overflow = 'hidden'
    this.canvas.style.display  = 'block'
    
    this.canvas.setAttribute( 'id', 'three' )
    
    if( this.canvas.parent === window ) { 
      document.querySelector('body').appendChild( this.canvas )
    }else{
      if( container.element.length ) {
        container.element.append( this.canvas )
      }else{
        container.element.appendChild( this.canvas )
      }
    }
    
    this.render = this.render.bind( this )
    
    //console.log( this.mode )
    if( this.mode === '2d' ) this.noThree = true
    
    if( !this.noThree ) {
      try{
        console.log( 'creating scene....')
        this.createScene( this.mode )
      }catch(e) {
        console.log(e)
        this.noThree = true
        console.log( 'Your browser supports WebGL but does not have it enabled. 2D drawing will work, but 3D geometries and shaders will not function until you turn it on.' )
        //Gibber.Environment.Message.post( 'Your browser supports WebGL but does not have it enabled. 2D drawing will work, but 3D geometries and shaders will not function until you turn it on.' )
      }finally{
        if( this.noThree ) {
          this.canvas2D = this.canvas
        }else{
          this.canvas3D = this.canvas
        }
      }
    }else{
      this.canvas2D = this.canvas
    }
    
    var res = this.resolution, self = this
    Object.defineProperty(this, 'resolution', {
      get: function() { return res; },
      set: function(v) { res = v; self.assignWidthAndHeight() }
    });

    var running = false
    Object.defineProperty(this, 'running', {
      get: function() { return running },
      set: function(v) {
        if( v !== running ) {
          if( running === true ) { // switching to false, clear screen
            self.render()
            running = v
          }else{ // switching to true, restart animation timer
            running = v
            self.render()
          }
        }
      }
    });
    this.start()

    var resize = function( e, props ) { // I hate Safari on 10.6 for not having bind...
      Graphics.width = props.w
      Graphics.height = props.h
      
      Graphics.canvas.css({
        top: props.offset,
        width: Graphics.width,
        height: Graphics.height,
        zIndex: -1
      })

  		Graphics.renderer.setSize( Graphics.width * Graphics.resolution, Graphics.height * Graphics.resolution );
      $( Graphics.renderer.domElement ).css({ width: Graphics.width, height: Graphics.height })
    }
    
    $.subscribe( '/layout/contentResize', resize ) // toggle fullscreen, or toggling console bar etc.
    
    $.subscribe( '/layout/resizeWindow', function( e, props) {
      props.h -= $( 'thead' ).height() 
      props.h -= $( 'tfoot' ).height()
      
      resize( null, props )  
    })
    
    this.initialized = true   
  },
  
  createScene : function( mode ) {		
    this.renderer = new Graphics.THREE.WebGLRenderer();
    
    //console.log( "THREE", $('#three') )
    var _3 = $('#three')
    
    if( _3.append ) {
      _3.append( this.renderer.domElement )
    }else{
      _3.appendChild( this.renderer.domElement )
    }
    
    this.assignWidthAndHeight()
		this.scene = new Graphics.THREE.Scene();
		// must wait until scene and renderer are created to initialize effect composer

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
    this.use( mode ); // creates camera and adds lights	
	
    this.camera.updateProjectionMatrix();
    if( this.mode === '3d' ) {
      this.camera.position.z = 250;
      this.camera.lookAt( this.scene.position );
    }
  },
  
  start : function() {
    this.running = true
		window.requestAnimationFrame( this.render );
  },
  
  use : function( mode ) {
    var _3 = $('#three')
    
    if( _3.show ) {
      $( '#three' ).show()      
    }else{
      $( '#three' ).style.display = 'block'
    }

    if( mode === '2d' ) {
      console.log("Now drawing in 2d.")
      if( this.mode === '3d' ) {
        this.scene.remove( this.camera )
        this.scene.remove( this.pointLight )
        this.scene.remove( this.pointLight2 )
        this.scene.add( this.ambientLight )
      }

      this.camera = new Graphics.THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1.00000001 );
      this.camera.position.z = 1
      this.resolution = .5
      this.renderer.setSize( this.width, this.height )

      this.mode = '2d'
    }else{
      console.log("Now drawing in 3d.")
      if( this.mode === '2d' ) {
        Graphics.canvas2d.hide()
        if( this.scene ) this.scene.remove( this.camera )
      }
		  var VIEW_ANGLE = 45,
		  	  ASPECT = this.width / this.height,
		  	  NEAR = 0.1,
		  	  FAR = 10000;

     	this.camera = new Graphics.THREE.PerspectiveCamera(
		    VIEW_ANGLE,
		    ASPECT,
		    NEAR,
		    FAR
		  )
      
      if( !this.scene ) this.scene = new Graphics.THREE.Scene();
      
      this.scene.add( this.camera );
      this.camera.updateProjectionMatrix();
      this.scene.add( this.pointLight );
      this.scene.add( this.pointLight2 );
      this.scene.remove( this.ambientLight );

      this.camera.position.z = 250;
      this.camera.lookAt( this.scene.position )

      this.mode = '3d'
    }
  }, 
  clear : function() {
    if( this.running ) {
      for( var i = 0; i < this.graph.length; i++ ) {
        this.graph[ i ].remove( true )
      }

      this.graph.length = 0
      if( this.PostProcessing ) this.PostProcessing.fx.length = 0
      if( !this.noThree ) {
        for( var j = this.PostProcessing.fx - 1; j >= 0; j-- ) {
          this.PostProcessing.fx[ j ].remove()
        }
      }
      
      this.PostProcessing.fx.length = 0
      this.PostProcessing.isRunning = false
      
      // something in hear messes thigns up...
      this.canvas.style.display = 'none'
      //this.canvas = null
      //this.ctx = null
      this.running = false
      this.initialized = false
    }
  },
  render : function() {
    if( this.running ) {
  		for( var i = 0; i < this.graph.length; i++ ) {
  			this.graph[i]._update();
  			this.graph[i].update();
  		}
      
      if( !this.noThree ) {
    		this.renderer.clear()
      
        if( this.PostProcessing && this.PostProcessing.fx.length ) {
          this.PostProcessing.composer.render()
        }else{
          this.renderer.render( this.scene, this.camera )
        }

    		if( this.stats ) this.stats.update()
      }
      
      if( this.fps === null || this.fps >= 55 ) {
        window.requestAnimationFrame( this.render )
      }else{
        setTimeout( function() { Graphics.render() }, 1000 / this.fps )
      }
    }
  },
  
  test : function() {
    var cube = new Graphics.THREE.CubeGeometry( 50, 50, 50 ),
        fill = new Graphics.THREE.Color( 0x000000 ).setRGB( .5, 0, 0 ),
        mat  = new Graphics.THREE.MeshPhongMaterial( { color: fill, shading: Graphics.THREE.FlatShading, shininess: 50 } ),
        geo  = new Graphics.THREE.Mesh( cube, mat );
				
    this.scene.add( geo )
    this.graph.push( geo )
    
    return geo
  },
  
	showStats : function() {
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		this.stats.domElement.style.right = '0px';			
		$( 'body' ).append( this.stats.domElement );	
	},
  
  assignWidthAndHeight : function( isInitialSetting ) { // don't run final lines before renderer is setup...
    Graphics.width  = Graphics.canvas.parent === window ? window.innerWidth  : (Graphics.canvas.parent.offsetWidth || Graphics.canvas.parent.width() ) //$( this.canvas.parent ).width() // either column or window... 
    Graphics.height = Graphics.canvas.parent === window ? window.innerHeight : (Graphics.canvas.parent.offsetHeight || Graphics.canvas.parent.height() )//$( window ).height()
    if( document.querySelector( '#header' ) !== null && Graphics.canvas.parent === window ) {
      if( Gibber.Environment.Layout.fullScreenColumn === null) { 
        Graphics.height -= $( "#header" ).height() + $( "tfoot" ).height()
      }
    }
    
    if( Graphics.canvas.parent === window ) {
      Graphics.canvas.style.top = document.querySelector( '#header' ) !== null ? document.querySelector( '#header' ).offsetHeight : 0
    }else{
      var ch = Graphics.canvas.parent.find( '.columnHeader' ).outerHeight()
      Graphics.canvas.style.top = ch
      Graphics.height -= ch
      
      Graphics.width -= Graphics.canvas.parent.find( '.resizeHandle' ).outerWidth()
    }
    Graphics.canvas.style.width = Graphics.width + 'px'
    Graphics.canvas.style.height = Graphics.height + 'px'
    Graphics.canvas.style.zIndex = - 1
    
    // this.canvas.css({
//       top: $( '#header' ).height(),
//       width: this.width,
//       height: this.height,
//       zIndex: -1
//     })
    
    if( !isInitialSetting && Graphics.mode !== '2d' ) {
  		Graphics.renderer.setSize( Graphics.width * Graphics.resolution, Graphics.height * Graphics.resolution );
      Graphics.renderer.domElement.style.width = Graphics.width + 'px'
      Graphics.renderer.domElement.style.height = Graphics.height + 'px'      
      
      //$( this.renderer.domElement ).css({ width: this.width, height: this.height })
    }
  },
  
}

module.exports = function( Gibber ) { 
  Graphics.Geometry = require( './geometry' )( Gibber, Graphics, Graphics.THREE )
  Graphics.TwoD = require( './2d' )( Gibber, Graphics )
  
  require( '../../external/three/postprocessing/EffectComposer' )
  require( '../../external/three/postprocessing/RenderPass' )
  require( '../../external/three/postprocessing/MaskPass' )
  require( '../../external/three/postprocessing/ShaderPass' )
  require( '../../external/three/postprocessing/CopyShader' )
  require( '../../external/three/postprocessing/shaders/DotScreenShader' )
  require( '../../external/three/postprocessing/DotScreenPass' )
  require( '../../external/three/postprocessing/FilmPass' )
  require( '../../external/three/postprocessing/shaders/FilmShader' )
  require( '../../external/three/postprocessing/shaders/KaleidoShader' )
  require( '../../external/three/postprocessing/shaders/EdgeShader' )
  require( '../../external/three/postprocessing/shaders/FocusShader' )
  require( '../../external/three/postprocessing/shaders/ShaderGodRays' )
  require( '../../external/three/postprocessing/shaders/BleachBypassShader' )
  require( '../../external/three/postprocessing/shaders/ColorifyShader' )
  
  Graphics.PostProcessing = require( './postprocessing' )( Gibber, Graphics )
  Graphics.PostProcessing.init()
  Graphics.Shaders = require( './shader' )( Gibber, Graphics )
  Graphics.GibberShaders = require( './gibber_shaders' )( Gibber, Graphics )
  Graphics.Video = require( './video' )( Gibber, Graphics )
    
  return Graphics; 
}

}()
