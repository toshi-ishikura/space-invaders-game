const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

const playerWidth = 50;
const playerHeight = 20;
const playerSpeed = 10;
let playerX = canvas.width / 2 - playerWidth / 2;
let playerY = canvas.height - playerHeight - 10;

const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 7;
let bullets = [];
let enemyBullets = [];

const enemyRowCount = 5;
const enemyColumnCount = 11;
const enemyWidth = 40;
const enemyHeight = 20;
const enemyPadding = 20;
const enemyOffsetTop = 30;
const enemyOffsetLeft = 30;
let enemies = [];

let playerLives = 3;
let gameOver = false;
let gameWon = false;

function createEnemies() {
    for (let c = 0; c < enemyColumnCount; c++) {
        enemies[c] = [];
        for (let r = 0; r < enemyRowCount; r++) {
            let enemyX = c * (enemyWidth + enemyPadding) + enemyOffsetLeft;
            let enemyY = r * (enemyHeight + enemyPadding) + enemyOffsetTop;
            enemies[c][r] = { x: enemyX, y: enemyY, status: 1 };
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
}

function drawBullets() {
    ctx.fillStyle = '#f00';
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
        bullet.y -= bulletSpeed;
        if (bullet.y + bulletHeight < 0) {
            bullets.splice(index, 1);
        }
    });
    ctx.fillStyle = '#ff0';
    enemyBullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
        bullet.y += bulletSpeed;
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
        }
    });
}

function drawEnemies() {
    let enemiesRemaining = false;
    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            if (enemies[c][r].status == 1) {
                enemiesRemaining = true;
                let enemyX = enemies[c][r].x;
                let enemyY = enemies[c][r].y;
                ctx.fillStyle = '#00f';
                ctx.fillRect(enemyX, enemyY, enemyWidth, enemyHeight);
                if (enemyY + enemyHeight >= canvas.height) {
                    gameOver = true;
                }
            }
        }
    }
    if (!enemiesRemaining) {
        gameWon = true;
    }
}

function drawLives() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Lives: ' + playerLives, 10, 30);
}

function movePlayer() {
    if (leftPressed && playerX > 0) {
        playerX -= playerSpeed;
    } else if (rightPressed && playerX < canvas.width - playerWidth) {
        playerX += playerSpeed;
    }
}

function shoot() {
    bullets.push({ x: playerX + playerWidth / 2 - bulletWidth / 2, y: playerY });
}

function randomEnemyShoot() {
    // 敵の中からランダムに1～3個を選んで弾を発射
    let validEnemies = [];
    enemies.forEach(column => {
        column.forEach(enemy => {
            if (enemy.status == 1) {
                validEnemies.push(enemy);
            }
        });
    });
    const numShots = Math.floor(Math.random() * 3) + 1; // 1～3個の弾を発射
    for (let i = 0; i < numShots; i++) {
        if (validEnemies.length > 0) {
            let randomEnemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];
            const bulletX = randomEnemy.x + enemyWidth / 2 - bulletWidth / 2;
            const bulletY = randomEnemy.y + enemyHeight;
            enemyBullets.push({ x: bulletX, y: bulletY });
        }
    }

    // 0.5～3秒の間のランダムな時間で次の弾発射をスケジュール
    const randomTime = Math.random() * (3000 - 500) + 500;
    setTimeout(randomEnemyShoot, randomTime);
}

function collisionDetection() {
    bullets.forEach((bullet, bIndex) => {
        for (let c = 0; c < enemyColumnCount; c++) {
            for (let r = 0; r < enemyRowCount; r++) {
                let enemy = enemies[c][r];
                if (enemy.status == 1 && bullet.x > enemy.x && bullet.x < enemy.x + enemyWidth && bullet.y > enemy.y && bullet.y < enemy.y + enemyHeight) {
                    enemy.status = 0;
                    bullets.splice(bIndex, 1);
                }
            }
        }
    });
    enemyBullets.forEach((bullet, bIndex) => {
        if (bullet.x > playerX && bullet.x < playerX + playerWidth && bullet.y > playerY && bullet.y < playerY + playerHeight) {
            enemyBullets.splice(bIndex, 1);
            playerLives--;
            if (playerLives <= 0) {
                gameOver = true;
            }
        }
    });
}

// 敵を下に移動させる関数
function moveEnemiesDown() {
    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            if (enemies[c][r].status == 1) {
                enemies[c][r].y += enemyHeight + enemyPadding;
            }
        }
    }
}

// 敵を左右に移動させる関数
function moveEnemiesSideways() {
    const direction = Math.random() < 0.5 ? -1 : 1; // 左か右かをランダムに決定
    let canMove = true;

    for (let c = 0; c < enemyColumnCount; c++) {
        for (let r = 0; r < enemyRowCount; r++) {
            if (enemies[c][r].status == 1) {
                let newX = enemies[c][r].x + direction * (enemyWidth + enemyPadding);
                if (newX < 0 || newX + enemyWidth > canvas.width) {
                    canMove = false;
                    break;
                }
            }
        }
        if (!canMove) break;
    }

    if (canMove) {
        for (let c = 0; c < enemyColumnCount; c++) {
            for (let r = 0; r < enemyRowCount; r++) {
                if (enemies[c][r].status == 1) {
                    enemies[c][r].x += direction * (enemyWidth + enemyPadding);
                }
            }
        }
    }
}

// 5秒ごとに敵を下に移動させる
setInterval(moveEnemiesDown, 5000);

// 1秒ごとに敵を左右に移動させる
setInterval(moveEnemiesSideways, 1000);

// 0.5～3秒ごとにランダムな敵が弾を発射する
randomEnemyShoot();

let leftPressed = false;
let rightPressed = false;
document.addEventListener('keydown', (e) => {
    if (e.key == 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key == 'ArrowRight') {
        rightPressed = true;
    } else if (e.key == ' ') {
        shoot();
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key == 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key == 'ArrowRight') {
        rightPressed = false;
    }
});

function draw() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f00';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
        return;
    }
    if (gameWon) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WIN!', canvas.width / 2, canvas.height / 2);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawLives();
    collisionDetection();
    movePlayer();
    requestAnimationFrame(draw);
}

createEnemies();
draw();
