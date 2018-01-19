/*global Phaser*/
var game = new Phaser.Game(1366, 654, Phaser.AUTO, '');
var game_state = {};
var jumpCount = 0;
var allEnemies = [];
var updatecount = 0; 
var axes = [];
var playerCanThrow = true;
var playerImmune = false;
var health = 20;
var ground;
var score = 0;
var enemyspeed = 100;
var round = 1;

game_state.main = function () {};
game_state.main.prototype = {
    preload: function() {
        game.load.spritesheet('player', 'assets/dwarf.png', 88, 56);
        game.load.spritesheet('meleeOrc', 'assets/meleeOrc.png', 88, 83);
        game.load.spritesheet('axe', 'assets/axe.png', 32, 32);
        game.load.image('backround', 'assets/backround.png');
        game.load.image('ground', 'assets/tile1.png');
        game.load.image("bridge", "assets/bridgePlatform.png");
        
    },
    create: function() {
        game.add.sprite(0, 0, 'backround');
        //game.stage.backgroundColor = '#43474f';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        this.healthText = game.add.text(16, 40, 'Health: 0', {
            fontSize: '26px',
            fill: '#000'
        });
        this.scoreText = game.add.text(16, 60, 'Orc Heads: 0', {
            fontSize: '26px',
            fill: '#000'
        });
        this.roundText = game.add.text(16, 80, "Round: " + round, {
            fontSize: "26px",
            fill: "#000"
        });
        
        //Platforms
        this.platforms = game.add.group();
        this.platforms.enableBody = true;
        //Ground
        ground = this.platforms.create(0, game.world.height - 20, 'ground');
        ground.scale.setTo(10.65, 2);
        ground.body.immovable = true;
        ground.body.mass = 1000;
        //Ledges 
        this.ledges = [];
        this.ledges.push(this.platforms.create(175, 500, 'ground'));
        this.ledges.push(this.platforms.create(395, 500, 'ground'));
        this.ledges.push(this.platforms.create(615, 500, 'ground'));
        this.ledges.push(this.platforms.create(836, 500, 'ground'));
        this.ledges.push(this.platforms.create(1058, 500, 'ground'));
        
        for (var i = 0; i < this.ledges.length; i++) {
            this.ledges[i].body.immovable = true;
            this.ledges[i].scale.setTo(.7, 0.2);
        }
        //Bridges
        this.bridges = [];
        this.bridges.push(this.platforms.create(255, 350, "bridge"));
        this.bridges.push(this.platforms.create(475, 350, "bridge"));
        this.bridges.push(this.platforms.create(695, 350, "bridge"));
        this.bridges.push(this.platforms.create(915, 350, "bridge"));
        
        for (var i of this.bridges) {
            i.body.immovable = true;
            i.scale.setTo(1.5, 1);
            i.body.setSize(100, 5, 0 , 30);
        }
        
        
        //Player
        this.player = game.add.sprite(32, game.world.height - 100, 'player', 0);
        this.player.scale.setTo(.5, .5);
        game.physics.arcade.enable(this.player);
        this.player.direction = 'right';
        this.player.body.bounce.y = 0.5;
        this.player.body.gravity.y = 1000;
        this.player.body.collideWorldBounds = true;
        this.player.animations.add('left', [10, 13], 5, true);
        this.player.animations.add('right', [1, 2], 5, true);
        this.player.animations.add('leftAttack', [15, 16, 17], 10, true);
        this.player.animations.add('rightAttack', [6, 7, 8], 10, true);
        this.player.body.setSize(40,55,15,0);
        
        //Controls
        this.cursors = game.input.keyboard.createCursorKeys();
        this.keys = {
            shift: game.input.keyboard.addKey(Phaser.Keyboard.SHIFT),
            space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        };
        
        //Enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        
        allEnemies.push(this.enemies.create(970, 300, 'meleeOrc', 6));
        allEnemies.push(this.enemies.create(750, 300, 'meleeOrc', 6));
        allEnemies.push(this.enemies.create(530, 300, 'meleeOrc', 6));
        allEnemies.push(this.enemies.create(320, 300, 'meleeOrc', 6));
        this.enemyCount = 4;
        
        for (var i = 0; i < allEnemies.length; i++) {
            allEnemies[i].animations.add('moveLeft', [0, 1, 2, 3], 10, true);
            allEnemies[i].animations.add('moveRight', [6, 7, 8, 9], 10, true);
            allEnemies[i].animations.add('attackRight', [10, 11], 6, true);
            allEnemies[i].animations.add('attackLeft', [4, 5], 6, true);
            allEnemies[i].isActive = false;
            allEnemies[i].hp = 3;
            allEnemies[i].scale.setTo(.5, .5);
            allEnemies[i].body.gravity.y = 750;
            allEnemies[i].body.bounce.y = .9;
            allEnemies[i].body.collideWorldBounds = true;
            allEnemies[i].body.setSize(40, 80, 15, 0);
        }
        
        this.axe = game.add.group();
        this.axe.enableBody = true;
        this.axe.physicsBodyType = Phaser.Physics.ARCADE;
        
    },
    update: function() {
        // game.debug.body(ground);
        // this.platforms.forEach(function(item){
        //     game.debug.body(item);
        // });
        updatecount ++;
        
        game.physics.arcade.collide(this.player, this.platforms);
        game.physics.arcade.collide(this.platforms, this.enemies);
        game.physics.arcade.collide(this.enemies, this.enemies);
        game.physics.arcade.collide(this.axe, this.platforms);
        
        game.physics.arcade.overlap(this.player, this.enemies, this.playerHit, null, this);
        game.physics.arcade.overlap(this.axe, this.enemies, this.axeHit, null, this);

        //Controls
        //Animations and Move
        this.player.body.velocity.x = 0;
        if (this.keys.space.isDown) {
            if(this.cursors.left.isDown) {
                this.player.body.velocity.x = -175;
                this.player.direction = 'left';
            }
            else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 175;
                this.player.direction = 'right';
                
            }
            if (this.player.direction == 'right') {
                this.player.animations.play('rightAttack');
                if (playerCanThrow) {
                    axes.push(this.axe.create(this.player.body.position.x, this.player.body.position.y, 'axe',  0));
                    axes[axes.length - 1].animations.add('fly', [0, 2, 1, 3], 15);
                    axes[axes.length - 1].body.gravity.y = 500;
                    axes[axes.length - 1].body.bounce.y = 0;
                    axes[axes.length - 1].direction = 'right';
                    axes[axes.length - 1].scale.setTo(.5, .5);
                    playerCanThrow = false;
                    setTimeout(function() {
                        axes[0].kill();
                        axes.shift();
                    }, 2000);
                }
                
            }
            else {
                this.player.animations.play('leftAttack');
                if (playerCanThrow) {
                    axes.push(this.axe.create(this.player.body.position.x, this.player.body.position.y, 'axe',  0));
                    axes[axes.length - 1].animations.add('fly', [0, 1, 2, 3], 15);   
                    axes[axes.length - 1].body.gravity.y = 500;
                    axes[axes.length - 1].body.bounce.y = 0;
                    axes[axes.length - 1].direction = 'left';
                    axes[axes.length - 1].scale.setTo(.5, .5);
                    playerCanThrow = false;
                    setTimeout(function() {
                        axes[0].kill();
                        axes.shift();
                    }, 2000);                    
                }
                
            }
        } //Attack
        else if (this.keys.shift.isDown) {
            if(this.cursors.left.isDown) {
                this.player.body.velocity.x = -200;
                this.player.direction = 'left';
            }
            else if (this.cursors.right.isDown) {
                this.player.body.velocity.x = 200;
                this.player.direction = 'right';
            }
            if (this.player.direction == 'right') {
                this.player.frame = 5; 
                //this.player.animations.play('rightAttack');
            }
            else {
                this.player.frame = 14;
                //this.player.animations.play('leftAttack');
            }
        } //Block
        else if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -175;
            this.player.animations.play('left');
            this.player.direction = 'left';
        } //Move Left
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 175;
            this.player.animations.play('right');
            this.player.direction = 'right';
        } //Move Right
        else {
            this.player.animations.stop();
            if (this.player.direction == 'right') {
                this.player.frame = 0; //facing right
            }
            else {
                this.player.frame = 9; //facing left
            }
        } //Stop Animations
        //Jump
        if(this.player.body.touching.down) {
            jumpCount = 0;
        }
        if (this.cursors.up.isDown && jumpCount < 3) {
            this.player.body.velocity.y = -500;
            jumpCount ++;
        }
        for (var i = 0; i < allEnemies.length; i++) {
            if (allEnemies[i].isActive) {
                if (allEnemies[i].body.position.x < this.player.body.position.x - 10) {
                    //Move right 
                    allEnemies[i].body.velocity.x = enemyspeed;
                    if(allEnemies[i].body.position.x > this.player.body.position.x - 50) {
                        allEnemies[i].animations.play('attackRight');
                    }
                    else {
                        allEnemies[i].animations.play('moveRight');
                    }
                }
                else if(allEnemies[i].body.position.x > this.player.body.position.x + 10) {
                    //Move right 
                    allEnemies[i].body.velocity.x = 0 - enemyspeed;
                    if(allEnemies[i].body.position.x < this.player.body.position.x + 50) {
                        allEnemies[i].animations.play('attackLeft') ;
                    }
                    else {
                        allEnemies[i].animations.play('moveLeft');
                    }
                }
                else {
                    allEnemies[i].body.velocity.x = 0;
                    allEnemies[i].animations.stop();
                }
            }
            else {
                if (game.physics.arcade.distanceBetween(allEnemies[i], this.player) < 200) {
                    allEnemies[i].isActive = true;
                }
            }
        }
        for (var i = 0; i < axes.length; i++) {
            axes[i].direction == 'left' ? axes[i].body.velocity.x = -800: axes[i].body.velocity.x = 800;
            axes[i].animations.play("fly");
        }
        if (updatecount > 30) {
            updatecount = 0;
            playerCanThrow = true;
            playerImmune = false;
        }
        
        this.healthText.text = 'Health: ' + health;
        this.scoreText.text = 'Orc Heads: ' + score;
        if (health <= 0) {
            this.clear();
            game.state.start("death");
        }
        if (this.enemyCount == 0) {
            this.clear();
            round ++; 
            enemyspeed = enemyspeed * 1.3;
            game.state.start("main");
        }
        

    },
    axeHit: function(axe, enemy) {
        enemy.hp --;
        axe.kill();
        enemy.isActive = true;
        
        if (enemy.hp <= 0) {
            enemy.kill();
            score ++;
            this.enemyCount --;
        }
    },
    playerHit: function() {
        if (!playerImmune) {
            health -= 5;
            playerImmune = true; 
        }
    },
    clear: function() {
        axes = [];
        allEnemies = [];
        health = 20;
        score = 0;
    }
};
game.state.add('main', game_state.main);

game_state.dead = function() {};
game_state.dead.prototype = {
    preload: function() {
        game.load.image("backround", "assets/death.png");
    },
    create: function() {
        game.add.sprite(0, 0, "backround");
        this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.respawnText = game.add.text(500, 500, 'Press Space to respawn.', {
            fontSize: '28px',
            fill: 'red',
            align: 'center'
        });
        updatecount = 0;
    },
    update: function() {
        updatecount ++;
        if (this.space.isDown) {
            game.state.start("main");
        }
        if (updatecount > 5) {
            this.respawnText.text = "Press Space to respawn.";
        }
        else {
            this.respawnText.text = "";
        }
        if (updatecount > 30) {
            updatecount = 0;
        }
    }
};
game.state.add("death", game_state.dead);