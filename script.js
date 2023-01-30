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


    //Load UI
    this.load.image('mainPv',"assets/ui/Vie_Princ.png");
    this.load.image('uiCoin',"assets/ui/Piece.png");

    //Load Background images
    this.load.image('forground',"assets/images/ForgroundSansPlateform.png");
    this.load.image('sunLight',"assets/images/LightSun.png");
    this.load.image('background',"assets/images/BackgroundSansPlateforme.png");

    //Load SpritSheet
    this.load.spritesheet('perso','assets/images/perso.png',
    { frameWidth: 32, frameHeight: 48 });

    this.load.spritesheet('lifeUI','assets/ui/lifeSheet.png',
    { frameWidth: 131, frameHeight: 96 });
    //131 x 96


    //Load Tiled
    this.load.image("Phaser_tuilesdejeu","assets/images/tileset.png");
    this.load.tilemapTiledJSON("carte","assets/niveauJson.json");
    
}

var platforms;
var player;
var playerLife = 3  ;
var playerCooldown = false;
var cursors;
var cameras;

let keyA;

//var score = 0;
//var scoreText;

var gameOver = false;


function create(){

    //Caméra 

    cameras = this.cameras.main.setSize(1024.5, 500);

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

    customPlayerBound = player.body.setBoundsRectangle((0,0,player.body.height,player.body.halfHeight));
    //customPlayerBound = player.body.setBoundsRectangle((0,0,1600,1600));
    console.log(customPlayerBound);
    //console.log(player.body.customBoundsRectangle);

    //set camera
    cameras.startFollow(player);
    cameras.setDeadzone(100,100);
    cameras.setBounds(0,0,1600,1600);

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

    //affichage ui
    lifeUI = this.add.sprite(0,0, 'lifeUI').setOrigin(0,0).setScrollFactor(0);
    this.add.sprite(0,0,'mainPv').setOrigin(0,0).setScrollFactor(0);

    this.add.sprite(0,0,'uiCoin').setOrigin(0,0).setScrollFactor(0);

    // Collision des plateformes
    calque_plateformes.setCollisionByProperty({ estSolide: true });
    calque_piques.setCollisionByProperty({ takeDamage: true });

    // Affiche un texte à l’écran, pour le score
    //scoreText=this.add.text(16,16,'score: 0',{fontSize:'32px',fill:'#000'});
        
    // Création de la détéction du clavier
    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    // Faire en sorte que le joueur collide avec les bords du monde
    player.setCollideWorldBounds(true);

    // Faire en sorte que le joueur collide avec les platformes
    this.physics.add.collider(player, calque_plateformes);
    this.physics.add.collider(player, calque_piques, spikeDamage, null, this);
    
    this.anims.create({
        key: 'maxLife',
        frames: this.anims.generateFrameNumbers('lifeUI', {start:0,end:1}),
        frameRate: 2,
        repeat: -1
    })

    this.anims.create({
        key: 'midLife',
        frames: this.anims.generateFrameNumbers('lifeUI', {start:2,end:3}),
        frameRate: 2,
        repeat: -1
    })

    this.anims.create({
        key: 'lowLife',
        frames: this.anims.generateFrameNumbers('lifeUI', {start:4,end:5}),
        frameRate: 2,
        repeat: -1
    })
    
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

    
    if (playerLife == 3){
        lifeUI.anims.play('maxLife', true);
    }
    if (playerLife == 2){
        lifeUI.anims.play('midLife', true);
    }
    if (playerLife == 1){
        lifeUI.anims.play('lowLife', true);
    }
    
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
    if (cursors.up.isDown && player.body.blocked.down){
        //si touche haut appuyée ET que le perso touche le sol
        player.setVelocityY(-375); //alors vitesse verticale négative
        //(on saute)
    }
    if (customPlayerBound.onWall()){
        player.setVelocityY(20);
        //player.body.setGravityY(2);
        console.log("yoyo");
        if(cursors.up.isDown){
            player.setVelocityY(-375);
            
        }
    }
    else {
        player.body.setGravityY(100);
    }

}

function spikeDamage(){

    // Cooldown entre chaque dégat
    // Quand le joueur prend un dégat, son cooldown et activé et il ne peux plus en recevoir avant 2000ms
    if (playerCooldown == false){

        if(player.body.velocity.y == 0 && player.body.blocked.down){  // Si le joueur prend des dégats depuis ses pieds,
            player.setVelocityY(-300);                                // Il est repoussé vers le haut
        }
        else if(player.body.velocity.y == 0 && player.body.blocked.up){ // Si le joueur prend des dégats depuis sa tête,
            player.setVelocityY(-300);                                  // Il est repoussé vers le bas
            player.setVelocityY(150);
        }

        playerLife -= 1;

        playerCooldown = true;
        playerOpacityFull = true;

        // pendant ce temps, son opacité est modifié tous les 100ms pour montrer qu'il est invulnérable.
        this.time.addEvent({        
            delay : 100,
            callback : () => {
                if(playerOpacityFull){
                    player.alpha = 0.25;
                    playerOpacityFull = false
                }
                else {
                    player.alpha = 1;
                    playerOpacityFull = true;
                }
            },
            repeat : 19
        })

        this.time.delayedCall(2000, () => {
            playerCooldown = false;
            player.alpha = 1;
        });
        
    }
    
}