const bgdir = "res/bg/";

var config = {
  type: Phaser.CANVAS,
  width: 1024,
  height: 512,
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 2200 },
        debug: false
    }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

const move_speed = 8;

var game = new Phaser.Game(config);
var platforms,player;
var bg,floor;
var sun;


var enemies = [];
var removed_enemies = [];

var beers = [];
var removed_beers = [];

var score = 0;
var scoreText;

var scene;

var ocool_timer = 0;
var ocool = false;

function preload ()
{
  this.load.audio('fart', 'res/fart.ogg');
  this.load.audio('vafan', 'res/vafan.ogg');
  this.load.audio('burp', 'res/burp.ogg');

  this.load.image('sun', 'res/sun.png');

  this.load.image('platform', 'res/ground.png');
  this.load.image('floor', 'res/floor.png');

  this.load.image('bg', 'res/temp-bg.png');
  this.load.image('enemy', 'res/enemy.png');
  this.load.image('beer', 'res/beer.png');

  this.load.spritesheet('player', 
  'res/player.png',
  { frameWidth: 50, frameHeight: 75 }
  );

  
}






function create ()
{
  scene = this;
  //bg1 = this.add.sprite(512, 256, 'bg');
  //bg2 = this.add.sprite(-512, 256, 'bg');

  //bgs.append(this.add.sprite(0, 0, 'rocks_1'));
  //bgs.append(this.add.sprite(-1920, 0, 'rocks_1'));




  bg = this.add.tileSprite(512,256,1024,512,'bg');
  floor = this.add.tileSprite(512,512-63,1024,126,'floor');

  this.time.addEvent({
      delay: 280,
      callback: createEnemyUpdate,
      loop: true
  });

  this.time.addEvent({
    delay: 200,
    callback: createBeerUpdate,
    loop: true
  });

  platforms = this.physics.add.staticGroup();
  platforms.create(1024/2, 512-127/2, 'platform').refreshBody();


  player = this.physics.add.sprite(50, 75, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  this.physics.add.collider(player, platforms);

  sun = this.add.sprite(130, 130, 'sun');
  sun.x = 1500;

  this.anims.create({
    key: 'normal',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
    frameRate: 8,
    repeat: -1
  });

  scoreText = this.add.text(16, 16, 'Drägg: 0', { fontSize: '32px', fill: '#000' });
}




function update ()
{

  sun.x -= 2;
  
  if(sun.x < -200)
    sun.x = 1500;

  var cursors = this.input.keyboard.createCursorKeys();
  bg.tilePositionX += move_speed/2;
  floor.tilePositionX += move_speed;
  
  for(var i = 0; i < enemies.length; i++){
    var enemy = enemies[i];
    enemy.x -= move_speed;
    if(enemy.x < 0){
      removed_enemies.push([i,enemy]);

    }
  }
  for(var i = 0; i < removed_enemies.length; i++){
    console.log("removed");
    enemies.splice(removed_enemies[i][0],1);
    removed_enemies[i][1].destroy();
  }
  removed_enemies = [];


  for(var i = 0; i < beers.length; i++){
    var beer = beers[i];
    beer.x -= move_speed;
    if(beer.x < 0){
      removed_beers.push([i,beer]);

    }
  }
  for(var i = 0; i < removed_beers.length; i++){
    console.log("removed");
    beers.splice(removed_beers[i][0],1);
    removed_beers[i][1].destroy();
  }
  removed_beers = [];

 
  if (cursors.up.isDown && player.body.touching.down && player.y >= 347)
  {
      player.setVelocityY(-730);
      scene.sound.play("fart");
  }
  player.anims.play('normal', true);


}


function collide_enemy(player,enemy){

  enemy.disableBody(true, true);
  scene.sound.play("vafan");

  score = 0;
  scoreText.setText('Drägg: ' + score);

  ocool = true;
  ocool_timer = 0;

  for(var i = 0; i < enemies.length; i++){
    enemies[i].destroy();
  }
  for(var i = 0; i < beers.length; i++){
    beers[i].destroy();
  }
  enemies = [];
  beers = [];
}

function collide_beer(player,beer){
  beer.disableBody(true, true);
  scene.sound.play("burp");

  score++;
  scoreText.setText('Drägg: ' + score);

  beer.destroy();
  beers.splice(beers.indexOf(beer), 1);

}

var enemy_counter = 0;
var enemy_counter_max = 3;
function createEnemyUpdate() {
  enemy_counter++;
  if(enemy_counter >= enemy_counter_max){
    enemy_counter_max = Math.floor(Math.random() * 4)+2;

    var enemy = scene.physics.add.sprite(40, 65, 'enemy');
    enemy.setBounce(0);
    enemy.body.allowGravity  = false;
    enemy.x = 1000;
    enemy.y = 350;

    scene.physics.add.overlap(player, enemy, collide_enemy, null, this);

    enemies.push(enemy);
    enemy_counter = 0;
  }
}

var beer_dir_timer = 0;
var beer_y = 350;
function createBeerUpdate() {
    beer_dir_timer++;
    if(beer_dir_timer > 5){
      beer_dir_timer = 0;
      if(Math.round(Math.random()) == 0){
        beer_y = 350;
      }else{
        beer_y = 250;
      }
    }
    var beer = scene.physics.add.sprite(30, 54, 'beer');
    beer.setBounce(0);
    beer.body.allowGravity  = false;
    beer.x = 1000;
    beer.y = beer_y;
    scene.physics.add.overlap(player, beer, collide_beer, null, this);
    beers.push(beer);
}