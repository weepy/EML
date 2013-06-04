(function()  {

var $ = window.jQuery

function EML(x, parent) {
  var node = $(x)[0]
  var attr = {}  
  var a = node.attributes
  for(var i=0; i<a.length; i++) {
    var name = a[i].name
    var val = a[i].value
      
    // replace integer values
    var nval = parseFloat(val)
    if(!isNaN(nval)) val = nval

    // hack to rename scalex to scaleX
    if(name.length > 1)
      name = name.replace(/x$/,'X').replace(/y$/,'Y')
    attr[name] = val
  }
    

  attr.node = node

  var tag = node.tagName.toLowerCase()
  var klass = EML.classes[tag]

  if(!klass) console.log("no such class " + tag)

  var obj = klass(attr)
  
  if(parent)
    parent.addChild(obj)

  $(node)
    .children().each(function() {
      EML(this, obj)
    })

  node.easel = obj
  return obj
}

EML.object = function(base, x) {

  function object(o) {
    if(!(this instanceof object)) return new object(o)
    o && this.extend(o)

    base && base.prototype.initialize.call(this)
    this.initialize && this.initialize(o)
  }

  if(base) {
    function ctor() {}
    ctor.prototype = base.prototype
    object.prototype = new ctor()
    object.prototype.constructor = base;
  }

  for(var key in x)
    object.prototype[key] = x[key]

  
  object.prototype.extend = function (o) {
    for(var key in o)
      this[key] = o[key]
    return this
  }

  return object
}

EML.classes = {

  stage: function(o) {
    var canvas = $('<canvas>')
    canvas.insertAfter(o.node)
    o.node.style.display = 'none'
    
    canvas.attr( o )

    var stage = new createjs.Stage(canvas[0])

    stage.node = o.node

    stage.$ = function(x) {
      return $(stage.node).find(x).map(function() {
        return this.easel
      })
    }

    delete o.node
    return stage
  },

  text: EML.object(createjs.Container, {
    font: '20px Arial',
    color: 'black',
    initialize: function() {
      this.text = new createjs.Text(this.node.innerHTML, this.font, this.color);
      this.addChild(this.text)
    }
  }),

  circle: EML.object(createjs.Shape, {
    radius: 100,
    x: 0, 
    y: 0,
    fill: 'black',
    initialize: function() {
      this.graphics.beginFill(this.fill).drawCircle(this.x, this.y, this.radius)
    }
  }),

  container: EML.object(createjs.Container),
  c: EML.object(createjs.Container)
}


window.EML = EML
})()