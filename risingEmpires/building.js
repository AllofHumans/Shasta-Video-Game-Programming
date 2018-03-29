//Lists of builidng options
/*global game*/
class BuildingRef {
    constructor(name, cost, make, type, terrainRestrict=null) {
        this.name = name;
        this.terrainRestrict = terrainRestrict;
        this.cost = cost;
        this.make = make;
        this.type = type;
    }
}
//BuildingRef is used by city to make buildings




//City buildings
class CityBuilding {
    
}


//Tile buildings
//!!!X and Y are in grid chords, not game chords!!!
class TileBuilding {
    constructor(terrianRestrict, name, output, cost, x, y) {
        this.terrainRestrict = terrianRestrict;
        this.name = name;
        this.output = output; //Object with production, food, and gold values
        this.cost = cost; //int production cost
    }
}
class Farm extends TileBuilding {
    constructor(x, y) {
        this.sprite = game.add.sprite(x * 100, y * 100, "farmTile");
        super("plains", "farm", {
            production: 0,
            food: 2,
            gold: 0
        }, 10, x, y);
    }
}


//Units
class UnitBuilding {
    
}

//ARRAYS
const cityBuildingRefs = [
    //Full of BuildingRef objects for city buildings
    ];
const tileBuildingRefs = [
    //Full of BuildingRef objects for tile buildings
    //Farm
    new BuildingRef("farm", 10, function() {
        return new Farm(this.x, this.y);
    }, "tile")
    
    ];
const unitBuildingRefs = [
    //Full of BuildingRef objects for unit building
    ];

const buildingRefs = [cityBuildingRefs, tileBuildingRefs, unitBuildingRefs];