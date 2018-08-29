import { randomNumber } from './random';
import * as constants from './constants';

export const tryTargetShip = (field, ship, cellIndex, orientation) => {
    const startPosition = getPositionOfIndex(cellIndex);
    let noOtherShip = true;
    for (var i = 0; i<ship.size; i++) {
        let currentX = orientation === constants.ORIENTATION_HORIZONTAL? startPosition.x+i : startPosition.x;
        let currentY = orientation === constants.ORIENTATION_VERTICAL? startPosition.y+i : startPosition.y;
        if (currentX > 9 || currentY > 9) {
            return false;
        }
        var index = getIndexOfPosition({x: currentX, y: currentY});
        field[index].isTarget = true;
        
        if (strictPlacementMode)
        {
            // do additional checks round the current field
            for (var deltay = -1; deltay <= 1; deltay++)
            {
                let y = currentY + deltay;
                if (y >= 0 && y < 10) {
                    for (var deltax = -1; deltax <= 1; deltax++)
                    {
                        let x = currentX + deltax;
                        if (x >= 0 && x < 10)
                        {
                            noOtherShip = noOtherShip && field[getIndexOfPosition({x, y})].isEmpty;
                        } 
                    }
                }
            }
        }
        else {
            noOtherShip = noOtherShip && field[index].isEmpty;
        }
        
    }
    return noOtherShip;
}

const strictPlacementMode = true; // is an parameter. Should go to constants or elsewhere
                                  // note that the battle part relies on strictPlacementMode = true

const getIndexOfPosition = ({x, y}) => x+(y*10);

const getPositionOfIndex = (i) => {return {x: i%10, y: Math.floor(i/10)}}

export const  placeShipOnField = (field, shipToPlace, cellIndex, orientation) => {
    for (var i = 0; i<shipToPlace.size; i++) {
        let position = orientation === constants.ORIENTATION_HORIZONTAL? cellIndex+i : cellIndex+i*10;
        field[position].isEmpty = false;
        field[position].isTarget = false;
    }
}

export const  unplaceShipOnField = (field, shipToUnplace, cellIndex, orientation) => {
    for (var i = 0; i<shipToUnplace.size; i++) {
        let position = orientation === constants.ORIENTATION_HORIZONTAL? cellIndex+i : cellIndex+i*10;
        field[position].isEmpty = true;
        field[position].isTarget = false;
    }
}

const untryShip = (field, shipToUnplace, cellIndex, orientation) => {
    for (var i = 0; i<shipToUnplace.size; i++) {
        let position = orientation === constants.ORIENTATION_HORIZONTAL? cellIndex+i : cellIndex+i*10;
        if (position < 100) {
            field[position].isTarget = false;
        }
    }
}


// autoShipPlacement :: field, shipIndex => {placedShips, newShipIndex}
export const autoShipPlacement = (field, shipIndex) => {
    console.log("auto placement called with ship index: "+shipIndex);
    let ret = {placedShips: [], newShipIndex: shipIndex};
    let positions = []; 
    field.forEach(cell => {if (cell.isEmpty) {
        positions.push({cellIndex: cell.key, orientation: constants.ORIENTATION_HORIZONTAL});
        positions.push({cellIndex: cell.key, orientation: constants.ORIENTATION_VERTICAL});}
    });
    while (positions.length > 0)
    {
        let rnd = randomNumber(positions.length);
        let next = positions.slice(rnd, rnd+1)[0];
        // test
        let success = tryTargetShip(field, constants.SHIPS_TO_PLACE[shipIndex], next.cellIndex, next.orientation);
        if (success) {
            // place
            placeShipOnField(field, constants.SHIPS_TO_PLACE[shipIndex], next.cellIndex, next.orientation);
            // increase, return if end reached
            let nextIndex = shipIndex+1;
            if (nextIndex >= constants.NUM_SHIPS_TO_PLACE) {
                ret.newShipIndex = nextIndex;
                ret.placedShips = [{cellIndex: next.cellIndex, numShip: shipIndex, orientation: next.orientation}];
                return ret; 
            }
            // else recusrsion
            let recResult = autoShipPlacement(field, nextIndex);
            // return index höher: return 
            if  (recResult.newShipIndex > nextIndex) {
                ret.placedShips = [
                    {cellIndex: next.cellIndex,
                     numShip: shipIndex,
                     orientation: next.orientation}, ...recResult.placedShips];
                ret.newShipIndex = recResult.newShipIndex
                return ret;
            }
            // else unplace ship
            unplaceShipOnField(field, constants.SHIPS_TO_PLACE[shipIndex], next.cellIndex, next.orientation);
        }
        else {
            // untry ship and try again
            untryShip(field, constants.SHIPS_TO_PLACE[shipIndex], next.cellIndex, next.orientation);
        }
    }
    // no result
    return ret;
}

export const placeComputerShips = () => {
    let field = [];
    for (let i = 0; i < 100; i++)
    {
        field[i] = {key: i, isEmpty: true}
    }
    let ret = autoShipPlacement(field, 0);
    return ret.placedShips;

}

export const initializeField = (ships) => {
    // ship: cellIndex, numShip, orientation
    let ret = [];
    for (var i = 0; i < 100; i ++)
    {
        ret[i] = {key: i, state: constants.CS_WATER, isMouseOver: false}
    }
    ships.forEach((ship) => {
        // add new property to a ship. This mutates the ship!
        ship.numHits = 0;
        ship.destroyed = false; // still in use??
        let add = ship.orientation === constants.ORIENTATION_HORIZONTAL ? 1 : 10;
        for (let i = 0; i < constants.SHIPS_TO_PLACE[ship.numShip].size; i++) {
            let index = ship.cellIndex + i*add;
            ret[index].state = constants.CS_SHIP;
            ret[index].numShip = ship.numShip;
            ret[index].shipSize = constants.SHIPS_TO_PLACE[ship.numShip].size;
        }
    })
    return ret;
}


var computerLastHit = null;
var computerHitRoot = null;
var computerPhase = "random"; // random, searchDirection, direction1, direction2
var computerHitDirection = null;
var computerPossibleDirections = [];

const initPossibleDirection = () => ([{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}]);

const randomFieldIsValid = (index, field) => {  
    let base = getPositionOfIndex(index);
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            let newX = base.x + x;
            let newY = base.y +y;
            if (newX >= 0 && newX <= 9 && newY >= 0 && newY <= 9) {
                if (field[getIndexOfPosition({x: newX, y: newY})].state === constants.CS_HIT) {
                    return false;
                }
            }
        }
    }
    return true;
}

const nextRandomTarget = (field) => {
    let targets = [];
    for (let i = 0; i< 100; i++) {
        if (field[i].state === constants.CS_WATER || field[i].state === constants.CS_SHIP) {
            targets.push(i); 
        }
    }
    while (true) {
        let trial = randomNumber(targets.length);
        let trialIndex = targets[trial];
        if (randomFieldIsValid(trialIndex, field)){
            return trialIndex
        }
        targets.splice(trial, 1);
    }
}

const hitCountNeighbours = (field, pos) => {
    let neighbours = [
        {x: -1,y: -1},
        {x: 0, y: -1},
        {x: 1,y: -1},
        {x: -1,y: 0},
        {x: 1,y: 0},
        {x: -1,y: 1},
        {x: 0,y: 1},
        {x: 1,y: 1},
    ];
    let count = 0;
    neighbours.forEach((n) => {
        let p = {x: pos.x+n.x, y:pos.y+n.y};
        if(p.x >= 0 && p.x <= 9 && p.y >= 0 && p.y <= 9 && field[getIndexOfPosition(p)].state === constants.CS_HIT) {
            count++;
        }
    })
    return count;
}

export const nextComputerTarget = (field, ships) => {
    switch (computerPhase) {
        case 'random': {
            let target = nextRandomTarget(field);
            if (field[target].state === constants.CS_SHIP)
            {
                // prepare next phase: 
                computerLastHit = target;
                computerHitRoot = target;
                computerPhase = 'searchDirection';
                computerHitDirection = null;
                computerPossibleDirections = initPossibleDirection();
            }
            return target;
        }

        case 'searchDirection': {
            let target = null;
            do {
                let nextDirIndex = randomNumber(computerPossibleDirections.length)
                var nextDirOffset = computerPossibleDirections[nextDirIndex];
                computerPossibleDirections.splice(nextDirIndex, 1);
                var pos = getPositionOfIndex(computerHitRoot);
                pos = {x:pos.x+nextDirOffset.x, y:pos.y+nextDirOffset.y};
                target = getIndexOfPosition(pos);
            } while (pos.x < 0 || pos.x > 9 || pos.y < 0 || pos.y > 9 || field[target].state === constants.CS_MISS || hitCountNeighbours(field, pos) > 1)
            if (field[target].state === constants.CS_SHIP)
            {
                // new target will hit.
                computerLastHit = target;
                // if ship will be destroyed, next phase is random, else direction1
                let ship = ships[field[target].numShip];
                if (field[target].shipSize <= ship.numHits+1) {
                    computerPhase = 'random';
                }
                else {
                    computerPhase = 'direction1'; 
                    computerHitDirection = nextDirOffset;
                }
            }
            return target;
        }

        case 'direction1': { 
            // if out of field, OR MISSED: reverse immediately
            let p = getPositionOfIndex(computerLastHit);
            p = {x:p.x+computerHitDirection.x, y:p.y+computerHitDirection.y};
            let target = getIndexOfPosition(p);
            if (p.x <0 || p.x > 9 || p.y< 0 || p.y > 9            
                || field[target].state === constants.CS_MISS
                || hitCountNeighbours(field,target) > 0 ) {  // > 1funktioniert nicht!!!! must be > 0 !!
                // we need to search the other direction.
                computerHitDirection = {x:- computerHitDirection.x, y:-computerHitDirection.y};
                computerPhase = 'direction2';
                computerLastHit = computerHitRoot;
                let pp = getPositionOfIndex(computerLastHit);
                pp = {x:pp.x+computerHitDirection.x, y:pp.y+computerHitDirection.y};
                target = getIndexOfPosition(pp);
                // we know this must be a hit
            }
            else if (field[target].state === constants.CS_WATER) {
                // if water, reverse for next time
                computerHitDirection = {x:-computerHitDirection.x, y:-computerHitDirection.y};
                computerPhase = 'direction2';
                computerLastHit = computerHitRoot;
                return target;
            }

            // hit. check for destroyed and continue
            computerLastHit = target;
            let ship = ships[field[target].numShip]; // MISSED nicht abgefragt!!
            if (field[target].shipSize <= ship.numHits+1) {
                computerPhase = 'random';
            }
            return target;
        } 
        
        default: {
            let p= getPositionOfIndex(computerLastHit);
            p = {x:p.x+computerHitDirection.x, y:p.y+computerHitDirection.y};
            let target = getIndexOfPosition(p);
            computerLastHit = target;
            // just check for destroyed and goto random in this case
            let ship = ships[field[target].numShip];
            if (field[target].shipSize <= ship.numHits+1) {
                computerPhase = 'random';
            }
            return target;
        }
            
    }

}

