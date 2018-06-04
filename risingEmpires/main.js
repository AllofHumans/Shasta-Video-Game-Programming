/*global Phaser, game, game_state*/
/*global map, Plains, TileOwnership, tilesOwners*///In map.js
/*global buildingRefs*///In building.js
/*global Swordsman*///In units.js
//Document refs
//Messages
const goldText = document.getElementById("goldText");
const settlerText = document.getElementById("settlerText");
const turnText = document.getElementById("turnText");
const gameMessages = document.getElementById("gameMessages");
//UI HTML stuff
const cityInfoHTML = {
    div: document.getElementById("cityInfo"),
    name: document.getElementById("cityNameInfo"),
    level: document.getElementById("cityLevelInfo"),
    pop: document.getElementById("cityPopInfo"),
    food: document.getElementById("cityFoodInfo"),
    production: document.getElementById("cityProductionInfo"),
    gold: document.getElementById("cityGoldInfo"),
    buildingNow: document.getElementById("cityNowBuildingInfo"),
    buildings: document.getElementById("cityBuildingInfo")
};
const tileInfoHTML = {
    div: document.getElementById("tileInfo"),
    type: document.getElementById("tileTypeInfo"),
    food: document.getElementById("tileFoodInfo"),
    production: document.getElementById("tileProductionInfo"),
    gold: document.getElementById("tileGoldInfo"),
    owner: document.getElementById("tileOwnerInfo")
};
const unitInfoHTML = {
    div: document.getElementById("unitInfo"),
    type: document.getElementById("unitTypeInfo"),
    health: document.getElementById("unitHealthInfo"),
    attack: document.getElementById("unitAttackInfo"),
    defense: document.getElementById("unitDefenseInfo"),
    canMove: document.getElementById("unitCanMove")
};
hideSelectInfo();



//Buttons
const newTurn = document.getElementById("nextTurn");
const settleButton = document.getElementById("settle");
const moveUnitButton = document.getElementById("moveUnit");
//IN GAME VARS/OBJECTS AND CLASSES

//UI data
const updateQueue = []; //array of cities that need update by player
let tileClicked = null;
let unitClicked = null;
let playerAction = null;
let canChangeInfo = true;

//Data
const worldData = {
    turnCount: 0,
    cities: [],
};
class Player { //All players are of this class, including human and raider players
    constructor(id, pos, color) {
        this.gold = 0;
        this.id = id;
        this.name = "";
        this.units = [];
        this.listpos = pos;
        this.settlers = 10;
        this.color = color; //ID for color tile
        this.ownedTiles = [];
    }
}

const human = new Player("human", null, "blueTile");

const ai = [];
ai.push(new Player("raider", 0, "redTile"));


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
        this.hp = 100;
        this.tile = tile; //Tile object
        this.buildingIncome = {
            production: 3,
            food: 3,
            gold: 3
        }; //Income from buildings
        this.levelup();
        this.buildings = []; //List of building objects in city
        this.currentBuild = {}; //What city is building: should have a .cost property: BuildingRef object
    }
    get tilesInRange() {
        let tileCount = [];
        switch (this.level) { //Claims tiles and modifies income
            case 1:
                tileCount.push(map[this.tile.x][this.tile.y]);
                break;
            case 2:
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (typeof(map[this.tile.x+i]) !== "undefined") {
                            if (typeof(map[this.tile.x+i][this.tile.y+j]) !== "undefined") {
                                tileCount.push(map[this.tile.x+i][this.tile.y+j]);
                            }
                        }
                    }
                }
                break;
            case 3:
                for (let i = -2; i < 3; i++) {
                    for (let j = -2; j < 3; j++) {
                        if (typeof(map[this.tile.x+i]) !== "undefined") {
                            if (typeof(map[this.tile.x+i][this.tile.y+j]) !== "undefined") {
                                tileCount.push(map[this.tile.x+i][this.tile.y+j]);
                            }
                        }
                    }
                }
        } 
        return tileCount;
    } //Gets array of all tile objects affected by city
    calcIncome() {
        this.income.food = this.buildingIncome.food;
        this.income.gold = this.buildingIncome.gold;
        this.income.production = this.buildingIncome.production;
        for (let i of this.tilesInRange) {
            this.income.food += i.output[0];
            this.income.production += i.output[1];
            this.income.gold += i.output[2];
            if (i.building) {
                this.income.production += i.building.output.production;
                this.income.gold += i.building.output.gold;
                this.income.food += i.building.output.food;
            }
        }
    }
    levelup() { //Runs on creation and if called by updateCity - Should update sprite and set tile ownership and income
        this.level ++;
        for (let tile of this.tilesInRange) {
            tile.owner = {
                player: this.owner,
                city: this
            };
            //Paint tiles
            tilesOwners[tile.x][tile.y].sprite.loadTexture(this.owner.color);
            tilesOwners[tile.x][tile.y].sprite.visible = true;
        }
        this.calcIncome();
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
        this.calcIncome();
    }
    startTileBuild(x, y, type, build) { //Type is 0-2 0 is city, 1 is tile, 2 is unit; Build is list pos of target
        //x and y are in gird chords, not game chords
        this.currentBuild = JSON.parse(JSON.stringify(buildingRefs[type][build]));
        this.currentBuild.x = x;
        this.currentBuild.y = y;
    }
    //Unit building
    buildUnit() {
        
    }

    
    updateCity() { //Runs at the end of each turn
        //Grow if pop is high enough
        this.population += this.income.food * 0.5;
        if (this.population > (this.level ^ 5) && this.level < 3) { //Upgrade city if pop is high enough - Cities cant upgrade past lvl 3
            this.levelup();
        }
        //subtract cost + build
        this.currentBuild.cost -= this.income.production;
        if (this.currentBuild.cost <= 0) {
            switch (this.currentBuild.type) { //What to do based on what type of thing is being built
                case "city":
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
function hideSelectInfo() {
    cityInfoHTML.div.style.display = "none";
    tileInfoHTML.div.style.display = "none";
    unitInfoHTML.div.style.display = "none";
}

function playerPlaceCity() {
    let x = tileClicked.x;
    let y = tileClicked.y;
    //Is it a legal spot?
    let legal = true;
    for (let i = -2; i < 3; i++) {
        for (let j = -2; j < 3; j++) {
            if (typeof(map[x + i ]) == "undefined") { //Check x value
                legal = false;
            }
            else if (typeof(map[x + i][y + j]) == "undefined") { //Check y value
                legal = false;
            }
            else if (map[x + i][y + j].building !== null) { //Check for other cities or buildings
                 legal = false;
            }
        }
    }
    if (legal) {
        let name = prompt("Please enter the name of your city:");
        if (name != null) { //Did the player hit cancel?
            //Create city
            playerAction = null;
            human.settlers --;
            updateText();
            tileClicked = null;
            hideSelectInfo();
            worldData.cities.push(new City(name, map[x][y], human));
            map[x][y].building = worldData.cities[-1];
        }
        else {
            tileClicked = null;
            return;
        }
    }
    else {
        gameTextAlert("You may not place a city here");
    }
}
function gameTextAlert(message) {
    gameMessages.innerHTML = message;
    setTimeout(function() {
        gameMessages.innerHTML = "";
    }, 1000);
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
        //Tile colors
        game.load.image("blueTile","assets/tileColors/blueTile.png");
        game.load.image("redTile", "assets/tileColors/redTile.png");
        game.load.image("purpleTile", "assets/tileColors/purpleTile");
        //Units
        game.load.spritesheet("archerHP", "assets/units/archerHP.png", 128, 64);
        game.load.spritesheet("swordsmanHP", "assets/units/swordsmanHP.png", 128, 64);
        game.load.spritesheet("spearmanHP", "assets/untis/spearmanHP.png", 128, 64);
        
    },
    create() {
        gameTextAlert("game state started");
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
        //Add tile ownership sprites
        for (let i = 0; i < 25; i++) {
            let column = [];
            for (let j = 0; j < 25; j++) {
                column.push(new TileOwnership(i, j, "blueTile"));
                
            }
            tilesOwners.push(column);
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
        //Is a tile clicked
        for (let column of map) {
            for (let item of column) {
                if (item.isClicked && canChangeInfo) {
                    if (item === tileClicked) {
                        //Clear everything clicked
                        tileClicked = null;
                        hideSelectInfo();
                        canChangeInfo = false;
                    }
                    else {
                        //We need to display info for tile
                        tileClicked = item;
                        hideSelectInfo();
                        
                        //This needs work
        
                        if (item.building == null) {
                            //Is not a city
                            tileInfoHTML.div.style.display = "block";
                            tileInfoHTML.type.innerHTML = item.terrain;
                            tileInfoHTML.food.innerHTML = item.output[0];
                            tileInfoHTML.production.innerHTML = item.output[1];
                            tileInfoHTML.gold.innerHTML = item.output[2];
                            if (item.owner) {
                                tileInfoHTML.owner.innerHTML = item.owner.player.name;
                            }
                            else {
                                tileInfoHTML.owner.innerHTML = "No Owner";
                            }
                        }
                        else {
                            //Is a city
                            cityInfoHTML.div.style.display = "block";
                            cityInfoHTML.level.innerHTML = item.building.level;
                            cityInfoHTML.name.innerHTML = item.building.name;
                            cityInfoHTML.pop.innerHTML = item.building.population;
                            cityInfoHTML.food.innerHTML = item.building.income.food;
                            cityInfoHTML.production.innerHTML = item.building.income.production;
                            cityInfoHTML.gold.innerHTML = item.building.income.gold;
                            cityInfoHTML.buildingNow.innerHTML = item.building.currentBuild;
                            cityInfoHTML.buildings.innerHTML = item.building.buildings;
                        }
                        canChangeInfo = false;
                    }
                }
            }
        }
        //Is a unit clicked
        for (let unit of human.units) {
            if (unit.isClicked && canChangeInfo) {
                if (unit === unitClicked) {
                    unitClicked = null;
                    hideSelectInfo();
                    canChangeInfo = false;
                }
                else {
                    tileClicked = null;
                    unitClicked = unit;
                    if (canChangeInfo) {
                        hideSelectInfo();
                    }
                    canChangeInfo = false;
                }
            }
        }
        //What to do when a something is clicked:
        if (tileClicked) {
            //console.log(playerAction);
            switch (playerAction) {
                case "settle":
                    //Settle a city
                    playerPlaceCity();
                    tileClicked = null;
                    hideSelectInfo();
                    break;
                case "moveUnit":
                    if (unitClicked) {
                        unitClicked.move(tileClicked.x, tileClicked.y);
                    }
                    else {
                        playerAction = null;
                    }
            }
        }
        else if (unitClicked) {
            
        }
        //Updatecount
        this.updateCount ++;
        if (this.updateCount >= 30) {
            this.updateCount = 0;
            canChangeInfo = true;
            for (let i of map) {
                for (let j of i) {
                    j.isClicked = false;
                }
            }
            for (let unit of human.units) {
                unit.isClicked = false;
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
        gameTextAlert("Not enough settlers");
    }
};
moveUnitButton.onclick = function() {
    if (unitClicked) {
        playerAction = "moveUnit";
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