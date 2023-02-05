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

    //Load other images
    this.load.image('piece',"assets/images/piece.png");
    this.load.image('slimeItem',"assets/images/slimeItemPixel.png");

    //Load Background images
    this.load.image('forground',"assets/images/ForgroundSansPlateform.png");
    this.load.image('sunLight',"assets/images/LightSun.png");
    this.load.image('background',"assets/images/BackgroundSansPlateforme.png");

    //Load SpritSheet
    this.load.spritesheet('ecurat','assets/images/EcuratSprite.png',
    { frameWidth: 128, frameHeight: 160 });

    this.load.spritesheet('perso','assets/images/persoSpritesTest.png',
    { frameWidth: 128, frameHeight: 241 });

    this.load.spritesheet('water','assets/images/waterSprite.png',
    { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('lifeUI','assets/ui/lifeSheet.png',
    { frameWidth: 131, frameHeight: 96 });
    //131 x 96


    //Load Tiled
    this.load.image("Phaser_tuilesdejeu","assets/images/tileset.png");
    this.load.tilemapTiledJSON("carte","assets/niveauJson.json");
    
}

// Variables relatives au joueur

var player;
var playerLife = 3  ;
var playerSpeed = 200;
var playerJump = 400;
var playerCooldown = false;
var playerCanLeft = true;
var playerCanRight = true;
var playerCanJump = true;
var playerGetSlime = false;

var ennemi;
var ennemiCanJump = true;

var cursors;
var cameras;
var scoreText;
var score = 0;

let keySpace;

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

    calque_waterPlateformes = carteDuNiveau.createLayer(
        "Water Plateformes",
        tileset
    );
    calque_waterPlateformes.alpha = 0.5;

    //create player et ennemis 
    player = this.physics.add.sprite(50, 950, 'perso').setScale(0.25);
    ennemi = this.physics.add.sprite(825, 1200, 'ecurat').setScale(0.25);

    customPlayerBound = player.body.setBoundsRectangle((0,0,player.body.height,player.body.halfHeight));
    //customPlayerBound = player.body.setBoundsRectangle((0,0,1600,1600));
    console.log(customPlayerBound);

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
    
    // Création des pièces et faire en sorte que le joueur overlap avec elles
    coin = this.physics.add.group();
    calque_collectibles = carteDuNiveau.getObjectLayer('Collectibles');
    calque_collectibles.objects.forEach(eachCoin => {
        const piece = coin.create(eachCoin.x+16,  eachCoin.y-16, "piece").body.setAllowGravity(false);
    });
    this.physics.add.overlap(player,coin,getCoin,null,this);


    // Création images animés eau
    animWaterStagTop=[];
    eauStagTop = this.physics.add.group();
    calque_eauStagTop = carteDuNiveau.getObjectLayer('Eau Stagnante Top');
    calque_eauStagTop.objects.forEach(eachWater => {
        const water = eauStagTop.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterStagTop.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauStagTop.setAlpha(0.0);
    this.physics.add.overlap(player,eauStagTop,inWater,null,this);

    animWaterStagBot=[];
    eauStagBot = this.physics.add.group();
    calque_eauStagBot = carteDuNiveau.getObjectLayer('Eau Stagnante Bottom');
    calque_eauStagBot.objects.forEach(eachWater => {
        const water = eauStagBot.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterStagBot.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauStagBot.setAlpha(0.0);
    this.physics.add.overlap(player,eauStagBot,inWater,null,this);

    animWaterStagBordTop=[];
    eauStagBordTop = this.physics.add.group();
    calque_eauStagBordTop = carteDuNiveau.getObjectLayer('Eau Stagnante Side Top');
    calque_eauStagBordTop.objects.forEach(eachWater => {
        const water = eauStagBordTop.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterStagBordTop.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauStagBordTop.setAlpha(0.0);
    this.physics.add.overlap(player,eauStagBordTop,inWater,null,this);

    animWaterStagBordBot=[];
    eauStagBordBot = this.physics.add.group();
    calque_eauStagBordBot = carteDuNiveau.getObjectLayer('Eau Stagnante Side Bottom');
    calque_eauStagBordBot.objects.forEach(eachWater => {
        const water = eauStagBordBot.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterStagBordBot.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauStagBordBot.setAlpha(0.0);
    this.physics.add.overlap(player,eauStagBordBot,inWater,null,this);

    animWaterDroite=[];
    eauDroite = this.physics.add.group();
    calque_eauDroite = carteDuNiveau.getObjectLayer('Eau Bouge Flat');
    calque_eauDroite.objects.forEach(eachWater => {
        const water = eauDroite.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterDroite.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauDroite.setAlpha(0.0);
    this.physics.add.overlap(player,eauDroite,inWater,null,this);
    this.physics.add.overlap(player,eauDroite,inWaterRight,null,this);

    animWaterBasTop=[];
    eauBasTop = this.physics.add.group();
    calque_eauBasTop = carteDuNiveau.getObjectLayer('Eau Bas Top');
    calque_eauBasTop.objects.forEach(eachWater => {
        const water = eauBasTop.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false);
        animWaterBasTop.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauBasTop.setAlpha(0.0);
    this.physics.add.overlap(player,eauBasTop,inWater,null,this);
    this.physics.add.overlap(player,eauBasTop,inWaterRight,null,this);

    animWaterBasBot=[];
    eauBasBot = this.physics.add.group();
    calque_eauBasBot = carteDuNiveau.getObjectLayer('Eau Bas Bottom');
    calque_eauBasBot.objects.forEach(eachWater => {
        const water = (eauBasBot.create(eachWater.x+16,  eachWater.y-16, "water").body.setAllowGravity(false)).alpha = 0;
        animWaterBasBot.push(this.add.sprite(eachWater.x+16,  eachWater.y-16, "water").setAlpha(0.75));
    });
    eauBasBot.setAlpha(0.0);
    this.physics.add.overlap(player,eauBasBot,inWater,null,this);
    this.physics.add.overlap(player,eauBasBot,inWaterRight,null,this);


    calque_nuages_transparent = carteDuNiveau.createLayer(
        "Nuages Transparents",
        tileset
    );

    (this.add.image(0,0,'forground').setOrigin(0,0)).alpha = 0.22;

    calque_structure = carteDuNiveau.createLayer(
        "Structure",
        tileset
    );

    slimeItem = this.physics.add.group();
    slimeItem.create(480,1250, "slimeItem").body.setAllowGravity(false);
    this.physics.add.overlap(player,slimeItem,getSlimeItem,null,this);

    (this.add.image(0,0,'sunLight').setOrigin(0,0)).alpha = 0.17;

    //affichage ui
    lifeUI = this.add.sprite(0,0, 'lifeUI').setOrigin(0,0).setScrollFactor(0);
    mainPv = this.add.sprite(0,0,'mainPv').setOrigin(0,0).setScrollFactor(0);
    uiCoin = this.add.sprite(0,0,'uiCoin').setOrigin(0,0).setScrollFactor(0);
    scoreText=this.add.text(16,185,'0',{fontSize:'32px',fill:'#FFD700'}).setScrollFactor(0);

    // Collision des plateformes
    calque_plateformes.setCollisionByProperty({ estSolide: true });
    calque_piques.setCollisionByProperty({ takeDamage: true });
        
    // Création de la détéction du clavier
    cursors = this.input.keyboard.createCursorKeys();
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Faire en sorte que le joueur collide avec les bords du monde
    player.setCollideWorldBounds(true);

    // Faire en sorte que le joueur collide avec les platformes et les piques
    this.physics.add.collider(player, calque_plateformes);
    this.physics.add.collider(player, calque_piques, spikeDamage, null, this);
    this.physics.add.collider(player, ennemi, ennemiCollide, null, this);

    this.physics.add.collider(ennemi, calque_plateformes);
    

    // Animation Vie
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


    // Animation Personnage
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('perso', {start:1,end:2}),
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
        frames: this.anims.generateFrameNumbers('perso', {start:6,end:7}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'jumpRight',
        frames: [ { key: 'perso', frame: 5 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'jumpLeft',
        frames: [ { key: 'perso', frame: 3 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'wallRight',
        frames: [ { key: 'perso', frame: 8 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'wallLeft',
        frames: [ { key: 'perso', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'climbRight',
        frames: [ { key: 'perso', frame: 9 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'climbLeft',
        frames: [ { key: 'perso', frame: 10 } ],
        frameRate: 20
    });

    // Animation Ennemi
    this.anims.create({
        key: 'ecuratJump',
        frames: this.anims.generateFrameNumbers('ecurat', {start:1,end:2}),
        frameRate: 8
        //repeat: -1
    });

    this.anims.create({
        key: 'ecuratIdle',
        frames: [ { key: 'ecurat', frame: 0 } ],
        frameRate: 20
    });


    // Animation Water
    this.anims.create({
        key: 'eauStagBordTop',
        frames: this.anims.generateFrameNumbers('water', {start:0,end:1}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'eauStagBordBot',
        frames: this.anims.generateFrameNumbers('water', {start:2,end:3}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'eauStagTop',
        frames: this.anims.generateFrameNumbers('water', {start:4,end:6}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'eauStagBot',
        frames: this.anims.generateFrameNumbers('water', {start:7,end:9}),
        frameRate: 2,
        repeat: -1
    });

    this.anims.create({
        key: 'eauDroite',
        frames: this.anims.generateFrameNumbers('water', {start:4,end:6}),
        frameRate: 8,
        repeat: -1
    });
    
    this.anims.create({
        key: 'eauBasTop',
        frames: this.anims.generateFrameNumbers('water', {start:10,end:11}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'eauBasBot',
        frames: this.anims.generateFrameNumbers('water', {start:12,end:13}),
        frameRate: 10,
        repeat: -1
    });
}
    

function update(){

    if(playerLife == 0 || (player.body.position.x > 1600 && player.body.position.y < 100)){
        gameOver = true; 
    }

    if(player.body.position.x < -32){
        player.body.position.x = 50;
        player.body.position.y = 950;
        if(typeof out !== 'undefined' && typeof texteout !== 'undefined'){
            out.destroy();
            texteout.destroy();
        }
        out=this.add.text(150,30,'Hop Hop Hop !',{fontSize:'50px',fill:'#ffffff'}).setScrollFactor(0);
        texteout=this.add.text(150,80,"Où est ce que vous allez comme ça c'est pas par là !",{fontSize:'20px',fill:'#ffffff'}).setScrollFactor(0);

        this.time.delayedCall(2000, () => {
            out.destroy();
            texteout.destroy();
        });

    }

    if(player.body.position.x > 1400 && player.body.position.y >1600){
        playerLife = 0;
        gameOver = true; 
    }

    if (gameOver){
        if(playerLife == 0){
            playerLife = 3;
            gameOver = false;
            this.scene.restart();
        }
        else {
            player.disableBody(true,true);
            win=this.add.text(150,30,'Vous avez gagnez !',{fontSize:'50px',fill:'#FFD700'}).setScrollFactor(0);
            texteWin=this.add.text(150,80,'Bravo, vous avez terminé le niveau, recharger la page pour recommencer.',{fontSize:'20px',fill:'#FFD700'}).setScrollFactor(0);
        }
    }

    
    
    // ANIMATIONS

    // Animation Vie
    if (playerLife == 3){
        lifeUI.anims.play('maxLife', true);
    }
    if (playerLife == 2){
        lifeUI.anims.play('midLife', true);
    }
    if (playerLife == 1){
        lifeUI.anims.play('lowLife', true);
    }

    if(!this.physics.overlap(player,eauDroite) && 
        !this.physics.overlap(player,eauStagBordBot) && 
        !this.physics.overlap(player,eauStagBordTop) &&
        !this.physics.overlap(player,eauStagBot) &&
        !this.physics.overlap(player,eauStagTop) &&
        !this.physics.overlap(player,eauBasTop) &&
        !this.physics.overlap(player,eauBasBot)) {
            playerSpeed = 200;
            playerJump = 400;
        };

    if(player.body.position.x < 120 && player.body.position.y < 800){   //Si le joueur rentre dans l'UI, elle est masqué
        lifeUI.setAlpha(0.25);
        mainPv.setAlpha(0.25);
        uiCoin.setAlpha(0.25);
        scoreText.setAlpha(0.25);
    }
    else{
        lifeUI.setAlpha(1);
        mainPv.setAlpha(1);
        uiCoin.setAlpha(1);
        scoreText.setAlpha(1);
    }

    // Animation Water 

    animWaterBasBot.forEach(water => {
        water.anims.play('eauBasBot',true);
    });

    animWaterBasTop.forEach(water => {
        water.anims.play('eauBasTop',true);
    });

    animWaterDroite.forEach(water => {
        water.anims.play('eauDroite',true);
    });

    animWaterStagBordBot.forEach(water => {
        water.anims.play('eauStagBordBot',true);
    });

    animWaterStagBordTop.forEach(water => {
        water.anims.play('eauStagBordTop',true);
    });

    animWaterStagBot.forEach(water => {
        water.anims.play('eauStagBot',true);
    });

    animWaterStagTop.forEach(water => {
        water.anims.play('eauStagTop',true);
    });
    
    
    // DIRECTION 

    if (cursors.left.isDown){
        if (playerCanLeft) {
            player.setVelocityX(-playerSpeed); //si la touche gauche est appuyée //alors vitesse négative en X
        } 
        player.anims.play('left', true); //et animation => gauche
    }
    else if (cursors.right.isDown){ //sinon si la touche droite est appuyée
        if (playerCanRight) {
            player.setVelocityX(playerSpeed); //alors vitesse positive en X
        }
        player.anims.play('right', true); //et animation => droite
    }
    else{ // sinon
        player.setVelocityX(0); //vitesse nulle
        player.anims.play('turn'); //animation fait face caméra
    }

    if(player.body.velocity.y>1000){    // On évite que le joueur n'aille trop vite en tombant
        player.setVelocityY(1000);      // a cause de bugs de collision
    }


    // SAUT

    //Ennemi
    if(ennemi.body.blocked.down){
        ennemi.anims.play('ecuratIdle');
        ennemiCanJump = true;
    }

    //Joueur
    if(cursors.up.isUp && playerCanJump==false){
        playerCanJump = true;
    }

    if (!player.body.blocked.down){
        if (cursors.right.isDown){
            player.anims.play('jumpRight')
        }
        else if (cursors.left.isDown){
            player.anims.play('jumpLeft')
        }
    }
    if (cursors.up.isDown && player.body.blocked.down && playerCanJump){
        //si touche haut appuyée ET que le perso touche le sol
        //(on saute)
        jump();
    }

    // WALLJUMP

    if (player.body.onWall() && !player.body.blocked.down && (playerGetSlime == false || !keySpace.isDown)){                //Si le joueur est contre un mur

        player.setVelocityY(50);
        if (player.body.blocked.right){
            player.anims.play('wallRight')
        }
        else if (player.body.blocked.left){
            player.anims.play('wallLeft')
        }

        if(cursors.up.isDown && playerCanJump){                      //Et qu'il appuit sur SAUTER,
            jump();
            if(customPlayerBound.blocked.right){
                player.setVelocityX(-100);
                playerCanRight = false;

                this.time.delayedCall(250, () => {
                    playerCanRight = true;
                });
            }                                       // Il est repoussé dans la direction opposé et ne
            if(customPlayerBound.blocked.left){     // et ne peut qu'aller dans cette dernière pendant
                player.setVelocityX(100);           // un certain temps court
                playerCanLeft = false;

                this.time.delayedCall(250, () => {
                    playerCanLeft = true;
                });
            }
        }
    }
    else {
        player.body.setGravityY(100);
    }

    // ESCALADE

    if (player.body.onWall() && (playerGetSlime == true && keySpace.isDown)){       //Si le joueur est contre un mur et appuyer sur SPACE

        if(cursors.up.isDown){
            player.setVelocityY(-75);
        }
        else if(cursors.down.isDown){
            player.setVelocityY(175);
        }
        else{
            player.setVelocityY(0);
            player.body.setAllowGravity(false);
        }
        if (player.body.blocked.right){
            player.anims.play('climbRight')
        }
        else if (player.body.blocked.left){
            player.anims.play('climbLeft')
        }
    }
    else {
        player.body.setGravityY(100);
        player.body.setAllowGravity(true);
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

function getCoin(player, coin){
    coin.disableBody(true,true);
    score += 1;
    scoreText.text = score;
}

function getSlimeItem(player, slimeItem){
    slimeItem.disableBody(true,true);
    playerGetSlime = true;
    recup=this.add.text(150,30,'Vous avez récupéré des',{fontSize:'50px',fill:'#FFD700'}).setScrollFactor(0);
    slimeGant=this.add.text(150,80,'Gants de Slime !',{fontSize:'50px',fill:'#FFD700'}).setScrollFactor(0);
    utilisez=this.add.text(150,140,'Utilisez pour escalader les murs en restant appuyer sur Espace ou X',{fontSize:'20px',fill:'#FFD700'}).setScrollFactor(0);
    this.time.delayedCall(5000, () => {
        recup.destroy();
        slimeGant.destroy();
        utilisez.destroy();
    });
}

function inWater(){
    playerSpeed= 125;
    playerJump= 300;
}

function inWaterRight(){
    player.body.position.x+=1;
}

function jump(){

    player.setVelocityY(-playerJump);
    playerCanJump = false;

    if(ennemiCanJump && (
        Math.sqrt(                                                      // On vérifie ici si le joueur se trouve
            Math.pow(                                                   // à moins de 100 pixels de l'ennemi
                player.body.position.x - ennemi.body.position.x,2)+
            Math.pow(
                player.body.position.y - ennemi.body.position.y,2)
        )) < 100){
        ennemi.setVelocityY(-playerJump-50);
        ennemiCanJump = false;
        ennemi.anims.play('ecuratJump');
    }
    
}

function ennemiCollide(player, ennemi){
    if (player.body.touching.down) {
        ennemi.disableBody(true, true);
        player.setVelocityY(-playerJump);
    }
    else {
        playerLife = 0;
        gameOver = true;
    }
}
