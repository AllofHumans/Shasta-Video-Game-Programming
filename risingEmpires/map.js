//This is the Tile class and map array and map generation scripts
/*global game*/
const map = [];
const tilesOwners = [];
class Tile {
    constructor(terrain, x , y, output) {
        this.terrain = terrain; //terrian name
        this.passable = true;
        this.owner = null; /*Owner is an object:
        {
            player: human,
            city: 0  -- Int (index in list of cities)
        }
        */
        this.unit = null;
        this.building = null;
        this.x = x; //x in grid chords (Chords in our map array)
        this.y = y; //y grid chords 
        this.output = output; //Food, production, gold yeild - len 3 array
        this.isClicked = false;
    }
    
}
class Plains extends Tile {
    constructor(x, y) {
        super("plains", x, y, [2, 1, 1]);
        this.sprite = game.add.sprite(this.x * 100, this.y * 100, "plainsTile");
        this.sprite.inputEnabled = true;
        this.sprite.events.onInputDown.add(function() {
            this.isClicked = true;
        }, this);
    }
}


class TileOwnership {
    constructor(x, y, color) {
        this.sprite = game.add.sprite(x * 100, y * 100, color);
        this.sprite.visible = false;
        this.x = x;
        this.y = y;
    }
}

/*TERRAIN AND OUTPUT VALUES
Plains: [2, 1, 1]
Ocean: [2, 0, 2] (Impassable)
Desert: [0, 1, 3]
Fresh water: [3, 1, 0] (Impassable)
Fords: [3, 0, 1] 
Hill: [1, 2, 1]
Mountain: [0, 3, 1] (Impassable)
*/