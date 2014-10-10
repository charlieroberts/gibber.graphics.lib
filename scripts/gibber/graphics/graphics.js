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
  defaultContainer: 'body',
  THREE: require('../../external/three/three.min'),
  
  export: function( target ) {
    Graphics.Geometry.export( target )
    Graphics.modes['2d'].constructor.export( target )
    //target.Canvas = Graphics.modes['2d'].constructor
    Graphics.PostProcessing.export( target )
    Graphics.GibberShaders.export( target )
    target.Video = Graphics.Video
  },
  
  getContainer: function( _container ) {
    var container
    if( typeof _container === 'undefined' || _container === null ) {
      container = document.querySelector( Graphics.defaultContainer )
    }else{
      container = _container.element
    }
    
    return container
  },
  
  init : function( mode, container ) { 
    if( mode === '3d' && !window.WebGLRenderingContext ) {
      var msg = 'Your browser does not support WebGL.' + 
                '2D drawing will work, but 3D geometries and shaders are not supported.'
        
      Gibber.Environment.Message.post( msg )
    }
    
    this.mode = mode || '3d'

    if( this.modes[ this.mode ].canvas === null ) {
                                    //Graphics.modes['2d'].constructor()
      this.modes[ this.mode ].obj = this.modes[ this.mode ].constructor( container )
      // if( this.mode === '2d' ) {
      //   this.modes[ '2d' ].canvas = this.modes[ this.mode ].obj
      // }
    }
    
    if( this.modes[ this.mode ].obj.init ) { this.modes[ this.mode ].obj.init() }
    
    if( this.modes[ this.mode ].canvas !== null ) {
      this.canvas = this.modes[ this.mode ].canvas
    }else{
      this.canvas = this.modes[ this.mode ].canvas = this.modes[ this.mode ].obj.canvas
    }
    
    if( typeof container === 'undefined' || container === null ) {
      this.canvas.parent = document.querySelector( Graphics.defaultContainer )
    }else{
      this.canvas.parent = container.element
      //container.element.find( '.editor' ).remove()
    }
    
    this.sizeCanvas( this.canvas )
    this.assignWidthAndHeight( true )
    
    this.modes[ this.mode ].obj.setSize( this.width * this.resolution, this.height * this.resolution )

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

    var resize = function( props ) { // I hate Safari on 10.6 for not having bind...
      Graphics.width = props.w
      Graphics.height = props.h
      
      if( Graphics.modes['2d'].obj ) Graphics.modes['2d'].obj.setSize( props.w, props.h )
      if( Graphics.modes['3d'].obj ) Graphics.modes['3d'].obj.setSize( props.w, props.h )      
    }
    
    $.subscribe( '/layout/contentResize', resize ) // toggle fullscreen, or toggling console bar etc.
    // 
    $.subscribe( '/layout/resizeWindow', function( props ) {
      props.h -= $( 'thead' ).height() 
      props.h -= $( 'tfoot' ).height()
      
      resize( props )  
    })
    
    this.initialized = true   
  },
  
  sizeCanvas: function( canvas ) {
    var body = document.querySelector( 'body' ),
        appendedToBody = canvas.parent === body
        
    canvas.style.left = 0
    canvas.style.top = appendedToBody ? 0 : 32
    canvas.style.position = 'fixed'
    //canvas.style.position = canvas.parent === document ? 'fixed' : 'relative'
    canvas.style.float    = canvas.parent === document ? 'none' : 'left'
    canvas.style.overflow = 'hidden'
    canvas.style.display  = 'block'
    
    if( appendedToBody ) {
      body.style.margin = 0
    }
  },

  start : function() {
    this.running = true
		window.requestAnimationFrame( this.render );
  },
  
  useCanvasAsTexture: function( _canvas ) {
    var sprite = _canvas.createSprite()
    //_canvas.hide()
    
    if( !Graphics.initialized || Graphics.mode === '2d' ) {
      Graphics.init( '3d' )
    }
    //Graphics.use( '2d' )
    Graphics.modes['3d'].obj.scene.add( sprite )
    
    Graphics.modes['2d'].obj.setupCameraAndLights()
    
    Graphics.graph.push( _canvas )
  },
  
  clear : function() {
    if( this.running ) {
      for( var i = 0; i < this.graph.length; i++ ) {
        this.graph[ i ].remove( true )
      }

      this.graph.length = 0
            
      for( var modeName in this.modes ) {
        var mode = this.modes[ modeName ]
        if( mode.obj ) mode.obj.remove()
      }
      
      if( this.PostProcessing ) { 
        for( var j = this.PostProcessing.fx - 1; j >= 0; j-- ) {
          this.PostProcessing.fx[ j ].remove()
        }
        this.PostProcessing.fx.length = 0
        this.PostProcessing.isRunning = false
      }
      
      if( this.mode === '3d' ) {
        for( var i = 0; i < this.modes['3d'].obj.scene.children.length; i++ ) {
          var child = this.modes['3d'].obj.scene.children[ i ]
          this.modes['3d'].obj.scene.remove( child )
        }
      }
      
      // something in hear messes thigns up...
      //this.canvas.style.display = 'none'
      //this.canvas = null
      //this.ctx = null
      this.running = false
      //this.initialized = false
    }
  },
  render : function() {
    if( this.running ) {
  		for( var i = 0; i < this.graph.length; i++ ) {
  			this.graph[ i ]._update()
  			this.graph[ i ].update()
  		}
      
      this.modes[ this.mode ].obj._update()
      
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
    Graphics.height = Graphics.canvas.parent === window ? window.innerHeight : (Graphics.canvas.parent.offsetHeight || document.querySelector('.column').offsetHeight )//$( window ).height()
    
    if( document.querySelector( '#header' ) !== null && Graphics.canvas.parent === window ) {
      if( Gibber.Environment.Layout.fullScreenColumn === null) { 
        //Graphics.height -= $( "#header" ).height() + $( "tfoot" ).height()
      }
    }
    
    // console.log( Graphics.width, Graphics.height, Graphics.canvas.style.width, Graphics.canvas.style.height )
    Graphics.canvas.style.zIndex = - 1

    
    if( !isInitialSetting && Graphics.mode !== '2d' ) {
  		Graphics.renderer.setSize( Graphics.width * Graphics.resolution, Graphics.height * Graphics.resolution );
      Graphics.renderer.domElement.style.width = Graphics.width + 'px'
      Graphics.renderer.domElement.style.height = Graphics.height + 'px'      
      
      //$( this.renderer.domElement ).css({ width: this.width, height: this.height })
    }
  },
  
}

Graphics.render = Graphics.render.bind( Graphics )

module.exports = function( Gibber ) { 
  Graphics.modes = {
    '2d':{
      constructor: require( './2d' )( Gibber, Graphics ),
      canvas: null,
      obj: null,
    },
    '3d':{
      constructor: require( './3d' )( Gibber, Graphics ),
      canvas: null,
      obj: null
    }
  }
    
  Graphics.Geometry = require( './geometry' )( Gibber, Graphics, Graphics.THREE )
  
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
