module.exports = function( Gibber, Graphics, THREE ){ 

"use strict"

var $ = Gibber.dollar

var parametricFunc = function() {
  var points = rndf(-50,50,3)
  
  return { x:points[0], y:points[1], z:points[2] }
}

var types = [
  [ 'Vec2', 'Vector2', 'vec2' ],
  [ 'Vec3', 'Vector3', 'vec3' ],
  [ 'Vec4', 'Vector4', 'vec4' ],    
]
.forEach( function( element, index, array ) {
  var type = element[ 0 ],
    threeType = element[ 1 ] || element[ 0 ],
    shaderType = element[ 2 ] || 'f'
  
  // TODO: de-globalize this
  window[ type ] = function() {
    var args = Array.prototype.slice.call( arguments, 0 ),
        obj
    
    if( Array.isArray( args[0] ) ) {
      var _args = []
      for( var i = 0; i < args[0].length; i++ ) {
        _args[ i ] = args[0][ i ]
      }
      args = _args
    }    
        
    obj = Gibber.construct( THREE[ threeType ], args )
    
    obj.name = type
    obj.shaderType = shaderType
    
    return obj
  }
})

var types = {
      Cube:  { width:50, height:50, depth:50 },
      Sphere: { radius:50, segments:16, rings: 16 },
      Tetrahedron: { radius:50, detail: 0 },
      Octahedron: { radius:50, detail: 0 },
      Icosahedron: { radius:50, detail: 0 },
      Cylinder: { radiusTop:20, radiusBottom:20, height:100, radiusSegments:8, heightSegments:1, openEnded:false},
      Parametric: { func: parametricFunc, slices:8, stacks:8 },
      
      Torus:  { radius:50, tube:10, radialSegments:8, tubularSegments:8, arc:Math.PI * 2 },
      TorusKnot: { radius: 50, tube:5, radialSegments:64, tubularSegments: 8, p:5, q:3, heightScale:1 },
      Plane: { width:150, height:150  , segmentsWidth:1, segmentsHeight:1 },
    },
    vectors = [ 'rotation', 'scale', 'position' ],
    processArgs = function( args, type, shape ) {
     var _args = Gibber.processArguments( args, type ),
         out
  
     if( typeof args[0] === 'object' ) {
       out = []
       for( var argsKey in shape ) {
         var pushValue = typeof args[0][ argsKey ] !== 'undefined' ? args[0][ argsKey ] : shape[ argsKey ]
         out.push( pushValue )
       }
       for( var arg in args[ 0 ] ) {
         if( ! shape[arg] ) {
           out[ arg ] = args[ 0 ][ arg ]
         }
       }
     }else if( Array.isArray( args )){
       out = args
     }else{
       out = []
       for( var argsKey in shape ) {
         out.push( shape[ argsKey ] )
       }
     }
  
     return out
   },
   mappingProperties = {
     rotation: {
       min: 0, max: Math.PI * 2,
       output: Gibber.LINEAR,
       wrap: true,       
       timescale: 'graphics',
     },
     scale: {
       min: 0, max: 2,
       output: Gibber.LINEAR,
       wrap: false,
       timescale: 'graphics',
     },
     position: {
       min: -100, max: 100,
       output: Gibber.LINEAR,
       wrap: false,
       timescale: 'graphics',
     }
   }

var Geometry = {
  export: function( target ) {
    $.extend( target, Geometry )
  }
}

for( var key in types) {

  (function() {
    var type = key,
        shape = types[ key ]
    var constructor = function() {
      if( Graphics.modes['3d'].obj === null ) { //|| Graphics.canvas !== Graphics.canvas3D ){
        Graphics.init( '3d', null )
      }else{
        Graphics.modes['3d'].obj.init()
        Graphics.modes['3d'].obj.show()
        Graphics.mode = '3d'
      }/*else if( Graphics.mode === '2d' ) {
        Graphics.init('3d', null, false)
        //Graphics.use( '3d' )
      }else{
        //Graphics.canvas3D.style.display = 'block'
      }*/
      
      Graphics.running = true 

      var args = processArgs( arguments, type, shape )

      this.name = type
      
      if( args.color && $.isArray( args.color) ) { 
        var v = args.color
        args.color = Color().rgb( v[0] * 255, v[1] * 255, v[2] * 255 ).hexString()
      }
      this.color =    new THREE.Color( args.color ) || new THREE.Color(0xffffff)
      
      var hasShader = typeof arguments[0] !== 'undefined' && arguments[0].shader
      
      if( !hasShader) {
        if( !args.texture ) {
          this.material = new THREE.MeshPhongMaterial( { color: this.color, shading: THREE.FlatShading, shininess: 50 } )
        }else{
          this.material = new THREE.MeshBasicMaterial({ map: args.texture, affectedByDistance:false, useScreenCoordinates:true })
        }
      }else{
        this.material = new THREE.ShaderMaterial( arguments[0].shader.material || arguments[0].shader );
        if( arguments[0].shader.material ) arguments[0].shader.target = this
      }
      
      this.geometry = Gibber.construct( THREE[ type + "Geometry" ], args )
      
      this.mesh = new THREE.Mesh( this.geometry, this.material )

      this.spinX = this.spinY = this.spinZ = 0
    
      this.mappingProperties = mappingProperties
      this.mappingObjects = []
      
      var ltrs = { x:'X', y:'Y', z:'Z' }
      for( var i = 0; i < vectors.length; i++ ) { 
        
        (function( obj ) { // for each vector rotation, scale, position
          var propertyName = vectors[ i ],
              propertyObject = propertyName === 'scale' ? Vec3(1, 1, 1) : Vec3(),
              update = function() { 
                obj.mesh[ propertyName ].set( propertyObject.x, propertyObject.y, propertyObject.z )
              },
              x = propertyObject.x, y = propertyObject.y, z = propertyObject.z

          propertyObject.name = type + '.' + propertyName
          propertyObject.seq  = obj.seq
          
          Object.defineProperty( obj, propertyName, {
            configurable:true,
            get: function() { return propertyObject },
            set: function( v ) {
              switch( $.type( v ) ) {
                case 'object' :
                  if(typeof v.x === 'number') propertyObject.x = v.x
                  if(typeof v.y === 'number') propertyObject.y = v.y
                  if(typeof v.z === 'number') propertyObject.z = v.z
                break;
                case 'array' :
                  if(typeof v[0] === 'number') propertyObject.x = v[ 0 ]
                  if(typeof v[1] === 'number') propertyObject.y = v[ 1 ]
                  if(typeof v[2] === 'number') propertyObject.z = v[ 2 ]
                  break;
                case 'number' :
                  propertyObject.x = propertyObject.y = propertyObject.z = v
                  break;
              }
              update()
              
              return propertyObject
            }
          })
          
          //obj[ propertyName ] = propertyObject
          
          Gibber.defineProperty( obj, propertyName, true, true, mappingProperties[ propertyName ], true, false, true )

          Object.defineProperties( obj[ propertyName ], {
            x: { get: function() { return propertyObject.x }, set: function(v) { propertyObject.x = v; update() }, configurable:true },
            y: { get: function() { return propertyObject.y }, set: function(v) { propertyObject.y = v; update() }, configurable:true },
            z: { get: function() { return propertyObject.z }, set: function(v) { propertyObject.z = v; update() }, configurable:true },
          })

          for(var _ltr in ltrs) {
            !function() {
              var l = _ltr
              
              Gibber.defineProperty( obj[ propertyName ], _ltr, true, true, mappingProperties[ propertyName ], true )
              // Gibber.defineProperty( propertyObject, _ltr, true, true, mappingProperties[ propertyName ], true )
            
              obj[ propertyName ][ l ].modObject = obj
              obj[ propertyName ][ l ].modName = propertyName + '.' + l
              // propertyObject[ l ].modObject = obj
              // propertyObject[ l ].modName = propertyName + '.' + l
              
              
              // avoid removing multimodal mapping by directly changing property object value
              obj[ propertyName ][ l ].set = function( v ) { propertyObject[ l ] = v; update() }
              // propertyObject[ l ].set = function( v ) { propertyObject[ l ] = v; update() }
            }()
          }
        })( this )
        
      }
      
      this.update = function() {}
          
			this._update = function() {
				for( var i = 0; i < this.mods.length; i++ ) {
					var mod = this.mods[ i ],
              val,
              prop,
              upper,
              newVal
          
          if( mod.name.indexOf( '.' ) > -1 ) {
            var parts = mod.name.split( '.' )
            val  = this[ parts[ 0 ] ][ parts[ 1 ] ]()
            upper = parts[ 1 ].toUpperCase()
            
  					switch( mod.type ) {
  						case "+":
  							newVal = typeof mod.modulator === "number" ?  val + mod.modulator * mod.mult : val + mod.modulator.getValue() * mod.mult
  							break
  						case "++":
  							newVal += typeof mod.modulator === "number" ? val + Math.abs( mod.modulator * mod.mult) : val + Math.abs( mod.modulator.getValue() * mod.mult )
  							break							
  						case "-" :
  							newVal = typeof mod.modulator === "number" ? val - mod.modulator * mod.mult : val - mod.modulator.getValue() * mod.mult
  							break
  						case "=":
  							newVal = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.getValue() * mod.mult
  							break
  						default:
  						break;	
  					}
            
            this[ parts[ 0 ] ][ parts[1] ].set( newVal )
            
          }else{
            var modValue = typeof mod.modulator === "number" ? mod.modulator : mod.modulator.getValue()
            
  					switch(mod.type) {
  						case "+":
                this[ mod.name ].x += modValue * mod.mult
                this[ mod.name ].y += modValue * mod.mult
                this[ mod.name ].z += modValue * mod.mult

  							break
  						case "++":
                this[ mod.name ].x += Math.abs( modValue * mod.mult )
                this[ mod.name ].y += Math.abs( modValue * mod.mult )
                this[ mod.name ].z += Math.abs( modValue * mod.mult )

  							break							
  						case "-" :
                this[ mod.name ].x -= modValue * mod.mult 
                this[ mod.name ].y -= modValue * mod.mult 
                this[ mod.name ].z -= modValue * mod.mult

  							break
  						case "=":
                this[ mod.name ].x = modValue * mod.mult 
                this[ mod.name ].y = modValue * mod.mult 
                this[ mod.name ].z = modValue * mod.mult                

  							break
  						default:
  						break;	
  					}
          }
				}
			}
      
			this.mods = []
      
      this.remove = this.kill = function(shouldNotRemove) {
        Graphics.modes['3d'].obj.scene.remove( this.mesh )
        if( !shouldNotRemove )
          Graphics.graph.splice( Graphics.graph.indexOf( this ), 1 )
          
        return this
      }
      
      this.replaceWith = function( newObj ) { this._ }
      
			this.mod = function( _name, _modulator, _type, _mult ) {
				this.mods.push({ name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 })
        
        return this
			}
      
      this.removeMod = function( name ) {
        if( name ) {
          for( var i = this.mods.length - 1; i >= 0; i-- ) {
            var m = this.mods[ i ]
            if( m.name === name ) {
              this.mods.splice( i, 1 )
              //break
            }
          }
        }else{
          this.mods = []
        }
      }
      
      this.ramp = function( prop, from, to, time ) {
        if( arguments.length === 3 ) {
          time = to
          to = from
          from = this[ prop ]
        }        
      }
      
      this.spin = function( x,y,z ) {
        if( arguments.length === 1 ) {
          if( x !== 0 ) {
            this.mod('rotation', x )
          }else{
            this.removeMod('rotation', 0 )
            this.removeMod('rotation.x', 0 )
            this.removeMod('rotation.y', 0 )
            this.removeMod('rotation.z', 0 )
          }
        }else if( arguments.length === 0){
          this.removeMod( 'rotation' )
        }else{
          if( x !== 0 ) {
            this.mod( 'rotation.x', x )
          }else{
            this.removeMod( 'rotation.x' )
          }
          if( y !== 0 ) {
            this.mod( 'rotation.y', y )
          }else{
            this.removeMod( 'rotation.y' )
          }
          if( z !== 0 ) {
            this.mod( 'rotation.z', z )
          }else{
            this.removeMod( 'rotation.z' )
          }
        }
        return this
      }
      
      if( arguments[0] ) {
        if( arguments[0].scale ) this.scale = arguments[0].scale
        if( arguments[0].rotation ) this.scale = arguments[0].rotation
        if( arguments[0].position ) this.scale = arguments[0].position
      }
                
      Graphics.modes[ '3d' ].obj.scene.add( this.mesh )
      Graphics.graph.push( this )
      
      this.mappings = []
      
      Object.defineProperty( this, '_', {
        get: function() { 
          if( this.seq.isRunning ) this.seq.disconnect()  
      
          for( var i = 0; i < this.mappings.length; i++ ) {
            this.mappings[ i ].remove() 
          }
      
          if( this.clearMarks ) // check required for modulators
            this.clearMarks()
            
          this.remove(); 
          console.log( type + ' is removed.' ) 
        },
        set: function() {}
      })
      
      Object.defineProperty( this, 'color', {
        get: function() { return this.material.color },
        set: function(v) {
          if( $.isArray( v ) ) {
            v = Color().rgb( v[0] * 255, v[1] * 255, v[2] * 255 ).hexString()
          }

          this.material.color.set( v )          
        }
      })
      
      this.toString = function() { return this.name }
      
      console.log( type + ' is created.' )
    } 

    Geometry[ type ] = function() { // wrap so no new keyword is required
      return Gibber.construct( constructor, arguments )
    }

  })()
}

//$.extend( window, Gibber.Graphics.Geometry )

//window.Knot = window.TorusKnot
//delete window.TorusKnot 

Geometry.Knot = Geometry.TorusKnot

return Geometry; 

}
