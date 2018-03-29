/*global game, game_state*/


game_state.story = function () {};
game_state.story.prototype = {
    preload() {
        game.load.image("logo", "storyAssets/kingmaker.jpg");
        game.load.image("villageBurn", "storyAssets/villageBurn.png");
        game.load.image("plainsTile", "storyAssets/plains.png");
        game.load.image("cityTile", "storyAssets/city.png");
        game.load.image("villageTile", "storyAssets/village.png");
        game.load.image("townTile", "storyAssets/town.png");
    },
    create() {
        //Scale
        game.scale.setGameSize(1000, 500);
        this.frame = 0;
        this.updateCount = 0;
        this.canChangeFrame = true;
        this.background = game.add.sprite(250, 0, "logo");
        this.text = game.add.text(275, 25, "Rising Empires", {
            font: "20px Arial",
            fill: "black",
            align: "center"
        });
        this.updateFrame = function() {
            switch (this.frame) {
                case 0:
                    this.background.loadTexture("logo");
                    this.text.setText("Rising Empires");
                    break;
                case 1:
                    this.background.loadTexture("cityTile");
                    this.text.setText("Our people were once successful and prosperous");
                    break;
                case 2:
                    this.background.loadTexture("townTile");
                    this.text.setText("But over time, our empire began to crumble");
                    break;
                case 3:
                    this.background.loadTexture("villageTile");
                    this.text.setText("Our glory was lost to the ages");
                    break;
                case 4:
                    this.background.loadTexture("villageBurn");
                    this.text.setText("And then the barbarians came \n and destroyed all that we had left");
                    break;
                case 5:
                    this.background.loadTexture("plainsTile");
                    this.text.setText("Our people are devastated, but now we have a \nchance to rebuild. You are the one who can lead \nour people to greatness - or confirm our ruin.");
                    break;
           }
        } 
        
        //Controls
        this.keys = game.input.keyboard.createCursorKeys();
    },
    update() {
        if (this.keys.up.isDown) {
            game.state.start("main");
        }
        else if (this.keys.right.isDown && this.canChangeFrame && this.frame < 6) {
            this.canChangeFrame = false;
            this.frame ++;
            this.updateFrame();
        }
        else if (this.keys.left.isDown && this.canChangeFrame) {
            this.canChangeFrame = false;
            this.frame --;
            this.updateFrame();
        }
        this.updateCount ++;
        if (this.updateCount >= 45) {
            this.updateCount = 0;
            this.canChangeFrame = true;
        }
    }
};

game.state.add("story", game_state.story);
game.state.start("story");

