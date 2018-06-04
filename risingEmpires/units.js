//UNITS 
/*global game, gameTextAlert, map*/

class Unit {
    constructor(x, y, hpsprite, owner) {
        this.hpsprite = game.add.sprite(x*100, y*100, hpsprite);
        this.frame = 0;
        this.hp = 80;
        this.cost = 50;
        this.owner = owner;
        this.canMove = true;
        this.isClicked = false;
        this.movement = 1;
        this.x = x;
        this.y = y;
        if (this.owner.units.length > 0) {
            this.id = this.owner.units[-1].id + 1;
        }
        this.sprite.events.onInputDown.add(function() {
            this.isClicked = true;
        }, this);
    }
    testhp() {
        if (this.hp <= 0) {
            this.hpsprite.destroy();
            this.owner.units.splice(this.id, 1);
        }
        else {
            this.frame = 8 - Math.floor(this.hp/10);
        }
    }
    move(targetx, targety) {
        if (this.canMove) {
            if (Math.abs(this.x - targetx) <= this.movement && Math.abs(this.y - targety) <= this.movement) {
                if (map[targetx, targety].unit == null) {
                    // if the tile is empty, we can move there
                    map[this.x, this.y].unit = null;
                    this.x = targetx;
                    this.y = targety;
                    this.hpsprite.x = this.x * 100;
                    this.hpsprite.y = this.x * 100;
                    map[this.x, this.y].unit = this;
                }
                else if (map[targetx, targety].unit.owner != this.owner) {
                    //Units fight
                }
                else {
                    //You cant move there
                    gameTextAlert("You cannot move there");
                }
            }
            else {
                gameTextAlert("That tile is too far away");
            }
        }
        else {
            gameTextAlert("This unit has already moved");
        }
    }
    
    static meleefight(attacking, defending) {
        attacking.hp -= defending.defense;
        defending.hp -= attacking.attack;
        attacking.testhp;
        defending.testhp;
    }
}

class Swordsman extends Unit() {
    constructor(x, y, owner) {
        super(x, y, "swordsmanHP", owner);
        this.attack = 15;
        this.defense = 10;
        this.movement = 2;
    }
}