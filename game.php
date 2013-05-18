<html>
  <head>
    <title>Space Shooter 2012</title>
    <link href="style.css" rel="stylesheet" type="text/css">
    <link href='http://fonts.googleapis.com/css?family=Michroma|Orbitron' rel='stylesheet' type='text/css'>
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
    <script type="text/javascript" src="js/render.js"></script>
    <script type="text/javascript" src="js/script.js"></script>
    <script>
      <?php  
        if (!empty($_GET['name'])){
          $username=$_GET['name'];
        }
      ?>
    </script>
  </head>
  <body>
    <h1>Light Speed</h1>
    <div id="canvasCenter"><canvas width="1024" height="768" id="canvas"></canvas><div id="overlay"></div></div>   
    <audio autoplay="autoplay" loop>  
      <source src="sound/bg.wav" />   
    </audio>
  </body>
</html>