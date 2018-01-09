/*global Phaser*/

var game = new Phaser.Game(800, 600, Phaser.AUTO, '');
var game_state = {}

game_state.main = function() {};
game_state.main.prototype = {

    preload: function() {
        game.load.image('player', 'assets/player.png');
        game.load.image('object', 'assets/object.png');
    },

    create: function() {
        //_this
        var _this = this;
        //Backround
        game.stage.backgroundColor = '#3598db';
        //Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //Player
        this.player = game.add.sprite(200, 400, 'player');
        game.physics.arcade.enable(this.player);
        this.player.enableBody = true;
        this.player.body.immovable = true;
        this.player.speed = 600;
        this.player.score = 0;
        //Movement
        this.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        //Our Object:
        this.objects = game.add.group();
        this.objects.enableBody = true;
        //Making object spawn & fall
        var rand = 1000;
        setInterval(function() {
            var object = _this.objects.create(Math.random() * 800, -64, 'object');
            object.body.gravity.y = 300;
            rand = (Math.random() * 1500) + 300;
        }, rand);
        
    },

    update: function() {
        //Moving the player
        if (this.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
        }
        else if (this.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
        }
        else {
            this.player.body.velocity.x = 0;
        }
        if (this.player.body.x < -300 || this.player.body.x > 300) {
            
        }
        //collisions (player & object)
        game.physics.arcade.overlap(this.player, this.objects, this.hitObject, null, this);
        
        
    },
    hitObject: function(player, object) {
        object.kill();
        this.player.score ++;
    }

}
game.state.add('main', game_state.main);
game.state.start('main');
