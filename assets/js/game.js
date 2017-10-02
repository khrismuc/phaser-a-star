//Set the initial game paramters - Will start with 800x600 resolution and will use WebGL as a renderer and default back to Canvas if WebGL is not present.
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var easystar = new EasyStar.js(); //Lets get easy star in here. 
var bmd; //This will be the object that will take the pixel data of the scene.
var mainchar;
var walkableGrid;

//Assets that will be preloaded at start
function preload() {
    game.load.image('background', 'assets/room1.png'); //The game room background that will be loaded.
    game.load.image('walkablepath', 'assets/walkablepath.png'); //The room's walkable area.
    game.load.image('maincharacter', 'assets/character.png', 32, 48); //The main characters animated spritesheet who will be walking around the room.
    easystar.setIterationsPerCalculation(100);
    // easystar.enableDiagonals();
}

//The first function called when we start our game
function create() {
    //We are going to obtain the width and height of the background room.
    var backWidth = game.cache.getImage("background").width; var backHeight = game.cache.getImage("background").height;
    bmd = game.make.bitmapData(backWidth, backHeight); //Getting ready to determine the room size and get the pixel data of the walkable path.
    bmd.load('walkablepath'); //This will load the walkable path into memory. 
    game.add.sprite(0, 0, 'background'); // Will add the room background to the desktop. It will place the upper left part of the image to the upper left part of the screen.
    mainchar = game.add.sprite(200, 516, 'maincharacter'); // Will add the room background to the desktop. It will place the upper left part of the image to the upper left part of the screen.
    mainchar.anchor.x = 0.5;
    mainchar.anchor.y = 0.9;

    walkableGrid = []; //Lets make the grid that easy star will define as the walkable points. 
    var gridCollection;	 //This will collect the 2 dimensional array grids and push it to the walkableGrid.
    var walkableRGB = "rgba(255,0,255,1)"; //This is the RGB value of the area's the user can walk on. - Hot Pink is the RGB Color
    var color; //Will contain the pixel color of where the walkablepath search index is on.

    //Following code will begin at the top left corner of the walkable area and check each pixel for the hot pink color. If it finds it, it will add a 0. If not, 1. 
    for (y = 0; y < backHeight; y++) {
        gridCollection = [];
        for (x = 0; x < backWidth; x++) {
            color = bmd.getPixelRGB(x, y); //Store the color date of X and Y pixel
            gridCollection.push(color.rgba == walkableRGB ? 1 : 0);
            //Close up and then Push the Array to the walkable grid
        }
        walkableGrid.push(gridCollection);
    }

    bmd.destroy(); //let's destroy the walkable area path we created from view - we need to find a better way to do this process.
    easystar.setGrid(walkableGrid);  //Let's add the 2 dimensional grid array we just created to Easy star's pathfinding grid.
    easystar.setAcceptableTiles([1]); //Let's also make sure that easy star is aware that the 0 tiles are the tiles that the player can walk on.
    game.input.onDown.add(calculateWalkPath);

}

var path;
var pi;

function update() {

    easystar.calculate();

    if (path) {
        if (pi < path.length - 1) {
            pi++;
            mainchar.x = path[pi].x;
            mainchar.y = path[pi].y;
        }
        else path = null;
    }

}

function calculateWalkPath() {  //This function will be called every time the user clicks on a path to walk to. 

    var { x, y } = game.input;
    console.log("coords:", x, y, "area:", walkableGrid[y][x]);

    //Now let's calculate the path and presumably use tweening to move the character from it's current x and y position to it's next calculated position
    easystar.findPath(mainchar.x, mainchar.y, game.input.x, game.input.y, function (foundPath) {

        if (foundPath === null) {
            //Do something like a shrug animation from the character for not being able to find a path.
        } else {
            path = foundPath;
            pi = 0;
        }
    });
}