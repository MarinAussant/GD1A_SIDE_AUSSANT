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

    this.load.image("Phaser_tuilesdejeu","assets/images/tileset.png");
    this.load.image('background',"assets/images/BackgroundSansPlateforme.png")
    this.load.tilemapTiledJSON("carte","assets/niveauJson.json")
    this.load.image('forground',"assets/images/ForgroundSansPlateform.png")
    this.load.image('sunLight',"assets/images/LightSun.png")

    this.load.spritesheet('perso','assets/images/perso.png',
    { frameWidth: 32, frameHeight: 48 });
}

var platforms;

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
    
    // Chargement des calques et des images

    this.add.image(0,0,'background').setOrigin(0,0);

    calque_plateformes = carteDuNiveau.createLayer(
        "Plateformes",
        tileset
    );

        //create player
    player = this.physics.add.sprite(100, 450, 'perso');
    //player.setBounce(0.2);

    calque_murs = carteDuNiveau.createLayer(
        "Murs Accrochable / Cotes Nuages",
        tileset
    );

    calque_piques = carteDuNiveau.createLayer(
        "Piques",
        tileset
    );

    calque_collectible = carteDuNiveau.createLayer(
        "Collectible",
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

    calque_nuages_transparent = carteDuNiveau.createLayer(
        "Nuages Transparents",
        tileset
    );

    (this.add.image(0,0,'forground').setOrigin(0,0)).alpha = 0.22;

    calque_structure = carteDuNiveau.createLayer(
        "Structure",
        tileset
    );

    (this.add.image(0,0,'sunLight').setOrigin(0,0)).alpha = 0.17;

    // Collision des plateformes
    calque_plateformes.setCollisionByProperty({ estSolide: true }); 

    // Affiche un texte à l’écran, pour le score
    scoreText=this.add.text(16,16,'score: 0',{fontSize:'32px',fill:'#000'});
        
    // Création de la détéction du clavier
    cursors = this.input.keyboard.createCursorKeys();

    // Faire en sorte que le joueur collide avec les bords du monde
    player.setCollideWorldBounds(true);

    // Faire en sorte que le joueur collide avec les platformes
    this.physics.add.collider(player, calque_plateformes);

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
    if (cursors.up.isDown && (player.body.blocked.down || player.body.blocked.right || player.body.blocked.left)){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-375); //alors vitesse verticale négative
        //(on saute)
    }

}

    