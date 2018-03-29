/*global Phaser, game, game_state*/
/*global map, Plains*///In map.js
/*global buildingRefs*///In building.js
//Document refs
//Messages
let goldText = document.getElementById("goldText");
let settlerText = document.getElementById("settlerText");
let turnText = document.getElementById("turnText");
let gameMessages = document.getElementById("gameMessages");
//Buttons
let newTurn = document.getElementById("nextTurn");
let settleButton = document.getElementById("settle");
//IN GAME VARS/OBJECTS AND CLASSES

//UI data
const updateQueue = []; //array of cities that need update by player
let tileClicked = null;
let playerAction = null;


//Data
const worldData = {
    turnCount: 0,
    cities: [],
};
class Player { //All players are of this class, including human and raider players
    constructor(id, pos) {
        this.gold = 0;
        this.id = id;
        this.name = "";
        this.units = [];
        this.listpos = pos;
        this.settlers = 10;
    }
}

const human = new Player("human", null);

const ai = [];
ai.push(new Player("raider", 0));

class City { //Cities
    constructor(name, tile, owner) {
        this.level = 0;
        this.name = name;
        this.owner = owner; //object
        this.population = 1.0;
        this.income = {
            production: 0,
            food: 0,
            gold: 0
        };
        this.tile = tile; //Tile object
        this.levelup();
        this.buildings = []; //List of building objects in city
        this.currentBuild = {}; //What city is building: should have a .cost property: BuildingRef object
        
    }
    //tilesInRange does not work on cities on the sides of the map!!! -- This needs to be fixed
    get tilesInRange() {
        let tileCount = [];
        
        switch (this.level) { //Claims tiles and modifies income
            case 1:
                tileCount.push(map[this.tile.x][this.tile.y]);
                break;
            case 2:
                for (let i = -1; i < 2; i++) {
                    for(let j = -1; j < 2; j++) {
                        if(map[this.tile.x+i][this.tile.y+j]) {
                            tileCount.push(map[this.tile.x+i][this.tile.y+j]);
                        }
                    }
                    
                }
                break;
            case 3:
                for (let i = -2; i < 3; i++) {
                    for(let j = -2; j < 3; j++) {
                        if(map[this.tile.x+i][this.tile.y+j]) {
                            tileCount.push(map[this.tile.x+i][this.tile.y+j]);
                        }
                    }
                }
        } 
        return tileCount;
    } //Gets array of all tile objects affected by city
    levelup() { //Runs on creation and if called by updateCity - Should update sprite and set tile ownership and income
        this.level ++;
        for (let i of this.tilesInRange) {
            i.owner = {
                player: this.owner,
                city: this
            };
        }
        //Calc income
        for (let i of this.tilesInRange) {
            this.income.food += i.output[0];
            this.income.production += i.output[1];
            this.income.gold += i.output[2];
        }
        //paint sprite on tile
        switch (this.level) { 
            case 1:
                this.tile.sprite.loadTexture("villageTile");
                break;
            case 2:
                this.tile.sprite.loadTexture("townTile");
                break;
            case 3:
                this.tile.sprite.loadTexture("cityTile");
        }
        
    }
    
    getBuildOptions() {
        
    }
    
    
    
    //Tile building
    buildTile() { //Sets up sprite and links building to tile
        map[this.currentBuild.y][this.currentBuild.x].building = this.currentBuild.make();
        this.income.production += map[this.currentBuild.y][this.currentBuild.x].building.output.production;
        this.income.food += map[this.currentBuild.y][this.currentBuild.x].building.output.food;
        this.income.gold += map[this.currentBuild.y][this.currentBuild.x].building.output.gold;
    }
    startTileBuild(x, y, type, build) { //Type is 0-2 0 is city, 1 is tile, 2 is unit; Build is list pos of target
        //x and y are in gird chords, not game chords
        this.currentBuild = JSON.parse(JSON.stringify(buildingRefs[type][build]));
        this.currentBuild.x = x;
        this.currentBuild.y = y;
    }

    
    updateCity() { //Runs at the end of each turn
        //Grow if pop is high enough
        this.population += this.income.food * 0.5;
        if (this.population > (this.level ^ 10) && this.level < 3) { //Upgrade city if pop is high enough - Cities cant upgrade past lvl 3
            this.levelup();
        }
        //subtract cost + build
        this.currentBuild.cost -= this.income.production;
        if (this.currentBuild.cost <= 0) {
            switch (this.currentBuild.type) { //What to do based on what type of thing is being built
                case 'city':
                    // code
                    break;
                case "tile":
                    this.buildTile();
                    break;
                case "unit":
                    break;
                case "resource":
            
   
            }
            updateQueue.push(this);
        }
    }
}

//GAME FUNCTIONS
function nextTurn() {
    console.log("Turn: " + worldData.turnCount.toString()); //Log turn
    for (let i of worldData.cities) { //UPDATE ALL CITIES
        i.updateCity();
    }
    
    worldData.turnCount ++;
    updateText();
}
//UI Stuff
function updateText() {
    goldText.innerHTML = "Gold: " + human.gold;
    settlerText.innerHTML = "Settlers: " + human.settlers;
    turnText.innerHTML = "Turn: " + worldData.turnCount;
    
}
function playerPlaceCity() {
    let x = tileClicked.x;
    let y = tileClicked.y;
    //Is it a legal spot?
    let legal = true;
    for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
            if (!map[x + i][y + j]) {
                legal = false;
            }
            else if (!!map[x + i][y + j].building) {
                legal = false;
            }
        }
    }
    console.log(legal);
    if (legal) {
        let name = prompt("Please enter the name of your city:");
        if (name != null) { //Did the player hit cancel?
            //Create city
            playerAction = null;
            human.settlers --;
            updateText();
            map[x][y].building = new City(name, map[x][y], "Human");
            worldData.cities.push(map[x][y].building);
        }
        else {
            tileClicked = null;
        }
    }
    else {
        gameMessages.innerHTML = "You may not place a city here";
    }
}


//Camera 
let cameraView = new Phaser.Rectangle(0, 0, 1000, 500);


//PHASER GAME
game_state.main = function () {};
game_state.main.prototype = {
    preload() {
        game.load.image("plainsTile", "assets/plains.png");
        game.load.image("cityTile", "assets/city.png");
        game.load.image("villageTile", "assets/village.png");
        game.load.image("townTile", "assets/town.png");
        game.load.image("farmTile", "assets/farm.png");
    },
    create() {
        //Camera
        game.world.setBounds(0, 0, 2500, 2500);
        game.camera.view = cameraView;
        //Scale
        game.scale.setGameSize(1000, 500);
        
        //Add tiles to game
        for (let i = 0; i < 25; i++) {
            let column = [];
            for (let j = 0; j < 25; j++) {
                column.push(new Plains(i, j));
            }
            map.push(column);
        }

        
        //Input
        this.keys = {
            q: game.input.keyboard.addKey(Phaser.Keyboard.Q),
            e: game.input.keyboard.addKey(Phaser.Keyboard.E),
            w: game.input.keyboard.addKey(Phaser.Keyboard.W),
            a: game.input.keyboard.addKey(Phaser.Keyboard.A),
            s: game.input.keyboard.addKey(Phaser.Keyboard.S),
            d: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };
        
        //Other
        this.updateCount = 0;
        
        //Debug Stuff
        //playerAction = "settle";
    },
    update() {
        //Controls - Camera
        if (this.keys.a.isDown) {
            cameraView.x -= 15;
        }
        if (this.keys.d.isDown) {
            cameraView.x += 15;
        }
        if (this.keys.w.isDown) {
            cameraView.y -= 15;
        }
        if (this.keys.s.isDown) {
            cameraView.y += 15;
        }
        //UIClicked
        for (let column of map) {
            for (let item of column) {
                if (item.isClicked) {
                    tileClicked = item;
                }
            }
        }
        
        //What to do when a tile is clicked:
        if (tileClicked) {
            console.log(playerAction);
            switch (playerAction) {
                case "settle":
                    //Settle a city
                    playerPlaceCity();
                    break;
                default:
                    //Select something
            }
        }
        
        //Updatecount
        this.updateCount ++;
        if (this.updateCount >= 30) {
            this.updateCount = 0;
            for (let i of map) {
                for (let j of i) {
                    j.isClicked = false;
                    tileClicked = null;
                }
            }
        }
    }
};
game.state.add("main", game_state.main);
//game.state.start("main");


//Event Listeners (Clicking buttons)
newTurn.onclick = function() {
    nextTurn();
};
settleButton.onclick = function() {
    console.log("settleing");
    if (human.settlers > 0) {
        playerAction = "settle";
    }
    else {
        gameMessages.innerHTML = "Not enough settlers";
    }
};



updateText();
//Debug
mapLog();

function mapLog() {
    for (let i of map) {
        for (let j of i) {
            console.log(j.terrain);
        }
        
    }
}