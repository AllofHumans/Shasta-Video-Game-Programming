/*global Phaser, game, game_state*/
var storyFrame = 0;
var textCanAdvance = true;
var updateCycle = 0;

game_state.story = function () {};
game_state.story.prototype = {
    preload: function () {
        game.load.spritesheet("story", "assets/story.png", 1366, 700);
        

    },
    create: function () {
        this.story = game.add.sprite(0, 0 ,"story", 0);
        
        this.cursors = game.input.keyboard.createCursorKeys();
        
        this.dialogue = game.add.text(100, 400, "", {
            fontSize: "20px",
            fill: '#b20808',
        });
        
        this.storyText = game.add.text(100, 100, "", {
            fontSize: "40px",
            fill: '#b20808',
        });
    },
    update: function () {
        updateCycle ++;
        if (this.cursors.right.isDown && textCanAdvance) {
            storyFrame ++;
            textCanAdvance = false;
        }
        else if (this.cursors.left.isDown && textCanAdvance && storyFrame > 0) {
            storyFrame --;
            textCanAdvance = false;
        }
        if (storyFrame == 0) {
            this.storyText.text = "In the ancient days, these halls were a\n great source of wealth for the dwarves.";
            this.story.frame = 0;
        }
        else if (storyFrame == 1) {
            this.storyText.text = "The Lord Grolror Battlehammer ruled over the land and lead\n the way to peace and wealth for all of the dwarves.";
            this.story.frame = 1;
        }
        else if (storyFrame == 2) {
            this.storyText.text = "I was his most loyal bodygaurd, finest of the dwarven Army";
            this.dialogue.text = "";
            this.story.frame = 1;
        }
        else if (storyFrame == 3) {
            this.storyText.text = "";
            this.dialogue.text = "Well Gomrarlun, you've saved\n my life again. I guess that\n makes 37 times now.";
            this.story.frame = 6;
        }
        else if (storyFrame == 4) {
            this.storyText.text = "That was my last mistake as royal bodygaurd";
            this.dialogue.text = "";
            this.story.frame = 2;
        }
        else if (storyFrame == 5) {
            this.storyText.text = "";
            this.dialogue.text = "";
            this.story.frame = 4;
        }
        else if (storyFrame == 6) {
            this.storyText.text = "";
            this.dialogue.text = "NOOOOOOOO...";
            this.story.frame = 5;
        }
        else if (storyFrame == 7) {
            this.storyText.text = "From then on, I vowed vengance against\n any orc who dared to defile our home.";
            this.dialogue.text = "";
            this.story.frame = 5;
        }
        
        
        
        if (updateCycle > 30) {
            textCanAdvance = true;
            updateCycle = 0;
        }
        if (storyFrame > 7) {
            game.state.start("main");
        }
    }
};

game.state.add('story', game_state.story);
game.state.start('story');
//game.state.start("main");