
export const SHIPS_TO_PLACE = [
                             {size: 5, designation: 'Schlachtschiff'},                            
                             {size: 4, designation: 'Zerstörer'},
                             {size: 4, designation: 'Zerstörer'},
                             {size: 3, designation: 'Fregatte'},
                             {size: 3, designation: 'Fregatte'},
                             {size: 3, designation: 'Fregatte'},
                             {size: 2, designation: 'U-Boot'},
                             {size: 2, designation: 'U-Boot'}];
export const NUM_SHIPS_TO_PLACE = SHIPS_TO_PLACE.length;

export const NUM_HITS_FOR_VICTORY = (() => {let count = 0; SHIPS_TO_PLACE.forEach((s)=>{count = count + s.size;}); return count;})();
//console.log(NUM_HITS_FOR_VICTORY);

export const ORIENTATION_VERTICAL = 'vertical'
export const ORIENTATION_HORIZONTAL = 'horizontal'

// Battle States
export const BS_PLAYER_AIMING = 'PlayerAiming';         // Player is selecting a field for the next shot
export const BS_PLAYER_SHOT = 'PlayerShooting';         // Player shots
export const BS_COMPUTER_SHOT = 'ComputerShooting';     // Computer is shooting to a field (time delay and color)
export const BS_COMPUTER_AIMING = 'ComputerAiming';     // time delay before shot
export const BS_PLAYER_WON = 'PlayerWon';           // Player has won the game
export const BS_COMPUTER_WON = 'ComputerWon';       // Computer has won the game

// Results of a shot
export const SHOTRESULT_HIT = 'Hit';
export const SHOTRESULT_DESTROYED ="Destroyed";
export const SHOTRESRESULT_WATER = 'Water'; 

// Cell States = content
export const CS_HIT = 'Hit';
export const CS_SHIP = 'Ship';
export const CS_WATER = 'Water';
export const CS_MISS = 'Missed';






