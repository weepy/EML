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
  <text x=100 y=100 color=red scaleX=2>hello</text>
</stage>


<script>
  var stage = EML( '#stage' )
  
  stage.$('container')[0].x = 10
  stage.update()
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