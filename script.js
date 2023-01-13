var config = {
    type: Phaser.AUTO,
    width: 1600, height: 1600,
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

    this.load.image("Phaser_tuilesdejeu","assets/tileset.png");
    this.load.tilemapTiledJSON("carte","assets/niveauJson.json")
    this.load.image('ground', 'assets/platform.png');

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

    // Chargement de la carte 
    carteDuNiveau = this.add.tilemap("carte");

    // Chargement du jeu de tuile
    tileset = carteDuNiveau.addTilesetImage(
        "MPN_LevelDesign",
        "Phaser_tuilesdejeu"
    );
    
    // Chargement des calques
    
    calque_structure = carteDuNiveau.createLayer(
        "Structure",
        tileset
    );

    calque_nuages_transparent = carteDuNiveau.createLayer(
        "Nuages Transparents",
        tileset
    );

    calque_eauFond = carteDuNiveau.createLayer(
        "Eau vers le fond",
        tileset
    );

    calque_eauDroite = carteDuNiveau.createLayer(
        "Eau vers la droite",
        tileset
    );

    calque_eauStag = carteDuNiveau.createLayer(
        "Eau Stagnante",
        tileset
    );

    calque_collectible = carteDuNiveau.createLayer(
        "Collectible",
        tileset
    );

    calque_piques = carteDuNiveau.createLayer(
        "Piques",
        tileset
    );

    calque_murs = carteDuNiveau.createLayer(
        "Murs Accrochable / Cotes Nuages",
        tileset
    );

    calque_plateformes = carteDuNiveau.createLayer(
        "Plateformes",
        tileset
    );

    // Collision des plateformes
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    calque_plateformes.setCollisionByProperty({ estSolide: true }); 

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
    this.physics.add.collider(player, calque_plateformes);
    this.physics.add.collider(player, platforms);


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
}

    