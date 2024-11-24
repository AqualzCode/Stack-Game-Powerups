class StackGame {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 600;
            this.canvas.height = 800;
    
            // Game state
            this.score = 0;
            this.gameOver = false;
            this.blocks = [];
            this.currentBlock = null;
            this.blockSpeed = 2;
            this.direction = 1;
            this.baseWidth = 200;
            this.blockHeight = 40;
    
            // Power-ups
            this.powerUps = {
                slowMotion: { active: false, duration: 5000, multiplier: 0.5 },
                perfectStack: { active: false, duration: 10000 },
                wider: { active: false, duration: 15000, extraWidth: 50 }
            };
    
            // Colors
            this.colors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1',
                '#96CEB4', '#FFEEAD', '#D4A5A5',
                '#9B59B6', '#3498DB', '#E74C3C'
            ];
    
            this.setupEventListeners();
            this.loadHighScore();
        }
    
        setupEventListeners() {
            document.getElementById('startButton').addEventListener('click', () => this.startGame());
            document.getElementById('stackButton').addEventListener('click', () => this.stackBlock());
            document.getElementById('restartButton').addEventListener('click', () => this.startGame());
            
            // Power-up buttons
            document.getElementById('slowMotion').addEventListener('click', () => this.activatePowerUp('slowMotion'));
            document.getElementById('perfectStack').addEventListener('click', () => this.activatePowerUp('perfectStack'));
            document.getElementById('wider').addEventListener('click', () => this.activatePowerUp('wider'));
    
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space') this.stackBlock();
            });
        }
    
        startGame() {
            this.score = 0;
            this.blocks = [];
            this.gameOver = false;
            this.blockSpeed = 2;
            
            // Reset power-ups
            Object.keys(this.powerUps).forEach(key => {
                this.powerUps[key].active = false;
            });
    
            // Add first block
            this.addBlock(this.canvas.width / 2 - this.baseWidth / 2, this.canvas.height - this.blockHeight);
            this.addNewBlock();
    
            // Hide game over screen
            document.querySelector('.game-over').classList.add('hidden');
            
            // Start game loop
            this.update();
        }
    
        addBlock(x, y, width = this.baseWidth) {
            const block = {
                x,
                y,
                width,
                height: this.blockHeight,
                color: this.colors[this.blocks.length % this.colors.length]
            };
            this.blocks.push(block);
        }
    
        addNewBlock() {
            const lastBlock = this.blocks[this.blocks.length - 1];
            const width = this.powerUps.wider.active ? this.baseWidth + this.powerUps.wider.extraWidth : this.baseWidth;
            
            this.currentBlock = {
                x: 0,
                y: lastBlock.y - this.blockHeight,
                width,
                height: this.blockHeight,
                color: this.colors[this.blocks.length % this.colors.length]
            };
        }
    
        stackBlock() {
            if (!this.currentBlock || this.gameOver) return;
    
            const lastBlock = this.blocks[this.blocks.length - 1];
            let overlap = true;
            let overlapWidth = this.currentBlock.width;
    
            // Calculate overlap
            if (!this.powerUps.perfectStack.active) {
                const rightEdge = Math.min(this.currentBlock.x + this.currentBlock.width, lastBlock.x + lastBlock.width);
                const leftEdge = Math.max(this.currentBlock.x, lastBlock.x);
                overlapWidth = rightEdge - leftEdge;
                overlap = overlapWidth > 0;
            }
    
            if (overlap) {
                // Add new block with overlap width
                this.addBlock(
                    this.powerUps.perfectStack.active ? lastBlock.x : Math.max(this.currentBlock.x, lastBlock.x),
                    this.currentBlock.y,
                    this.powerUps.perfectStack.active ? this.currentBlock.width : overlapWidth
                );
    
                // Update score
                this.score++;
                document.getElementById('score').textContent = this.score;
    
                // Add new moving block
                this.addNewBlock();
    
                // Increase difficulty
                this.blockSpeed += 0.1;
            } else {
                this.endGame();
            }
        }
    
        activatePowerUp(type) {
            if (this.gameOver || this.powerUps[type].active) return;
    
            this.powerUps[type].active = true;
            document.getElementById(type).classList.add('active');
    
            // Apply power-up effects
            setTimeout(() => {
                this.powerUps[type].active = false;
                document.getElementById(type).classList.remove('active');
            }, this.powerUps[type].duration);
        }
    
        update() {
            if (this.gameOver) return;
    
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
            // Draw stacked blocks
            this.blocks.forEach(block => {
                this.ctx.fillStyle = block.color;
                this.ctx.fillRect(block.x, block.y, block.width, block.height);
            });
    
            // Update and draw current block
            if (this.currentBlock) {
                this.currentBlock.x += this.direction * (this.powerUps.slowMotion.active ? 
                    this.blockSpeed * this.powerUps.slowMotion.multiplier : 
                    this.blockSpeed);
    
                // Reverse direction at edges
                if (this.currentBlock.x + this.currentBlock.width > this.canvas.width || this.currentBlock.x < 0) {
                    this.direction *= -1;
                }
    
                this.ctx.fillStyle = this.currentBlock.color;
                this.ctx.fillRect(
                    this.currentBlock.x,
                    this.currentBlock.y,
                    this.currentBlock.width,
                    this.currentBlock.height
                );
            }
    
            requestAnimationFrame(() => this.update());
        }
    
        endGame() {
            this.gameOver = true;
            document.querySelector('.game-over').classList.remove('hidden');
            document.getElementById('finalScore').textContent = this.score;
    
            // Update high score
            const highScore = localStorage.getItem('stackGameHighScore') || 0;
            if (this.score > highScore) {
                localStorage.setItem('stackGameHighScore', this.score);
                document.getElementById('highScore').textContent = this.score;
            }
        }
    
        loadHighScore() {
            const highScore = localStorage.getItem('stackGameHighScore') || 0;
            document.getElementById('highScore').textContent = highScore;
        }
    }
    
    // Start the game when the page loads
    window.onload = () => {
        new StackGame();
    };