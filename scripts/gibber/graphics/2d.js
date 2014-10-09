module.exports = function( Gibber, Graphics ) {
  "use strict"
  var $ = require('../dollar')
  
  var _that, cnvs
  
  var TwoD = function( container ) { 
    return _that 
  }
  TwoD.export = function( target ) {
    target.Canvas = _that.Canvas
  }
  
  _that = {
    initialized: false,
    canvasObject:null,
    canvas:null,
    container:null,
    _update : function() {
      if( this.initialized ) {
        if( this.canvasObject ) {
          this.canvasObject._update()
        }
      }
    },
    remove: function() {
      if( this.canvasObject ) {
        this.canvasObject.remove()
      }
    },
    init: function( container ) {
      this.container = Graphics.getContainer( container )
      this.initialized = true
      
      if( this.canvasObject === null ) {
        this.canvasObject = _that._Canvas( container )
        this.canvas = this.canvasObject.canvas
        
        if( this.container.append ) {
          this.container.append( this.canvas )
        }else{
          this.container.appendChild( this.canvas )
        }
      }

      if( !Graphics.running ) {
        Graphics.start()
      }
    },
    setSize: function( w, h ) {
      this.canvasObject.setSize( w,h )
    },
    Canvas : function( container ) {
      //if( !this.initialized ) this.init( container )
      if( Graphics.mode === '3d' ) {
        Graphics.modes['3d'].obj.remove()
      }
      
      if( !_that.intialized ) Graphics.init( '2d', container )
      
      _that.canvasObject.show()
      
      return _that.canvasObject
    }.bind( _that ),
    _Canvas : function( container ) { 
      var canvas = document.createElement( 'canvas' ),//$( 'canvas' ),
         ctx = canvas.getContext( '2d' ),
         that = ctx,
         three = null;
      
      $.extend( that, {
        top: 0,
        bottom: canvas.height,
        left:0,
        right:canvas.width,
        center: { x: canvas.width / 2, y : canvas.height / 2 },
        init: function() {
          //Graphics.graph.push( this )
    
          if( !Graphics.running ) Graphics.start()
        },
        setSize: function( w, h ) {
          this.width = this.right = w
          this.height = this.bottom = h
          
          this.center.x = this.width / 2
          this.center.y = this.height / 2          

          this.canvas.style.width = w + 'px'
          this.canvas.style.height = h + 'px'
    
          this.canvas.width  = this.width  * Graphics.resolution
          this.canvas.height = this.height * Graphics.resolution
          
          //Graphics.sizeCanvas( this.canvas )
                    
        },
        canvas: canvas,
        is3D: Graphics.mode === '3d',
        texture:  { needsUpdate: function() {} },//tex || { needsUpdate: function() {} }, 
        remove : function() {
          that.hide()
          
          that.draw = function() {}
          Graphics.modes['2d'].canvas = null
        },
        show: function() {
          canvas.style.display = 'block'
        },
        hide: function() {
          canvas.style.display = 'none'
        },
        shouldClear: false,
        _fill : that.fill,
        _stroke : that.stroke,
        _rotate : that.rotate,
        rotate : function( amt ) {
          this.translate( this.center.x, this.center.y )
          this._rotate( amt )
          this.translate( -this.center.x, -this.center.y )  
        },
        fill : function( color ) {
          if( typeof color !== 'undefined' ) {
            if( ! isNaN( color ) ) {
              color = 'rgb(' + color + ',' + color + ',' + color + ')'
            }
            this.fillStyle = color
          }
          this._fill() 
          this.texture.needsUpdate = true
          return this
        },
        fade: function( amt, color ) {
          var store = this.alpha
  
          this.fillStyle = typeof color === 'undefined' ? 'black' : color
          this.alpha = amt
          this.fillRect( 0,0,this.width,this.height )
          this.alpha = store
        },
        stroke: function( color, lineWidth ) {
          if( typeof color !== 'undefined' ) {
            if( ! isNaN( color ) ) {
              color = 'rgb(' + color + ',' + color + ',' + color + ')'
            }
            this.strokeStyle = color
          }
          if( typeof lineWidth !== 'undefined' ) {
            this.lineWidth = lineWidth
          }
          this._stroke()
          this.texture.needsUpdate = true
          return this
        },
        _update: function() {
          if( this.shouldClear ) this.clear()
          this.save()
          for( var i = 0; i < this.graph.length; i++ ) {
            var shape = this.graph[ i ]
            shape._update()
            if( shape.update ) shape.update()
            shape.draw()
          }
          this.draw()
          this.restore()
        },
        draw : function() {},
        clear: function() {
          this.clearRect( 0,0,this.right,this.bottom )
    
          this.texture.needsUpdate = true
          return this
        },
        line : function( x1,y1, x2,y2 ) {
          this.beginPath()
            this.moveTo( x1, y1 )
            this.lineTo( x2, y2 )
          this.closePath()
          return this
        },
        circle : function( x,y,radius ) {
          if( radius > 0 ) {
            this.save()
    
            this.translate(x,y)
            this.beginPath()
              this.arc( 0,0, radius, 0, Math.PI * 2)
            this.closePath()
    
            this.restore()
          }
          return this
        },
        square : function( x,y,size ) {
          this.beginPath()
            this.moveTo( x,y )
            this.lineTo( x + size, y )
            this.lineTo( x + size, y + size )
            this.lineTo( x, y + size )
            this.lineTo( x,y )
          this.closePath()
          return this
        },
        rectangle : function( x,y,width,height ) {
          this.beginPath()
            this.moveTo( x,y )
            this.lineTo( x + width, y )
            this.lineTo( x + width, y + height )
            this.lineTo( x, y + height )
            this.lineTo( x,y )
          this.closePath()
          return this
        },
        shapes: {
          Shape : function() {
            var sqr = {
              ctx: that,
              stroke: null,
              fill: 'gray',
              mods:[],
              _update: function() {
        				for( var i = 0; i < this.mods.length; i++ ) {
        					var mod = this.mods[ i ],
                      val,
                      prop,
                      upper,
                      newVal

                  val  = this[ mod.name ]()
                  upper = mod.name.toUpperCase()
  
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
                  this[ mod.name ]( newVal )
                }
              },
              remove: function() {
                that.graph.splice( that.graph.indexOf( this ), 1 )
              },
              changeZ : function( v ) {
                z  = v
              },
        			mod : function( _name, _modulator, _type, _mult ) {
        				this.mods.push({ name:_name, modulator:_modulator, type:_type || "+", mult: _mult || 1 })

                return this
        			},

              removeMod : function( name ) {
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
            }
  
            that.shouldClear = true
  
            var x = 0,
                y = 0,
                width = height = .2,
                z = that.graph.length;

            Object.defineProperties( sqr, {
              'x': { 
                configurable: true,
                get: function() { return x },
                set: function(v) { x = v; }
              },
              'y': {
                configurable: true, 
                get: function() { return y },
                set: function(v) { y = v; }
              },
              'z': { 
                get: function() { return z },
                set: function(v) { 
                  that.reorderGraph() 
                  that.graph.splice( that.graph.indexOf( this ),1 )
                  that.graph.splice( v, 0, this )
                  z = v
                }
              },
            })
            
            var zeroToOne = { min:0, max:1, timescale:'graphics', output:Gibber.LINEAR },
                mappings = {
                  x: that.zeroToOne,
                  y: that.zeroToOne,
                }

            Gibber.createProxyProperties( sqr, mappings )
  
            that.graph.push( sqr )
  
            return sqr
          },
          Rectangle : function() {
            var rect = that.shapes.Shape(),
                mappings = {
                  width: that.zeroToOne,
                  height: that.zeroToOne
                }
    
            rect.draw = function() {
              that.rectangle( Math.floor(this.x() * that.width), Math.floor(this.y() * that.height), Math.floor(this.width() * that.width), Math.floor(this.height() * that.height) )
              if( this.stroke ) that.stroke( this.stroke )
              if( this.fill   ) that.fill( this.fill )
            }
    
            var width = height = .2
            Object.defineProperties( rect, {
              'width': {
                configurable: true,
                get: function() { return width },
                set: function(v) { width = v; }
              },
              'height': {
                configurable: true,
                get: function() { return height },
                set: function(v) { height = v; }
              },
            })

            Gibber.createProxyProperties( rect, mappings )
    
            if( typeof arguments[0] === 'object' ) $.extend( rect, arguments[0] )
    
            return rect
          },
  
          Polygon: function() {
            var shape = that.shapes.Shape(),
                mappings = {
                  radius: that.zeroToOne,
                  sides: { min:3, max:20, output:Gibber.LINEAR, timescale:'graphics' }
                }
    
            shape.draw = function() {
              that.polygon( Math.floor(this.x() * that.width), Math.floor(this.y() * that.height), Math.floor(this.radius() * that.width), this.sides() )
              if( this.stroke ) that.stroke( this.stroke )
              if( this.fill   ) that.fill( this.fill )
            }
    
            var radius = .2, sides = 5
            Object.defineProperties( shape, {
              'radius': {
                configurable: true,
                get: function() { return radius },
                set: function(v) { radius = v; }
              },
              'sides': {
                configurable: true,
                get: function() { return sides },
                set: function(v) { sides = v; }
              },
            })

            Gibber.createProxyProperties( shape, mappings )
    
            if( typeof arguments[0] === 'object' ) $.extend( shape, arguments[0] )
    
            // console.log( 'SHAPE', shape, shape.draw )
            return shape
          }
        },
        zeroToOne: { min:0, max:1, timescale:'graphics', output:Gibber.LINEAR },
        reorderGraph : function() {
          if( z > v ) {
             for( var i = v; i < that.graph.length; i++ ){ 
               that.graph[i].changeZ( that.graph[i].z + 1 )
             }
          }
        },
        graph : [],
        update: function() { this.texture.needsUpdate = true; return this },
        polygon: function( x,y,radius,sides ) {
          var ca  = 360 / sides
  
          for( var i = 1; i <= sides; i++ ) {
            var angle = ca * i,
                radians = Math.PI * 2 * ( angle / 360 ),
                _x = Math.round( Math.sin( radians ) * radius ) + x,
                _y = Math.round( Math.cos( radians ) * radius ) + y
    
            if( i === 1 ) {
              this.beginPath()
              this.moveTo( _x, _y )
            }else{
              this.lineTo( _x, _y )
            }
          }
          var angle = ca,
              radians = Math.PI * 2 * ( angle / 360 ),
              _x = Math.round( Math.sin( radians ) * radius ) + x,
              _y = Math.round( Math.cos( radians ) * radius ) + y   
  
          this.lineTo( _x, _y )
          this.closePath()
          return this
        },
        randomColor : function() {
          return "#" + Math.random().toString(16).slice(2, 8)
        },
        width:canvas.width,
        height:canvas.height,
        sprite : null,
        createSprite: function() {
          that.texture = new Graphics.THREE.Texture( canvas ),
            
          that.sprite = new Graphics.THREE.Mesh(
            new Graphics.THREE.PlaneGeometry( canvas.width, canvas.height, 1, 1),
            new Graphics.THREE.MeshBasicMaterial({
              map:that.texture,
              affectedByDistance:false,
              useScreenCoordinates:true
            })
          )

          that.sprite.position.x = that.sprite.position.y = that.sprite.position.z = 0
          that.texture.needsUpdate = true 
  
          return that.sprite
        }
        // hide: function() {
        //   if( Graphics.scene ) Graphics.scene.remove( that.sprite )
        //   Graphics.graph.splice( that, 1 )
        // },
        // show : function() {
        //   Graphics.scene.add( that.sprite )
        //   Graphics.graph.push( that )
        // }
      })

      cnvs = that

      Object.defineProperties( that, {
        fps: {
          get: function() { return Graphics.fps !== null ? Graphics.fps : 60 },
          set: function(v) { Graphics.fps = v },
        },
        alpha: {
          get : function() { return this.globalAlpha },
          set : function(v) { this.globalAlpha = v }
        }
      })

      return that
    }
  }

  // window.Canvas = TwoD.Canvas
  // window.Rectangle = function() {
  //   var args = Array.prototype.slice.call( arguments, 0 )
  //   
  //   if( !Graphics.canvas2d ) TwoD.Canvas()
  //   
  //   return Graphics.canvas2d.shapes[ 'Rectangle' ].apply( null, args )
  // }
  // 
  // window.Polygon = function() {
  //   var args = Array.prototype.slice.call( arguments, 0 )
  //   
  //   if( !Graphics.canvas2d ) TwoD.Canvas()
  //   
  //   return Graphics.canvas2d.shapes[ 'Polygon' ].apply( null, args )
  // }
  
  return TwoD
}