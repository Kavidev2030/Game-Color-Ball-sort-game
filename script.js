class ColorBallSortGame {
    constructor() {
        this.tubes = [];
        this.selectedTube = null;
        this.moveCount = 0;
        this.level = 1;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.tubeCapacity = 4;
        this.numColors = 4;
        this.numTubes = 6; // 4 tubes with balls + 2 empty tubes
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.newGame();
    }
    
    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    }
    
    newGame() {
        this.tubes = [];
        this.selectedTube = null;
        this.moveCount = 0;
        this.updateMoveCount();
        this.updateLevelDisplay();
        this.clearMessage();
        
        // Adjust difficulty based on level
        this.adjustDifficultyForLevel();
        
        // Create tubes with mixed balls
        this.generatePuzzle();
        this.renderTubes();
    }
    
    resetGame() {
        this.selectedTube = null;
        this.moveCount = 0;
        this.updateMoveCount();
        this.clearMessage();
        
        // Reset difficulty for current level
        this.adjustDifficultyForLevel();
        this.generatePuzzle();
        this.renderTubes();
    }
    
    generatePuzzle() {
        // Initialize empty tubes
        for (let i = 0; i < this.numTubes; i++) {
            this.tubes.push([]);
        }
        
        // Create balls for each color
        const allBalls = [];
        for (let i = 0; i < this.numColors; i++) {
            const color = this.colors[i];
            for (let j = 0; j < this.tubeCapacity; j++) {
                allBalls.push(color);
            }
        }
        
        // Shuffle the balls
        this.shuffleArray(allBalls);
        
        // Distribute balls to first 4 tubes (leaving 2 empty for sorting)
        let ballIndex = 0;
        for (let tubeIndex = 0; tubeIndex < this.numTubes - 2; tubeIndex++) {
            for (let i = 0; i < this.tubeCapacity; i++) {
                this.tubes[tubeIndex].push(allBalls[ballIndex]);
                ballIndex++;
            }
        }
        
        // Ensure the puzzle is solvable by checking if it's not already solved
        if (this.checkWin()) {
            this.generatePuzzle(); // Regenerate if already solved
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    renderTubes() {
        const container = document.getElementById('tubesContainer');
        container.innerHTML = '';
        
        this.tubes.forEach((tube, index) => {
            const tubeElement = document.createElement('div');
            tubeElement.className = 'tube';
            tubeElement.dataset.tubeIndex = index;
            
            // Add balls to tube (from bottom to top)
            tube.forEach(color => {
                const ball = document.createElement('div');
                ball.className = `ball ${color}`;
                tubeElement.appendChild(ball);
            });
            
            tubeElement.addEventListener('click', () => this.handleTubeClick(index));
            container.appendChild(tubeElement);
        });
    }
    
    handleTubeClick(tubeIndex) {
        const tube = this.tubes[tubeIndex];
        
        if (this.selectedTube === null) {
            // Select a tube if it has balls
            if (tube.length > 0) {
                this.selectedTube = tubeIndex;
                this.highlightTube(tubeIndex);
                this.showTargetHighlights();
                this.changeBackgroundForSelection();
            }
        } else if (this.selectedTube === tubeIndex) {
            // Deselect the same tube
            this.selectedTube = null;
            this.clearAllHighlights();
            this.resetBackground();
        } else {
            // Try to move ball from selected tube to clicked tube
            if (this.canMoveBall(this.selectedTube, tubeIndex)) {
                this.moveBallWithAnimation(this.selectedTube, tubeIndex);
                this.moveCount++;
                this.updateMoveCount();
                
                if (this.checkWin()) {
                    this.showWinMessage();
                }
            } else {
                // Show invalid move feedback
                this.showInvalidMoveMessage();
            }
            
            this.selectedTube = null;
            this.clearAllHighlights();
            this.resetBackground();
        }
    }
    
    canMoveBall(fromTube, toTube) {
        const fromTubeArray = this.tubes[fromTube];
        const toTubeArray = this.tubes[toTube];
        
        // Can't move from empty tube
        if (fromTubeArray.length === 0) return false;
        
        // Can't move to full tube
        if (toTubeArray.length >= this.tubeCapacity) return false;
        
        // Can move to empty tube
        if (toTubeArray.length === 0) return true;
        
        // Can only move to tube with same color on top
        const topBallFrom = fromTubeArray[fromTubeArray.length - 1];
        const topBallTo = toTubeArray[toTubeArray.length - 1];
        
        return topBallFrom === topBallTo;
    }
    
    moveBall(fromTube, toTube) {
        const ball = this.tubes[fromTube].pop();
        this.tubes[toTube].push(ball);
        this.renderTubes();
    }
    
    moveBallWithAnimation(fromTube, toTube) {
        // Add moving animation to the ball
        const fromTubeElement = document.querySelectorAll('.tube')[fromTube];
        const topBall = fromTubeElement.querySelector('.ball:last-child');
        
        if (topBall) {
            topBall.classList.add('moving');
            
            // Wait for animation to complete before moving the ball
            setTimeout(() => {
                this.moveBall(fromTube, toTube);
                
                // Check if the destination tube is now completed
                this.checkTubeCompletion(toTube);
            }, 300);
        } else {
            this.moveBall(fromTube, toTube);
            
            // Check if the destination tube is now completed
            this.checkTubeCompletion(toTube);
        }
    }
    
    highlightTube(tubeIndex) {
        this.clearAllHighlights();
        const tubeElements = document.querySelectorAll('.tube');
        tubeElements[tubeIndex].classList.add('selected');
    }
    
    showTargetHighlights() {
        if (this.selectedTube === null) return;
        
        const tubeElements = document.querySelectorAll('.tube');
        tubeElements.forEach((tubeElement, index) => {
            if (index !== this.selectedTube) {
                if (this.canMoveBall(this.selectedTube, index)) {
                    tubeElement.classList.add('valid-target');
                } else {
                    tubeElement.classList.add('invalid-target');
                }
            }
        });
    }
    
    clearAllHighlights() {
        const tubeElements = document.querySelectorAll('.tube');
        tubeElements.forEach(tube => {
            tube.classList.remove('selected', 'valid-target', 'invalid-target');
        });
    }
    
    changeBackgroundForSelection() {
        document.body.classList.add('ball-selected');
    }
    
    resetBackground() {
        document.body.classList.remove('ball-selected');
    }
    
    checkWin() {
        // Check if all tubes are either empty or contain only one color
        for (const tube of this.tubes) {
            if (tube.length === 0) continue; // Empty tube is OK
            
            // Check if all balls in tube are the same color
            const firstColor = tube[0];
            if (!tube.every(ball => ball === firstColor)) {
                return false;
            }
            
            // Check if tube is completely filled with one color
            if (tube.length !== this.tubeCapacity) {
                return false;
            }
        }
        
        // Count how many different colors we have in non-empty tubes
        const usedColors = new Set();
        for (const tube of this.tubes) {
            if (tube.length > 0) {
                usedColors.add(tube[0]);
            }
        }
        
        // We should have exactly the number of colors we started with
        return usedColors.size === this.numColors;
    }
    
    showWinMessage() {
        const messageElement = document.getElementById('message');
        messageElement.textContent = `🎉 Level ${this.level} Complete! 🎉`;
        messageElement.className = 'message win';
        
        // Reset background to normal
        this.resetBackground();
        
        // Create flash popup effect immediately
        this.createFlashPopup();
        
        // Start celebration animations
        this.startCelebrationAnimations();
        
        // Show level progression modal after flash
        setTimeout(() => {
            this.showLevelProgressionModal();
        }, 1500);
    }
    
    showInvalidMoveMessage() {
        const messageElement = document.getElementById('message');
        messageElement.textContent = '❌ Invalid move! You can only place a ball on the same color or in an empty tube.';
        messageElement.className = 'message';
        
        // Clear message after 2 seconds
        setTimeout(() => {
            this.clearMessage();
        }, 2000);
    }
    
    clearMessage() {
        const messageElement = document.getElementById('message');
        messageElement.textContent = '';
        messageElement.className = 'message';
    }
    
    updateMoveCount() {
        document.getElementById('moveCount').textContent = this.moveCount;
    }
    
    updateLevelDisplay() {
        document.getElementById('levelCount').textContent = this.level;
    }
    
    adjustDifficultyForLevel() {
        // Increase difficulty with each level
        if (this.level <= 3) {
            this.numColors = 3 + this.level; // Level 1: 4 colors, Level 2: 5 colors, Level 3: 6 colors
            this.numTubes = this.numColors + 2; // Always 2 extra empty tubes
            this.tubeCapacity = 4;
        } else if (this.level <= 6) {
            this.numColors = 6; // Max colors
            this.numTubes = 8; // Max tubes
            this.tubeCapacity = 4 + Math.floor((this.level - 3) / 2); // Increase capacity
        } else {
            // Super hard levels
            this.numColors = 6;
            this.numTubes = 8;
            this.tubeCapacity = 6;
        }
    }
    
    startCelebrationAnimations() {
        // Add celebrating class to game container
        const gameContainer = document.querySelector('.game-container');
        gameContainer.classList.add('celebrating');
        
        // Add celebrating class to all tubes and balls
        const tubes = document.querySelectorAll('.tube');
        const balls = document.querySelectorAll('.ball');
        
        tubes.forEach(tube => tube.classList.add('celebrating'));
        balls.forEach(ball => ball.classList.add('celebrating'));
        
        // Create confetti effect
        this.createConfetti();
        
        // Create fireworks effect
        this.createFireworks();
        
        // Create sparkles effect
        this.createSparkles();
        
        // Remove celebration classes after animation
        setTimeout(() => {
            gameContainer.classList.remove('celebrating');
            tubes.forEach(tube => tube.classList.remove('celebrating'));
            balls.forEach(ball => ball.classList.remove('celebrating'));
        }, 3000);
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#74b9ff', '#55efc4', '#fdcb6e', '#a29bfe', '#fd79a8'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 100);
        }
    }
    
    createFireworks() {
        const colors = ['#ff6b6b', '#74b9ff', '#55efc4', '#fdcb6e', '#a29bfe', '#fd79a8'];
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = Math.random() * 80 + 10 + 'vw';
                firework.style.top = Math.random() * 60 + 20 + 'vh';
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                firework.style.boxShadow = `0 0 20px ${colors[Math.floor(Math.random() * colors.length)]}`;
                document.body.appendChild(firework);
                
                // Remove firework after animation
                setTimeout(() => {
                    if (firework.parentNode) {
                        firework.parentNode.removeChild(firework);
                    }
                }, 1000);
            }, i * 200);
        }
    }
    
    createSparkles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = Math.random() * 90 + 5 + 'vw';
                sparkle.style.top = Math.random() * 70 + 15 + 'vh';
                sparkle.style.animationDelay = Math.random() * 1 + 's';
                document.body.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1500);
            }, i * 150);
        }
    }
    
    createFlashPopup() {
        const flash = document.createElement('div');
        flash.className = 'flash-popup';
        document.body.appendChild(flash);
        
        // Remove flash after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1500);
    }
    
    checkTubeCompletion(tubeIndex) {
        const tube = this.tubes[tubeIndex];
        
        // Check if tube is full and all balls are the same color
        if (tube.length === this.tubeCapacity) {
            const firstColor = tube[0];
            const isCompleted = tube.every(ball => ball === firstColor);
            
            if (isCompleted) {
                this.animateTubeCompletion(tubeIndex);
            }
        }
    }
    
    animateTubeCompletion(tubeIndex) {
        const tubeElements = document.querySelectorAll('.tube');
        const tubeElement = tubeElements[tubeIndex];
        const balls = tubeElement.querySelectorAll('.ball');
        
        // Add completion classes
        tubeElement.classList.add('completed');
        balls.forEach(ball => ball.classList.add('tube-completed'));
        
        // Create glow effect
        const glow = document.createElement('div');
        glow.className = 'completion-glow';
        tubeElement.style.position = 'relative';
        tubeElement.appendChild(glow);
        
        // Create sparkle effects around the tube
        this.createCompletionSparkles(tubeElement);
        
        // Show completion message
        this.showTubeCompletionMessage();
        
        // Remove completion effects after animation
        setTimeout(() => {
            tubeElement.classList.remove('completed');
            balls.forEach(ball => ball.classList.remove('tube-completed'));
            if (glow.parentNode) {
                glow.parentNode.removeChild(glow);
            }
        }, 2000);
    }
    
    createCompletionSparkles(tubeElement) {
        const tubeRect = tubeElement.getBoundingClientRect();
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'completion-sparkle';
                
                // Position sparkles around the tube
                const angle = (i / 8) * 2 * Math.PI;
                const radius = 40;
                const x = tubeRect.left + tubeRect.width / 2 + Math.cos(angle) * radius;
                const y = tubeRect.top + tubeRect.height / 2 + Math.sin(angle) * radius;
                
                sparkle.style.left = x + 'px';
                sparkle.style.top = y + 'px';
                sparkle.style.position = 'fixed';
                
                document.body.appendChild(sparkle);
                
                // Remove sparkle after animation
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.parentNode.removeChild(sparkle);
                    }
                }, 1000);
            }, i * 100);
        }
    }
    
    showTubeCompletionMessage() {
        const messageElement = document.getElementById('message');
        const originalMessage = messageElement.textContent;
        
        messageElement.textContent = '✨ Great! One color completed! ✨';
        messageElement.style.color = '#00b894';
        messageElement.style.fontWeight = 'bold';
        
        // Restore original message after 2 seconds
        setTimeout(() => {
            messageElement.textContent = originalMessage;
            messageElement.style.color = '';
            messageElement.style.fontWeight = '';
        }, 2000);
    }
    
    showLevelProgressionModal() {
        // Calculate performance rating
        const perfectMoves = this.numColors * this.tubeCapacity;
        let rating = '';
        let emoji = '';
        
        if (this.moveCount <= perfectMoves + 5) {
            rating = 'PERFECT!';
            emoji = '🏆';
        } else if (this.moveCount <= perfectMoves + 15) {
            rating = 'EXCELLENT!';
            emoji = '⭐';
        } else if (this.moveCount <= perfectMoves + 30) {
            rating = 'GOOD!';
            emoji = '👍';
        } else {
            rating = 'COMPLETED!';
            emoji = '✅';
        }
        
        // Calculate next level difficulty
        const nextLevel = this.level + 1;
        let nextLevelInfo = this.getNextLevelInfo(nextLevel);
        
        const modal = document.createElement('div');
        modal.className = 'level-progression';
        modal.innerHTML = `
            <div class="game-over">GAME OVER</div>
            <h2>${emoji} Level ${this.level} ${rating} ${emoji}</h2>
            <p>Congratulations! You've mastered this level!</p>
            
            <div class="level-stats">
                <h3>🎯 Level ${this.level} Stats</h3>
                <p><strong>Moves Used:</strong> ${this.moveCount}</p>
                <p><strong>Colors Sorted:</strong> ${this.numColors}</p>
                <p><strong>Tube Capacity:</strong> ${this.tubeCapacity} balls</p>
                <p><strong>Total Tubes:</strong> ${this.numTubes}</p>
            </div>
            
            <div class="difficulty-preview">
                <h4>🔥 Next Level Preview</h4>
                <p><strong>Level ${nextLevel}:</strong> ${nextLevelInfo.colors} colors, ${nextLevelInfo.capacity} balls per tube</p>
                <p><strong>Difficulty:</strong> ${nextLevelInfo.difficulty}</p>
            </div>
            
            <div class="button-group">
                <button class="next-level-btn" onclick="this.parentElement.remove(); window.game.nextLevel()">
                    🚀 Boost to Level ${nextLevel}!
                </button>
                <button class="restart-btn" onclick="this.parentElement.remove(); window.game.restartFromLevel1()">
                    🔄 Restart from Level 1
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove modal after 15 seconds if not closed
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 15000);
    }
    
    getNextLevelInfo(level) {
        let info = { colors: 4, capacity: 4, difficulty: 'Easy' };
        
        if (level <= 3) {
            info.colors = 3 + level;
            info.capacity = 4;
            info.difficulty = level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard';
        } else if (level <= 6) {
            info.colors = 6;
            info.capacity = 4 + Math.floor((level - 3) / 2);
            info.difficulty = 'Very Hard';
        } else {
            info.colors = 6;
            info.capacity = 6;
            info.difficulty = 'Extreme';
        }
        
        return info;
    }
    
    nextLevel() {
        this.level++;
        this.newGame();
    }
    
    restartFromLevel1() {
        this.level = 1;
        this.newGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ColorBallSortGame();
});
