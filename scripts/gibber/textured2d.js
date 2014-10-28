module.exports = function( Gibber, Graphics, ctx ) {
  var canvas = ctx.canvas,
      tex = new THREE.Texture( canvas ),
      sprite 
      
  sprite = new Graphics.THREE.Mesh(
    new Graphics.THREE.PlaneGeometry( canvas.width, canvas.height, 1, 1),
    new Graphics.THREE.MeshBasicMaterial({
      map:tex,
      affectedByDistance:false,
      useScreenCoordinates:true
    })
  )
  
  sprite.position.x = sprite.position.y = sprite.position.z = 0
  tex.needsUpdate = true 
  
  //Graphics.scene.add( that.sprite )
}