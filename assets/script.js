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

        /* Definition des Raketenobjekts */
        let rocket = {
            x: 50,
            y: 200,
            width: 100,
            height: 50,
            src: 'assets/img/rocket.png'
        };

        let ufos = [];
        let shots = [];

        /* Event-Listener für Tasteneingaben */
        document.onkeydown = function(e) {
            if (e.keyCode == 13) togglePause(); // Enter-Taste pausiert das Spiel
            if (e.keyCode == 32) KEY_SPACE = true; // Leertaste für Schießen
            if (e.keyCode == 38) KEY_UP = true; // Pfeiltaste nach oben
            if (e.keyCode == 40) KEY_DOWN = true; // Pfeiltaste nach unten
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
            } else {
                ufoInterval = setInterval(createUfos, 5000);
            }
        }

        /* Initialisiert das Spiel */
        function startGame() {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
            loadImages();
            setInterval(update, 1000 / 25);
            updateUfoInterval(); // Startet das erste UFO-Intervall
            setInterval(checkForCollion, 1000 / 25);
            setInterval(checkForShoot, 1000 / 10);
            draw();
        }

        /* Prüft, ob eine Kollision zwischen Rakete, Ufo oder Schuss stattgefunden hat */
        function checkForCollion() {
            ufos.forEach(function(ufo) {
                // Prüft, ob die Rakete mit einem Ufo kollidiert
                if (!ufo.hit &&
                    rocket.x + rocket.width > ufo.x &&
                    rocket.y + rocket.height > ufo.y &&
                    rocket.x < ufo.x &&
                    rocket.y < ufo.y + ufo.height) {
                        rocket.img.src = 'assets/img/boom.png';
                        console.log('Collion!!!');
                        ufos = ufos.filter(u => u != ufo);
                        setTimeout(restartGame, 2000);
                }
                // Prüft, ob ein Schuss ein Ufo trifft
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
        }

        function checkLevelUp() {
            if (score === 20) {
                showWinPopup();
                return; // Stoppt weiteres Level-Up
            }

            if (level < levels.length && score >= levels[level - 1].scoreToNext) {
                level++;
                ufos = []; // Alle Ufos entfernen
                console.log('Level ' + level + ' gestartet!');
                updateUfoInterval(); // Neues Ufo-Spawn-Intervall (Geschwindigkeit) setzen
            }
        }
        function showWinPopup() {
            document.getElementById('winPopup').style.display = 'block';
        }

        function update() {
            if (isPaused) return;
            if (KEY_UP && rocket.y > 0) {
                rocket.y -= 5;
            }
            if (KEY_DOWN && rocket.y + rocket.height < canvas.height) {
                rocket.y += 5;
            }
            ufos.forEach(ufo => { if (!ufo.hit) ufo.x -= ufo.speed; });
            shots.forEach(shot => { shot.x += 15; });
            checkLevelUp();
        }

        function restartGame() {
            level = 1;
            score = 0;
            rocket.x = 100;
            rocket.y = 300;
            rocket.img.src = 'assets/img/rocket.png';
            ufos = [];
            shots = [];
            document.getElementById('winPopup').style.display = 'none'; // Pop-up ausblenden
            updateUfoInterval(); // Ufo-Spawn-Rate für Level 1 setzen
        }

        const levels = [
            { speed: 5, image: 'assets/img/ufo.png', scoreToNext: 5, spawnRate: 2000 },  // Level 1: UFOs alle 2 Sek.
            { speed: 9, image: 'assets/img/ufo.png', scoreToNext: 10, spawnRate: 1500 }, // Level 2: UFOs alle 1,5 Sek.
            { speed: 13, image: 'assets/img/ufo2.png', scoreToNext: 15, spawnRate: 1000 }, // Level 3: UFOs alle 1 Sek.
            { speed: 17, image: 'assets/img/ufo2.png', scoreToNext: 20, spawnRate: 800 }  // Level 4: Ufos alle 0,8 Sek.
        ];
         
        // Jedes Mal, wenn sich das Level ändert, soll die UFO-Spawnrate aktualisiert werden:
        function updateUfoInterval() {
            clearInterval(ufoInterval); // Altes Intervall stoppen
            let currentLevel = levels[level - 1]; // Level-Infos holen
            ufoInterval = setInterval(createUfos, currentLevel.spawnRate);
        }

        function createUfos() {
            if (isPaused) return;

            let currentLevel = levels[level - 1]; // Das aktuelle Level aus dem Array holen

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

        /* Lädt die Bilder für den Hintergrund und die Rakete */
        function loadImages() {
            backgroundImage.src = 'assets/img/background.png';
            rocket.img = new Image();
            rocket.img.src = rocket.src;
        }

        /* Zeichnet das Spielfeld und alle Elemente */
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(backgroundImage, 0, 0);
            ctx.drawImage(rocket.img, rocket.x, rocket.y, rocket.width, rocket.height);
            ufos.forEach(ufo => ctx.drawImage(ufo.img, ufo.x, ufo.y, ufo.width, ufo.height));
            shots.forEach(shot => ctx.drawImage(shot.img, shot.x, shot.y, shot.width, shot.height));
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