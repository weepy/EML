(function()  {

var $ = window.jQuery


function trim(s) {
  return s.replace(/^\s+|\s+$/g, '')
}


function EML(x, stage) {
  var node = $(x)[0]
  var attr = {}  
  var a = node.attributes
  for(var i=0; i<a.length; i++) {
    var name = a[i].name
    var val = a[i].value
      
    // replace integer values
    var nval = parseFloat(val)
    if(!isNaN(nval)) val = nval

    // camelcase from hyphenated
    name = name.replace(/(-[a-z])/g, function(x) { return x.slice(1).toUpperCase() })


    // hack to rename scalex to scaleX
    if(name.length > 1)
      name = name.replace(/x$/,'X').replace(/y$/,'Y')
    if(val == 'true') 
      val=true
    else if(val =='false')
      val=false
    else if(val =='null')
      val=null
    
    attr[name] = val


  }
    

  attr.node = node

  var tag = node.tagName.toLowerCase()
  var klass = EML.objects[tag]

  if(!klass) console.log("no such class " + tag)


  if(stage) attr.stage = stage
  var obj = klass(attr)
  
  if(!stage) stage = obj
  

  $(node)
    .children().each(function() {
      var child = EML(this, stage)

      obj.addChild(child)
    })

  node.easel = obj
  return obj
}

EML.object = function(base, properties) {

  function object(o) {
    if(!(this instanceof object)) return new object(o)
    o && this.attr(o)

    this._init = base.prototype.initialize
    this.initialize && this.initialize(o)
    this.init && this.init(o)
  }

  if(base) {
    function ctor() {}
    ctor.prototype = base.prototype
    object.prototype = new ctor()
    object.prototype.constructor = base;
  }

  properties = properties || {}
  for(var key in properties)
    object.prototype[key] = properties[key]

  
  object.prototype.attr = function (o) {
    for(var key in o)
      this[key] = o[key]
    return this
  }

  object.extend = function(defaults) {
    defaults = defaults || {}
    var parent = this

    // copy of object constructor
    function obj(o) {
      if(!(this instanceof obj)) return new obj(o)
      o && this.attr(o)

      this._init = base.prototype.initialize
      this.initialize && this.initialize(o)
      this.init && this.init(o)
    }

    function ctor() {}
    ctor.prototype = parent.prototype
    obj.prototype = new ctor()
    obj.prototype.constructor = obj;
    
      
    for(var i in defaults) {
      obj.prototype[i] = defaults[i]
    }
    
    // obj.defaults = defaults
    obj.extend = parent.extend
    return obj
  }

  return object
}

EML.query = function(stage) {
  var root = stage.node

  return function(query) {
    var els = []

    if(query.node) query = query.node

    jQuery(root).find(query).each(function(key, val) {
      els.push(this.easel)
    })

    var el = els[0]

    els.attr = function(key, val) {
      
      // read
      if(typeof key == 'string') {
        return el && el[key]
      } else {
        // write object
        els.forEach(function(o, i) {
          o.attr(key)

          // render if we need to
          if(!('x' in key)&&!('y' in key)&&!('scaleX' in key)&&!('scaleY' in key))
            o.render()

          stage.dirty = true
          // update the node -- perhaps don't need to do this ?
          $(o.node).attr(key)
        })
        return this
      }
    }

    // els.text = function(x) {
    //   els.forEach(function(o) {
    //     o.render()
    //     stage.dirty = true

    //     //
    //     // o.node.innerHTML = x
    //   })
    //   return this
    // }

    els.on = function(name, fn) {
      els.forEach(function(o) {
        o.addEventListener(name, function(e) {
          e.on = function(name2, fn2) {
            e.addEventListener(name2, function(_e) {
              fn2.call(o, _e)
            })
          }
          fn.call(o, e)
        })
      })
      return this
    }

    return els
  }

}


EML.objects = {

  stage: function(o) {
    var canvas = $('<canvas>')
    canvas.insertAfter(o.node)
    o.node.style.display = 'none'
    
    canvas.attr( o )

    var stage = new createjs.Stage(canvas[0])

    stage.node = o.node
    stage.dirty = true
    
    EML.ontick(function(e) {
      if(stage.dirty) {
        stage.dirty = false
        stage.update()        
      }      
    })

    return stage
  },

  label: EML.object(createjs.Text, {
    font: '20px Arial',
    color: 'black',
    text: null,
    initialize: function() {
      
      this.render()
    },
    render: function() {
      this._init(this.text, this.font, this.color)
    }

  }),

  circle: EML.object(createjs.Shape, {
    radius: 100,
    x: 0, 
    y: 0,
    fill: 'black',
    
    initialize: function() {
      this._init()
      this.render()
    },

    render: function() {
      this.graphics
        .beginFill(this.fill)
        .drawCircle(this.x, this.y, this.radius)
    }
  }),

  container: EML.object(createjs.Container),

  // mt  moveTo  lt  lineTo
  // at  arcTo bt  bezierCurveTo
  // qt  quadraticCurveTo (also curveTo) r rect
  // cp  closePath c clear
  // f beginFill lf  beginLinearGradientFill
  // rf  beginRadialGradientFill bf  beginBitmapFill
  // ef  endFill ss  setStrokeStyle
  // s beginStroke ls  beginLinearGradientStroke
  // rs  beginRadialGradientStroke bs  beginBitmapStroke
  // es  endStroke dr  drawRect
  // rr  drawRoundRect rc  drawRoundRectComplex
  // dc  drawCircle  de  drawEllipse
  // dp  drawPolyStar  p
  
  star: EML.object(createjs.Shape, {
    radius: 20,
    sides: 5,
    pointy: 0,
    angle: 0,
    fill: '#000',
    stroke: '#000',
    initialize: function() {
      this._init()
      this.render()
    },
    render: function() {
      this.graphics
        .clear().beginFill(this.fill).drawPolyStar ( this.x, this.y, this.radius, this.sides, this.pointy, this.angle ) 
    }
  }),

  shape: EML.object(createjs.Shape, {
    radius: 100,
    x: 0, 
    y: 0,
    fill: 'black',

    initialize: function() {
      this._init()
      this.render()
      // this.graphics.beginFill(this.fill).drawCircle(this.x, this.y, this.radius)
    },

    render: function() {
      var segments = this.parsePath(this.path)

      var g = this.graphics
      g.clear()
      segments.forEach(function(args) {
        var method = args.shift()
        g[method].apply(g, args)
      })

    },

    parsePath: function(path) {
      
      var self = this
        , bits = trim(path).split(/[\s,]/g)
        , sections = []
        , cur

      for(var i in bits) {
        var bit = trim( bits[i] )

        // replace in brackets
        if(bit.match(/^\([^)]+\)$/)) {
          bit = eval("with(self) { " + bit + " }")
        }
        else {
          var fbit = parseFloat(bit)
            if( !isNaN(fbit) ) {
            bit = fbit
          }
          else {
            if(bit.match(/^[a-z]{1,2}$/)) {
              cur = []
              sections.push(cur)
            }
          }
        }

        cur.push(bit)
      }

      return sections
    }
  }),

  c: EML.object(createjs.Container, {
    initialize: function() {
      this._init()
    }
  })
}


var callbacks = []

createjs.Ticker.addEventListener("tick", function(event) {
  for(var i=0; i<callbacks.length;i++) {
    var x = callbacks[i]
    x[0].call(x[1], event)
  }
})


EML.ontick = function(fn, context) {
  callbacks.push([fn, context])
}


window.EML = EML
})()