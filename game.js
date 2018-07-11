// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}

function collidePlatform(thingPosition, thingSize) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(thingPosition, thingSize, pos, size)) {
            return true;
        }
    }
    return false;
}

function collideGoodThing(thingPosition, thingSize) {
    var goodThings = svgdoc.getElementById('goodThings');
    for (var i = 0; i< goodThings.childNodes.length; i++) {
        var node = goodThings.childNodes.item(i);
        if (node.nodeName != 'use') continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var pos = new Point(x, y);
        if (intersect(thingPosition, thingSize, pos, GOOD_THING_SIZE)) return true;
    }
    return false;
}

// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.facingDirection = FacingDirection.RIGHT;
    this.name = defaultName;
}

Player.prototype.setName = function(name) {
    this.name = name;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        //if (node.getAttribute('id') == 'vertical') continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) {
            if (node.getAttribute('type') == 'disappearing') {
                var platformOpacity = parseFloat(node.style.getPropertyValue("opacity"));
                platformOpacity -= 0.1;
                node.style.setProperty("opacity", platformOpacity, null);
                if (platformOpacity <= 0.0) {
                    platforms.removeChild(node);
                }
            }
            return true;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) {
        return true;
    }

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        //if (node.getAttribute('id') == 'vertical') continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var MONSTER_SIZE = new Size(55, 34);        // The size of a monster
var GOOD_THING_SIZE = new Size(30, 20);
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(2, 20);     // The initial position of the player
var PORTAL_SIZE = new Size(80, 20);
var EXIT_SIZE = new Size(60, 40);
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var GAME_INTERVAL = 25;                     // The time interval of running the game
var GAME_TIME = 60;
var BULLET_SIZE = new Size(10, 10);
var BULLET_SPEED = 10.0;
var SHOOT_INTERVAL = 200.0;
var MONSTER_SHOOT_INTERVAL = 2000.0;
var MONSTER_SPEED = 2;
var MIN_NUM_OF_MONSTERS = 6;
var NUM_OF_GOOD_THINGS_PER_LEVEL = 8;

var ZOOM_SCALE_BONUS = 2;
var ZOOM_SCALE_BONUS_FOR_SHOOTING_MONSTER = 3;
var POINT_OF_GOOD_THING = 2;
var POINT_OF_SHOOTING_MONSTER = 3;
//var GAME_LEVEL_BONUS = 100;
var TIME_REMAINING_BONUS = 1;

var BACKGROUND_MUSIC = null
var SHOOTING_SOUND = null;
var EXIT_SOUND = null;
var GAMEOVER_SOUND = null;
var MONSTER_DIE_SOUND = null;

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2, UP:3, DOWN:4}; // Motion enum
var FacingDirection = {LEFT: 0, RIGHT:1};   // Facing Direction enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var isZoom = false;
var canShoot = true;
var monsterCanShoot = true;
var score = 0;                              // The score of the game
var gameLevel = 1;                          // Level of the game
var timeRemaining = 0;                     // Time remaining
var timeInterval = null;
var numberOfBullet = 8;                     // Number of bullets
var numberOfGoodThingsRemaining = 0;        // Number of good thing remaining

var cheatMode = false;

var defaultName = "Anonymous";

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Load the sound
    BACKGROUND_MUSIC = document.createElement("AUDIO");
    BACKGROUND_MUSIC.setAttribute("src", "./sound/bgm.wav");
    document.body.appendChild(BACKGROUND_MUSIC);

    SHOOTING_SOUND = document.createElement("AUDIO");
    SHOOTING_SOUND.setAttribute("src", "./sound/shooting.wav");
    SHOOTING_SOUND.volume = 0.4;
    document.body.appendChild(SHOOTING_SOUND);

    EXIT_SOUND = document.createElement("AUDIO");
    EXIT_SOUND.setAttribute("src", "./sound/exit_door.mp3");
    document.body.appendChild(EXIT_SOUND);

    WIN_SOUND = document.createElement("AUDIO");
    WIN_SOUND.setAttribute("src", "./sound/gamewin.mp3");
    document.body.appendChild(WIN_SOUND);

    GAMEOVER_SOUND = document.createElement("AUDIO");
    GAMEOVER_SOUND.setAttribute("src", "./sound/gameover.wav");
    document.body.appendChild(GAMEOVER_SOUND);

    MONSTER_DIE_SOUND = document.createElement("AUDIO");
    MONSTER_DIE_SOUND.setAttribute("src", "./sound/monsterdie.wav");
    document.body.appendChild(MONSTER_DIE_SOUND);
}

function restartGame() {
    score = 0;
    cheatMode = false;
    svgdoc.getElementById("player_character").style.setProperty("opacity", 1, null);
    zoom = 1.0;
    isZoom = false;
    clearMonsters();
    clearGoodThings();
    clearDisappearingPlatforms();
    createDisappearingPlatform(520, 460, 80, 20);
    createDisappearingPlatform(0, 460, 80, 20);
    createDisappearingPlatform(0, 120, 100, 20);
    updateScore(score);
    //gameLevel = 1;
    svgdoc.getElementById('highscoretable').style.setProperty("visibility", "hidden", null);
    svgdoc.getElementById('startingScreen').style.setProperty("visibility", "visible", null);
    //startGame();
}

function startGame() {
    // Hide the starting screen
    svgdoc.getElementById('startingScreen').style.setProperty("visibility", "hidden", null);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    player = new Player();
    player.position = PLAYER_INIT_POS;
    updateScreen();
    if (gameLevel == 1) {
        // Ask player what is your name
        var playerName = window.prompt("What is your name?");

        if (playerName == null || playerName.length == 0 || playerName == '') {
            playerName = defaultName;
        } else {
        	defaultName = playerName;
        }
    
        // Set the player name
        svgdoc.getElementById('playerName').firstChild.data = playerName;

        // Create the player
        player.setName(playerName);

        playSound(BACKGROUND_MUSIC);
    }

    numberOfBullet = 8;
    
    if (cheatMode) {
        svgdoc.getElementById("numberOfBullet").firstChild.data = 'Infinite';
        svgdoc.getElementById("timeRemaining").firstChild.data = 'Infinite';
        svgdoc.getElementById("cheatMode").firstChild.data = 'On';
    } else {
        svgdoc.getElementById("numberOfBullet").firstChild.data = numberOfBullet;
        svgdoc.getElementById("cheatMode").firstChild.data = 'Off';
    }

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    // Set the level;
    //svgdoc.getElementById('level').firstChild.data = gameLevel;

    // create many monster
    createMonsters((gameLevel - 1) * 4 + MIN_NUM_OF_MONSTERS);
    createGoodThings(NUM_OF_GOOD_THINGS_PER_LEVEL);

    // Set timer
    timeRemaining = GAME_TIME;
    svgdoc.getElementById("timeRemaining").firstChild.data = timeRemaining;
    timeInterval = setTimeout('updateTimer()', 1000);

    
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.facingDirection = FacingDirection.LEFT;
            break;
        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.facingDirection = FacingDirection.RIGHT;
            break;
        case "W".charCodeAt(0):
            if (player.isOnPlatform() || cheatMode) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case 32: // space
            if (numberOfBullet <= 0 ) {
                canShoot = false;
            }
            if (canShoot || cheatMode) {
                shootBullet();
            }
            break;
        case "C".charCodeAt(0):
            cheatMode = true;
            svgdoc.getElementById("cheatMode").firstChild.data = 'On';
            svgdoc.getElementById("numberOfBullet").firstChild.data = 'Infinite';
            svgdoc.getElementById("player_character").style.setProperty("opacity", 0.5, null);
            break;
        case "V".charCodeAt(0):
            cheatMode = false;
            svgdoc.getElementById("cheatMode").firstChild.data = 'Off';
            svgdoc.getElementById("numberOfBullet").firstChild.data = numberOfBullet;
            svgdoc.getElementById("player_character").style.setProperty("opacity", 1, null);
            break;
        default:
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check game timer
    if (timeRemaining <= 0) {
        gameOver();
    }

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    moveMonsters();
    moveBullets();
    monsterTryToShootBullet();
    collisionDetection();
    updateScreen();
}

function zoomFunction() {
    zoom = 2.0
    isZoom = true;
    startGame();
}

function updateScore(newScore) {
    svgdoc.getElementById("score").firstChild.data = newScore;
}

function updateTimer() {
    svgdoc.getElementById("timeRemaining").firstChild.data = --timeRemaining;
    svgdoc.getElementById("timeRemainingBar").setAttribute("width", 140 * timeRemaining/GAME_TIME);
    timeInterval = setTimeout('updateTimer()', 1000);
}

function gameOver() {
    // Clear the game interval
    clearTimeout(timeInterval);
    clearInterval(gameInterval);
    BACKGROUND_MUSIC.pause();
    playSound(GAMEOVER_SOUND);
    svgdoc.getElementById('highscoretable').getElementsByTagName('rect')[0].style.setProperty("fill", "red", null);
    svgdoc.getElementById("playerinfo").textContent = player.name + ", you get " + score + " points.";

    // Get the high score table from cookies
    table = getHighScoreTable();

    // Create the new score record
    var record = new ScoreRecord(player.name, score);

    // Insert the new score record
    var pos = table.length;
    for (var j = 0; j < table.length; j++) {
        if (record.score > table[j].score) {
            pos = j;
            break;
        }
    }
    table.splice(pos, 0, record);

    // Store the new high score table
    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table, pos);
}

function gameWin() {
    // Time remaining score

    if (isZoom) {
        score += timeRemaining * TIME_REMAINING_BONUS * ZOOM_SCALE_BONUS;
    } else {
        score += timeRemaining * TIME_REMAINING_BONUS;
    }


    svgdoc.getElementById('highscoretable').getElementsByTagName('rect')[0].style.setProperty("fill", "green", null);
    svgdoc.getElementById("playerinfo").firstChild.data = player.name + ", you get " + score + " points.";
    // Clear the game interval
    clearTimeout(timeInterval);
    clearInterval(gameInterval);
    BACKGROUND_MUSIC.pause();
    playSound(WIN_SOUND);

    // Get the high score table from cookies
    table = getHighScoreTable();

    // Create the new score record
    var record = new ScoreRecord(player.name, score);

    // Insert the new score record
    var pos = table.length;
    for (var j = 0; j < table.length; j++) {
        if (record.score > table[j].score) {
            pos = j;
            break;
        }
    }
    table.splice(pos, 0, record);

    // Store the new high score table
    setHighScoreTable(table);

    // Show the high score table
    showHighScoreTable(table, pos);
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    var transform;
    if (player.facingDirection == FacingDirection.LEFT) {
        transform = "translate(" + player.position.x + "," + player.position.y + ")" + "translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)";
    } else {
        transform = "translate(" + player.position.x + "," + player.position.y + ")";
    }

    svgdoc.getElementById("playerName").setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    player.node.setAttribute("transform", transform);
    var px = player.position.x + PLAYER_SIZE.w / 2;
    var py = player.position.y + PLAYER_SIZE.h / 2;
    var tx = -(px * zoom - SCREEN_SIZE.w / 2);
    var ty = -(py * zoom - SCREEN_SIZE.h / 2);
    if (tx > 0) {
        tx = 0;
    } else if (tx < SCREEN_SIZE.w - SCREEN_SIZE.w * zoom) {
        tx = SCREEN_SIZE.w - SCREEN_SIZE.w * zoom;
    }
    if (ty > 0) {
        ty = 0;
    } else if (ty < SCREEN_SIZE.h - SCREEN_SIZE.h * zoom) {
        ty = SCREEN_SIZE.h - SCREEN_SIZE.h * zoom;
    }
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + tx + "," + ty + ") scale(" + zoom + ")");
}

function clearDisappearingPlatforms() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;        
        if (node.getAttribute('type') == 'disappearing') {
            platforms.removeChild(node);
            i--;
        }
    }    
}

function createDisappearingPlatform(x, y, w, h) {
    // <rect type="disappearing" x="520" y="460" width="80" height="20" style="fill:#9370DB"; opacity:1" />
    var platform = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    platform.setAttribute('type', 'disappearing');
    platform.setAttribute('x', x);
    platform.setAttribute('y', y);
    platform.setAttribute('width', w);
    platform.setAttribute('height', h);
    platform.style.setProperty('fill', '#9370DB', null);
    platform.style.setProperty('opacity', 1.0, null);
    svgdoc.getElementById('platforms').appendChild(platform);
}

function createMonsters(numOfMonsters) {
    for (var i = 0; i < numOfMonsters; i++) {
        var x = 0, y = 0;
        
        do {
        	//should not be closed to the player
            x = 100 + Math.floor(Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w - 100));
            y = 100 + Math.floor(Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h - 100));
            monsterInitPos = new Point(x,y);
        } while (intersect(PLAYER_INIT_POS, PLAYER_SIZE, monsterInitPos, MONSTER_SIZE));
        
        if (i == 0) {
            createShootingMonster(x, y);
        } else {
            createMonster(x, y);    
        }
    }
}

function clearMonsters() {
	var monsters = svgdoc.getElementById("monsters");
	for (var i = 0; i < monsters.childNodes.length; i++) {
		monsters.removeChild(monsters.childNodes.item(i--));
	}
    var monsterBullets = svgdoc.getElementById("monsterBullets");
    for (var i = 0; i < monsterBullets.childNodes.length; i++) {
        monsterBullets.removeChild(monsterBullets.childNodes.item(i--));
    }
}

function createMonster(x, y) {
    var monster = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('monsters').appendChild(monster);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("x", 0);
    monster.setAttribute("y", 0);
    monster.setAttribute("xx", x);
    monster.setAttribute("yy", y);
    monster.setAttribute("x0", x);
    monster.setAttribute("y0", y);
    monster.setAttribute("x1", x);
    monster.setAttribute("y1", y);
    monster.setAttribute("rd", "0");
    monster.setAttribute("transform", "translate(" + x + "," + y + ")");
    monster.setAttribute("direction", FacingDirection.RIGHT);
}

function createShootingMonster(x, y) {
    var monster = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('monsters').appendChild(monster);
    monster.setAttribute('id', 'bossMonster');
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    monster.setAttribute("x", 0);
    monster.setAttribute("y", 0);
    monster.setAttribute("xx", x);
    monster.setAttribute("yy", y);
    monster.setAttribute("x0", x);
    monster.setAttribute("y0", y);
    monster.setAttribute("x1", x);
    monster.setAttribute("y1", y);
    monster.setAttribute("rd", "0");
    monster.setAttribute("transform", "translate(" + x + "," + y + ")");
    monster.setAttribute("direction", FacingDirection.RIGHT);
    monster.setAttribute("shooting", 1);
}

function moveMonsters() {
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        var currX = parseInt(node.getAttribute("xx"));
        var currY = parseInt(node.getAttribute("yy"));
        var oriX = parseInt(node.getAttribute("x0"));
        var oriY = parseInt(node.getAttribute("y0"));
        var tarX = parseInt(node.getAttribute("x1"));
        var tarY = parseInt(node.getAttribute("y1"));
        var rand = parseInt(node.getAttribute("rd"));

        if (tarX >= currX){
            node.setAttribute("transform", "translate(" + (currX + MONSTER_SIZE.w) + "," + currY + ") scale (-1, 1)");
            node.setAttribute("direction", FacingDirection.RIGHT);
        } else{
            node.setAttribute("transform", "translate(" + currX + "," + currY + ")");
            node.setAttribute("direction", FacingDirection.LEFT);
        }

        node.setAttribute("xx", tarX > currX ? currX + rand : currX - rand);
        node.setAttribute("yy", tarY > currY ? currY + Math.sqrt(MONSTER_SPEED * MONSTER_SPEED - rand * rand) : currY - Math.sqrt(MONSTER_SPEED * MONSTER_SPEED - rand * rand));
        
        if ((oriX <= tarX && parseInt(node.getAttribute("xx")) >= tarX) || (oriY <= tarY && parseInt(node.getAttribute("yy")) >= tarY) || (oriX >= tarX && parseInt(node.getAttribute("xx")) <= tarX) || (oriY >= tarY && parseInt(node.getAttribute("yy")) <= tarY)) {
            node.setAttribute("x1", Math.floor(Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w)));
            node.setAttribute("y1", Math.floor(Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h)));
            node.setAttribute("x0", currX);
            node.setAttribute("y0", currY);
            node.setAttribute("rd", Math.random() * MONSTER_SPEED);
        }
    }
}

function createGoodThings(numberOFGoodThings) {
    numberOfGoodThingsRemaining = numberOFGoodThings;

    for (var i = 0; i < numberOFGoodThings; i++) {
        var x = 0, y = 0;
        do {
            x = Math.floor(Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w));
            y = Math.floor(Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h));
            goodThingInitPos = new Point(x,y);
        } while (intersect(PLAYER_INIT_POS, PLAYER_SIZE, goodThingInitPos, GOOD_THING_SIZE) || collidePlatform(goodThingInitPos, GOOD_THING_SIZE) || collideGoodThing(goodThingInitPos, GOOD_THING_SIZE));

        createGoodThing(x, y);
    }
}

function createGoodThing(x, y) {
    var goodThing = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
    svgdoc.getElementById('goodThings').appendChild(goodThing);
    goodThing.setAttribute('x', x);
    goodThing.setAttribute('y', y);
    goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodThing");
}

function clearGoodThings() {
    var goodThings = svgdoc.getElementById("goodThings");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        goodThings.removeChild(goodThings.childNodes.item(i--));
    }
}

function shootBullet() {
    // Play sound
    playSound(SHOOTING_SOUND);

    // Disable shooting for a short period of time
    canShoot = false;
   
    // Create the bullet by createing a use node
    var bullet = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');

    // Calculate and set the position of the bullet
    var x = player.position.x + PLAYER_SIZE.w / 2;
    var y = player.position.y + PLAYER_SIZE.h / 2;
    bullet.setAttribute('x', x);
    bullet.setAttribute('y', y);

    bullet.setAttribute('direction', player.facingDirection);

    // Set the href of the use node to the bullet defined in the defs node
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");

    // Append the bullet to the bullet group
    svgdoc.getElementById('bullets').appendChild(bullet);

    setTimeout("canShoot = true", SHOOT_INTERVAL);

    if (!cheatMode) {
        svgdoc.getElementById("numberOfBullet").firstChild.data = --numberOfBullet;
    }
}

function monsterTryToShootBullet() {
    if (monsterCanShoot && (parseInt(Math.random() * 100) % 50) == 0) {
        monsterShootBullet();
    }
}

function monsterShootBullet() {
    monsterCanShoot = false;
    var monster = svgdoc.getElementById("bossMonster");
    if (monster != null) {
        var bullet = svgdoc.createElementNS('http://www.w3.org/2000/svg', 'use');
        var x = parseInt(monster.getAttribute('xx')) + MONSTER_SIZE.w / 2;
        var y = parseInt(monster.getAttribute('yy')) + MONSTER_SIZE.h / 2;
        bullet.setAttribute('x', x);
        bullet.setAttribute('y', y);
        bullet.setAttribute('direction', parseInt(monster.getAttribute('direction')));
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterBullet");
        svgdoc.getElementById('monsterBullets').appendChild(bullet);
    }
    setTimeout("monsterCanShoot = true", MONSTER_SHOOT_INTERVAL);
}

function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        if (parseInt(node.getAttribute('direction')) == FacingDirection.LEFT) {
            node.setAttribute('x', parseInt(node.getAttribute('x')) - BULLET_SPEED);
        } else {
            node.setAttribute('x', parseInt(node.getAttribute('x')) + BULLET_SPEED);
        }
        
        // If the bullet is not inside the screen delete it from the group
        if (parseInt(node.getAttribute('x')) > SCREEN_SIZE.w) {
            bullets.removeChild(node);
            i--;
        }
    }

    // Go through all monster bullets
    var monsterBullets = svgdoc.getElementById("monsterBullets");
    for (var i = 0; i < monsterBullets.childNodes.length; i++) {
        var node = monsterBullets.childNodes.item(i);

        // Update the position of the bullet
        if (parseInt(node.getAttribute('direction')) == FacingDirection.LEFT) {
            node.setAttribute('x', parseInt(node.getAttribute('x')) - BULLET_SPEED);
        } else {
            node.setAttribute('x', parseInt(node.getAttribute('x')) + BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (parseInt(node.getAttribute('x')) > SCREEN_SIZE.w) {
            monsterBullets.removeChild(node);
            i--;
        }
    }
}

function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");

    if (!cheatMode) {
        for (var i = 0; i < monsters.childNodes.length; i++) {
            var monster = monsters.childNodes.item(i);

            // For each monster check if it overlaps with the player
            // if yes, stop the game
            var monsterX = parseInt(monster.getAttribute('xx'));
            var monsterY = parseInt(monster.getAttribute('yy'));
            var monsterPosition = new Point(monsterX, monsterY);
            if (intersect(player.position, PLAYER_SIZE, monsterPosition, MONSTER_SIZE)) {
                gameOver();
                return;
            }
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var bulletX = parseInt(bullet.getAttribute('x'));
        var bulletY = parseInt(bullet.getAttribute('y'));
        var bulletPosition = new Point(bulletX, bulletY);

        // For each bullet check if it overlaps with any monster
        // if yes, remove both the monster and the bullet
        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var monsterX = parseInt(monster.getAttribute('xx'));
            var monsterY = parseInt(monster.getAttribute('yy'));
            var monsterPosition = new Point(monsterX, monsterY);
            if (intersect(bulletPosition, BULLET_SIZE, monsterPosition, MONSTER_SIZE)) {
                bullets.removeChild(bullet);
                monsters.removeChild(monster);
                i--;
                j--;

                if (isZoom) {
                    score += ZOOM_SCALE_BONUS_FOR_SHOOTING_MONSTER * POINT_OF_SHOOTING_MONSTER;
                } else {
                    score += POINT_OF_SHOOTING_MONSTER;
                }

                updateScore(score);
                playSound(MONSTER_DIE_SOUND);
            }
        }
    }

    if (!cheatMode) {
        var monsterBullets = svgdoc.getElementById("monsterBullets");
        for (var i = 0; i < monsterBullets.childNodes.length; i++) {
            var bullet = monsterBullets.childNodes.item(i);
            var bulletX = parseInt(bullet.getAttribute('x'));
            var bulletY = parseInt(bullet.getAttribute('y'));
            var bulletPosition = new Point(bulletX, bulletY);
            if (intersect(bulletPosition, BULLET_SIZE, player.position, PLAYER_SIZE)) {
                monsterBullets.removeChild(bullet);
                gameOver();
                return;
            }
        }
    }

    // Check whether the player collides with a good thing
    var goodThings = svgdoc.getElementById("goodThings");
    for (var i = 0; i < goodThings.childNodes.length; i++) {
        var goodThing = goodThings.childNodes.item(i);
        var goodThingX = parseInt(goodThing.getAttribute('x'));
        var goodThingY = parseInt(goodThing.getAttribute('y'));
        var goodThingPosition = new Point(goodThingX, goodThingY);
        if (intersect(player.position, PLAYER_SIZE, goodThingPosition, GOOD_THING_SIZE)) {
            goodThings.removeChild(goodThing);
            i--;
            numberOfGoodThingsRemaining--;
            if (isZoom) {
                score += ZOOM_SCALE_BONUS * POINT_OF_GOOD_THING;
            } else {
                score += POINT_OF_GOOD_THING;
            }

            updateScore(score);
        }
    }

    // Check Portal
    var portal1 = svgdoc.getElementById("portal1");
    var portal1X = parseInt(portal1.getAttribute('x'));
    var portal1Y = parseInt(portal1.getAttribute('y'));
    var portal1Position = new Point(portal1X, portal1Y);
    if (intersect(player.position, PLAYER_SIZE, portal1Position, PORTAL_SIZE)) {
        player.position = new Point(280, 500);
    }

    var portal2 = svgdoc.getElementById("portal2");
    var portal2X = parseInt(portal2.getAttribute('x'));
    var portal2Y = parseInt(portal2.getAttribute('y'));
    var portal2Position = new Point(portal2X, portal2Y);
    if (intersect(player.position, PLAYER_SIZE, portal2Position, PORTAL_SIZE)) {
        player.position = new Point(280, 20);
    }

    var exit = svgdoc.getElementById("exitDoor");
    var exitX = parseInt(exit.getAttribute('x'));
    var exitY = parseInt(exit.getAttribute('y'));
    var exitPosition = new Point(exitX, exitY);
    if (intersect(player.position, PLAYER_SIZE, exitPosition, EXIT_SIZE)) {
        if (numberOfGoodThingsRemaining == 0) {
            playSound(EXIT_SOUND);
            gameWin();
        }
    }
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play();
}