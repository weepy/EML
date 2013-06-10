EML
===

EaselJS Markup Language


Show me the code
----------------
```
<stage id="stage" width="960" height="400">
  <container x=20>
    <circle id="c1" x=10 y=10 fill=green></circle>
    <circle id="c2" x=50 y=50 radius=10 fill=black></circle>
  </container>
  <label x=100 y=100 color=red scaleX=2 text=hello></label>

  <shape fill='#0f0' path='f (fill) mt 0 0 lt 30 0 lt 20 20 cp'></shape>

  <myshape x=50 y=20 stroke-width=2 rotation=120></myshape>

  <star x=20 y=20 sides=6></star>
</stage>

<script>

var stage = EML('#stage')
var $ = EML.query(stage)

$('label')
  .on('mousedown', function(event) {
    $(this).attr({color: 'blue'})

    event.on('mouseup', function() {
      $(this).attr({color: 'green'})        
    })
  })

</script>

```


Example
-------

Open example.html

Future
------

* use stage.$ 
  * as a proxy to the DOM that's shadowing the easeljs --- DONE
  * or build a simple index 

* remove jquery dependency