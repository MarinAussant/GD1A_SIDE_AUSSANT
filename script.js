    
var config = {
    type: Phaser.AUTO,
    width: 800, height: 600,
    physics: {
        default: 'arcade',
        arcade: {
        gravity: { y: 1000 },
        debug: true
    }},
    scene: {preload: preload, create: create, update: update }
};

new Phaser.Game(config);

function preload(){
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('cloud', 'assets/cloud.png');
    this.load.spritesheet('perso','assets/perso.png',
    { frameWidth: 32, frameHeight: 48 });
}

var platforms;
var movablePlatforms

var player;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var gameOver = false;
var round = 1; 

function create(){
    this.add.image(400, 300, 'sky');
    this.add.image(400, 300, 'star');

     // Création des plateformes
    platforms = this.physics.add.staticGroup();

    movableCloud1 = this.physics.add.image(300, 110, 'cloud');
    movableCloud2 = this.physics.add.image(500, 312, 'cloud');

    movableCloud1.setImmovable(true);
    movableCloud1.body.allowGravity = false;
    movableCloud1.setVelocityX(-150);

    movableCloud2.setImmovable(true);
    movableCloud2.body.allowGravity = false;
    movableCloud2.setVelocityX(-150);

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(400, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    // Affiche un texte à l’écran, pour le score
    scoreText=this.add.text(16,16,'score: 0',{fontSize:'32px',fill:'#000'});
        
    // Création de la détéction du clavier
    cursors = this.input.keyboard.createCursorKeys();

    // Création du joueur
    player = this.physics.add.sprite(100, 450, 'perso');
    player.setBounce(0.2);

    // Faire en sorte que le joueur collide avec les bords du monde
    player.setCollideWorldBounds(true);

    // Faire en sorte que le joueur collide avec les platformes
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, movableCloud1);
    this.physics.add.collider(player, movableCloud2);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('perso', {start:0,end:3}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'perso', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('perso', {start:5,end:8}),
        frameRate: 10,
        repeat: -1
    });

    // Création des étoiles
    stars = this.physics.add.group({
        key: 'star', repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    // Chaque étoile va rebondir un peu différemment
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setCollideWorldBounds(true);
    }); 
        
    // Et collisionne avec les plateformes
        
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(stars, movableCloud1);
    this.physics.add.collider(stars, movableCloud2);
        
    // Le contact perso/étoile ne génère pas de collision (overlap)
    // mais en revanche cela déclenche une fonction collectStar
    this.physics.add.overlap(player, stars, collectStar, null, this);

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, movableCloud1);
    this.physics.add.collider(bombs, movableCloud2);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

}
    

function update(){

    if (gameOver){return;}

    if (cursors.left.isDown){ //si la touche gauche est appuyée
        player.setVelocityX(-220); //alors vitesse négative en X
        player.anims.play('left', true); //et animation => gauche
    }
    else if (cursors.right.isDown){ //sinon si la touche droite est appuyée
        player.setVelocityX(220); //alors vitesse positive en X
        player.anims.play('right', true); //et animation => droite
    }
    else{ // sinon
        player.setVelocityX(0); //vitesse nulle
        player.anims.play('turn'); //animation fait face caméra
    }
    if (cursors.up.isDown && player.body.touching.down){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-625); //alors vitesse verticale négative
        //(on saute)
    }

    if (movableCloud1.x < -33){
        movableCloud1.x = 833
    }
    if (movableCloud2.x < -33){
        movableCloud2.x = 833
    }
}

function collectStar(player, star){
    star.disableBody(true, true); // l’étoile disparaît
    score += 10; //augmente le score de 10
    scoreText.setText('Score: ' + score); //met à jour l’affichage du score

    if (stars.countActive(true) === 0){// si toutes les étoiles sont prises
        round +=1;
        stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
        }); // on les affiche toutes de nouveau
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) :
        Phaser.Math.Between(0, 400);
        // si le perso est à gauche de l’écran, on met une bombe à droite
        // si non, on la met à gauche de l’écran
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false; //elle n’est pas soumise à la gravité
    }
}

function hitBomb(player, bomb){
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

    