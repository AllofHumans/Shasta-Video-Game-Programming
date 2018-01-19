/*global Phaser*/

var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
var game_state = {};
var jumpCount = 0; 


game_state.main = function () {};
game_state.main.prototype = {


    preload: function() {
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.spritesheet('dude', 'assets/dwarf.png', 64, 44);
    
    },
    create: function() {
        game.add.sprite(0, 0, 'sky');
        
        this.scoreText = game.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
        this.score = 0;
        
        
        //Platforms
        this.platforms = game.add.group();
        this.platforms.enableBody = true; 
        
        //Ground 
        var ground = this.platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(10, 2);
        ground.body.immovable = true;
        
        //Ledges - more to be done
        var ledge1 = this.platforms.create(150, 400, 'ground');
        ledge1.body.immovable = true;
        var ledge2 = this.platforms.create(400, 300, 'ground');
        ledge2.body.immovable = true;
        var ledge3 = this.platforms.create(0, 100, 'ground');
        ledge3.body.immovable = true;
        var ledge4 = this.platforms.create(300, 150, 'ground');
        ledge4.body.immovable = true;
        var ledge5 = this.platforms.create(700, 300, 'ground');
        ledge5.body.immovable = true;
        var ledge6 = this.platforms.create(550, 100, 'ground');
        ledge6.body.immovable = true;
        
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //Player
        this.player = game.add.sprite(32, game.world.height - 150, 'dude');
        game.physics.arcade.enable(this.player);
        this.player.body.bounce.y = 0.25;
        this.player.body.gravity.y = 800;
        this.player.body.collideWorldBounds = true;
        // this.player.animations.add('left', [10, 11, 12, 13], 10, true);
        // this.player.animations.add('right', [1, 2, 3, 4], 10, true);
        
        //Controls
        this.cursors = game.input.keyboard.createCursorKeys();
        
        //Stars
        this.stars = game.add.group();
        this.stars.enableBody = true;
        for (var i = 0; i < 12; i++) {
            var star = this.stars.create(i * 70, 0, 'star');
            star.body.gravity.y = 500;
            star.body.bounce.y = 0.7 + Math.random() * 0.2;
        }
        



    },
    
    
    
    
    update: function() {
        game.physics.arcade.collide(this.player, this.platforms);
        game.physics.arcade.collide(this.stars, this.platforms);
        game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);
        
        //controls
        this.player.body.velocity.x = 0;
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -150;
            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 150;
            this.player.animations.play('right');
        }
        else {
            this.player.animations.stop();
            this.player.frame = 4;
        }
        if(this.player.body.touching.down) {
            jumpCount = 0;
        }
        if (this.cursors.up.isDown && jumpCount < 3) {
            this.player.body.velocity.y = -500;
            jumpCount ++;
            
        }
        this.scoreText.text = 'Score: ' + this.score;
    },
    collectStar: function(player, star) {
        star.kill();
        this.score += 100;
    }
};
game.state.add('main', game_state.main);
game.state.start('main');
