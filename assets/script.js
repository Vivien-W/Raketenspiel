/* Steuerungsvariablen für die Eingabe */
let KEY_SPACE = false;
let KEY_UP = false;
let KEY_DOWN = false;

/* Canvas-Element und Rendering-Kontext */
let canvas;
let ctx;
let backgroundImage = new Image();
let score = 0;
let level = 1;
let isPaused = false;
let ufoInterval;
let bossShotInterval;
let boss = null;
let bossShots = [];
let isGameWon = false; 

/* Definition des Raketenobjekts */
let rocket = {
    x: 50,
    y: 200,
    width: 100,
    height: 50,
    src: 'assets/img/rocket.png',
    img: new Image()
};

let ufos = [];
let shots = [];

/* Event-Listener für Tasteneingaben */
document.onkeydown = function(e) {
    if (e.keyCode == 13) togglePause();
    if (e.keyCode == 32) KEY_SPACE = true;
    if (e.keyCode == 38) KEY_UP = true;
    if (e.keyCode == 40) KEY_DOWN = true;
};

document.onkeyup = function(e) {
    if (e.keyCode == 32) KEY_SPACE = false;
    if (e.keyCode == 38) KEY_UP = false;
    if (e.keyCode == 40) KEY_DOWN = false;
};

/* Funktion zum Pausieren/Fortsetzen des Spiels */
function togglePause() {
    isPaused = !isPaused;
    console.log(isPaused ? 'Spiel pausiert' : 'Spiel fortgesetzt');

    if (isPaused) {
        clearInterval(ufoInterval);
        clearInterval(bossShotInterval);
    } else {
        if (boss) {
            startBossShots();
        } else {
            updateUfoInterval();
        }
    }
}

/* Initialisiert das Spiel */
function startGame() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Canvas-Größe an das Browserfenster anpassen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    rocket.y = (canvas.height / 2) - (rocket.height / 2);
    
    loadAllImages().then(() => {
        console.log("Alle Bilder geladen, Spiel startet.");
        setInterval(update, 1000 / 25);
        updateUfoInterval();
        setInterval(checkForCollion, 1000 / 25);
        setInterval(checkForShoot, 1000 / 10);
        draw();
    }).catch(error => {
        console.error("Fehler beim Laden der Bilder:", error);
    });
}

// Wichtig: zunächst müssen alle Bilder geladen werden, bevor das Spiel startet!
function loadAllImages() {
    const imagesToLoad = [
        backgroundImage,
        rocket.img
    ];
    
    const promises = imagesToLoad.map(img => {
        return new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(`Fehler beim Laden von: ${img.src}`);
        });
    });
    
    backgroundImage.src = 'assets/img/background.png';
    rocket.img.src = rocket.src;

    return Promise.all(promises);
}

/* Prüft, ob eine Kollision stattgefunden hat */
function checkForCollion() {
    ufos.forEach(function(ufo) {
        if (!ufo.hit &&
            rocket.x + rocket.width > ufo.x &&
            rocket.y + rocket.height > ufo.y &&
            rocket.x < ufo.x &&
            rocket.y < ufo.y + ufo.height) {
            rocket.img.src = 'assets/img/boom.png';
            console.log('Kollision!!!');
            ufos = ufos.filter(u => u != ufo);
            // Spiel wird nach Kollision neu gestartet
            if (!isGameWon) {
                setTimeout(restartGame, 2000);
            }
        }
        shots.forEach(function(shot) {
            if (!ufo.hit &&
                shot.x + shot.width > ufo.x &&
                shot.y + shot.height > ufo.y &&
                shot.x < ufo.x &&
                shot.y < ufo.y + ufo.height) {
                ufo.hit = true;
                score += 1;
                ufo.img.src = 'assets/img/boom.png';
                console.log('Treffer!');
                setTimeout(() => {
                    ufos = ufos.filter(u => u != ufo);
                }, 2000);
            }
        });
    });

    if (boss) {
        shots.forEach(function(shot) {
            if (shot.x + shot.width > boss.x &&
                shot.y + shot.height > boss.y &&
                shot.x < boss.x + boss.width &&
                shot.y < boss.y + boss.height) {
                boss.hp--;
                shots = shots.filter(s => s !== shot);
                console.log("Boss getroffen! HP: " + boss.hp);
                if (boss.hp <= 0) {
                    boss = null;
                    isGameWon = true; // Spiel gewonnen
                    showWinPopup();
                }
            }
        });

        bossShots.forEach(function(shot) {
            if (rocket.x + rocket.width > shot.x &&
                rocket.y + rocket.height > shot.y &&
                rocket.x < shot.x + shot.width &&
                rocket.y < shot.y + shot.height) {
                rocket.img.src = 'assets/img/boom.png';
                console.log("Rakete von Boss getroffen!");
                // Spiel wird nach Kollision neu gestartet
                if (!isGameWon) {
                    setTimeout(restartGame, 2000);
                }
            }
        });
    }
}

function checkLevelUp() {
    if (boss) return;

    if (score >= 5 && level === 1) {
        level = 2;
        ufos = [];
        updateUfoInterval();
    } else if (score >= 10 && level === 2) {
        level = 3;
        ufos = [];
        updateUfoInterval();
    } else if (score >= 15 && level === 3) {
        level = 4;
        ufos = [];
        updateUfoInterval();
    } else if (score >= 20 && level === 4) {
        level = 5;
        ufos = [];
        shots = [];
        updateUfoInterval();
        console.log("Boss-Level gestartet!");
    }
}


function showWinPopup() {
    // Stoppe alle Aktionen, da das Spiel gewonnen ist
    isPaused = true;
    clearInterval(ufoInterval);
    clearInterval(bossShotInterval);
    document.getElementById('winPopup').style.display = 'block';
}

 // Herzstück des Spiels: aktualisiert den Zustand aller Spielelemente
function update() {
    if (isPaused) return;

    if (KEY_UP && rocket.y > 0) rocket.y -= 10;
    if (KEY_DOWN && rocket.y + rocket.height < canvas.height) rocket.y += 10;

    ufos.forEach(ufo => {
        if (!ufo.hit) ufo.x -= ufo.speed;
    });
    shots.forEach(shot => {
        shot.x += 15;
    });
    bossShots.forEach(shot => {
        shot.x -= shot.speed;
    });

    shots = shots.filter(shot => shot.x < canvas.width);
    bossShots = bossShots.filter(shot => shot.x > 0);

    if (boss) {
        boss.y += boss.speedY;
        if (boss.y <= 0 || boss.y + boss.height >= canvas.height) {
            boss.speedY *= -1;
        }
    }

    checkLevelUp();
}


function restartGame() {
    if (isGameWon) {
        return;
    }

    level = 1;
    score = 0;
    rocket.x = 100;
    rocket.y = 300;
    rocket.img.src = 'assets/img/rocket.png';
    ufos = [];
    shots = [];
    boss = null;
    bossShots = [];
    isGameWon = false;
    document.getElementById('winPopup').style.display = 'none';

    clearInterval(ufoInterval);
    if (bossShotInterval) {
        clearInterval(bossShotInterval);
        bossShotInterval = null;
    }

    updateUfoInterval();
}

const levels = [
    { speed: 5, image: 'assets/img/ufo.png', scoreToNext: 5, spawnRate: 2000 },
    { speed: 9, image: 'assets/img/ufo.png', scoreToNext: 10, spawnRate: 1500 },
    { speed: 13, image: 'assets/img/ufo2.png', scoreToNext: 15, spawnRate: 1000 },
    { speed: 17, image: 'assets/img/ufo2.png', scoreToNext: 20, spawnRate: 800 },
    { boss: true }
];

function updateUfoInterval() {
    clearInterval(ufoInterval);
    clearInterval(bossShotInterval);

    let currentLevel = levels[level - 1];

    if (currentLevel.boss) {
        createBoss();
        startBossShots();
    } else {
        ufoInterval = setInterval(createUfos, currentLevel.spawnRate);
    }
}

function createUfos() {
    if (isPaused) return;

    let currentLevel = levels[level - 1];

    let ufo = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 20),
        width: 50,
        height: 50,
        src: currentLevel.image,
        img: new Image(),
        speed: currentLevel.speed
    };
    ufo.img.src = ufo.src;
    ufos.push(ufo);
}

function createBoss() {
    boss = {
        x: canvas.width - 200,
        y: canvas.height / 2 - 100,
        width: 200,
        height: 150,
        src: 'assets/img/ufo3.png',
        img: new Image(),
        hp: 20,
        speedY: 3
    };
    boss.img.src = boss.src;
}

function startBossShots() {
    clearInterval(bossShotInterval);
    bossShotInterval = setInterval(() => {
        if (boss) {
            let shot = {
                x: boss.x,
                y: boss.y + boss.height / 2,
                width: 20,
                height: 6,
                src: 'assets/img/boss_shot.png',
                img: new Image(),
                speed: 7
            };
            shot.img.src = shot.src;
            bossShots.push(shot);
        }
    }, 2000);
}


/* Erstellt einen neuen Schuss, wenn die Leertaste gedrückt wird */
function checkForShoot() {
    if (KEY_SPACE) {
        let shot = {
            x: rocket.x + 110,
            y: rocket.y + 22,
            width: 20,
            height: 4,
            src: 'assets/img/shot.png',
            img: new Image()
        };
        shot.img.src = shot.src;
        shots.push(shot);
    }
}

function loadImages() {}

/* Zeichnet das Spielfeld und alle Elemente */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0);
    ctx.drawImage(rocket.img, rocket.x, rocket.y, rocket.width, rocket.height);
    ufos.forEach(ufo => ctx.drawImage(ufo.img, ufo.x, ufo.y, ufo.width, ufo.height));
    shots.forEach(shot => ctx.drawImage(shot.img, shot.x, shot.y, shot.width, shot.height));

    if (boss) {
        ctx.drawImage(boss.img, boss.x, boss.y, boss.width, boss.height);
        bossShots.forEach(shot => ctx.drawImage(shot.img, shot.x, shot.y, shot.width, shot.height));

        ctx.fillStyle = 'red';
        ctx.font = '20px Arial';
        ctx.fillText('Boss HP: ' + boss.hp, canvas.width / 2 - 50, 30);
    }

    drawScore();
    requestAnimationFrame(draw);
}

/* Zeigt den aktuellen Punktestand und das Level an */
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, canvas.width - 100, 30);
    ctx.fillText('Level: ' + level, 20, 30);
}