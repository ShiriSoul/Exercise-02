class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
    }

    preload() {
        this.load.path = './assets/img/'
        this.load.image('grass', 'grass.jpg')
        this.load.image('cup', 'cup.jpg')
        this.load.image('ball', 'ball.png')
        this.load.image('wall', 'wall.png')
        this.load.image('oneway', 'one_way_wall.png')
    }

    create() {
        // add background grass
        this.grass = this.add.image(0, 0, 'grass').setOrigin(0)

        // add cup
        this.cup = this.physics.add.sprite(width / 2, height / 10, 'cup')
        this.cup.body.setCircle(this.cup.width / 4)
        this.cup.body.setOffset(this.cup.width / 4)
        this.cup.body.setImmovable(true)

        // add ball
        this.ball = this.physics.add.sprite(width / 2, height - height / 10, 'ball')
        this.ball.body.setCircle(this.ball.width / 2)
        this.ball.body.setCollideWorldBounds(true)
        this.ball.body.setBounce(0.5)
        this.ball.setDamping(true).setDrag(0.5)

        // add walls
        let wallA = this.physics.add.sprite(0, height / 4, 'wall')
        wallA.setX(Phaser.Math.Between(0 + wallA.width / 2, width - wallA.width/2))
        wallA.body.setImmovable(true)

        let wallB = this.physics.add.sprite(0, height / 2, 'wall')
        wallB.setX(Phaser.Math.Between(0 + wallB.width / 2, width - wallB.width/2))
        wallB.body.setImmovable(true)

        this.walls = this.add.group([wallA, wallB])

        // one way
        this.oneWay = this.physics.add.sprite(0, height / 4 * 3, 'oneway')
        this.oneWay.setX(Phaser.Math.Between(0 + this.oneWay.width/2, width - this.oneWay.width/2))
        this.oneWay.body.setImmovable(true)
        this.oneWay.body.checkCollision.down = false

        // variables
        this.SHOT_VELOCITY_X = 200
        this.SHOT_VELOCITY_Y_MIN = 700
        this.SHOT_VELOCITY_Y_MAX = 1100
        this.input.on('pointerdown', (pointer) => {
            let shotDirection
            pointer.y <= this.ball.y ? shotDirection = 1 : shotDirection = -1
            this.ball.body.setVelocityX(Phaser.Math.Between(-this.SHOT_VELOCITY_X, this.SHOT_VELOCITY_X))
            this.ball.body.setVelocityY(Phaser.Math.Between(this.SHOT_VELOCITY_Y_MIN, this.SHOT_VELOCITY_Y_MAX) * shotDirection)
        })

        // Follow 3 lines (61 to 63) is commented because we need the collider in update() and no longer needs to destroy the ball
        // this.physics.add.collider(this.ball, this.cup, (ball, cup) => {
        //     ball.destroy()
        // })
        this.physics.add.collider(this.ball, this.walls)
        this.physics.add.collider(this.ball, this.oneWay)

        // Challenge 4: Shots Taken Count
        this.shotCount = 0;

        this.shotCountText = this.add.text(10, 10, 'Shots: 0', {
            fontSize: '24px',
            fill: '#fff'
        });

        this.input.on('pointerdown', (pointer) => {
            // shots count increments
            this.shotCount++;
            this.shotCountText.setText('Shots: ' + this.shotCount);
            // The below 2 lines (79, 80) is part of task 4's shot success percentage
            const successPercentage = ((this.score / this.shotCount) * 100).toFixed(2);
            this.successText.setText('Success: ' + successPercentage + '%');
        });

        // Challenge 4: Score
        this.score = 0;

        // creates a text display for score
        this.scoreText = this.add.text(10, 40, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });

        // Challenge 4: Success rate of shots percentage
        this.shotCount = 0;

        // creates a text display for success percentage
        this.successText = this.add.text(10, 70, 'Success: 0%', {
            fontSize: '24px',
            fill: '#fff'
        });
    }

    update() {
        // Challenge 1: Add logic so the ball resets to the bottom on a successful “hole-in”
        // In Challenge 4 code below because otherwise score won't work
        // this.physics.add.collider(this.ball, this.cup, (ball, cup) => {
        //     this.ball.setPosition(width / 2, height - height / 10)
        // })

        // Challenge 2: Add logic to set the ball's x-velocity based on the pointer's relative x-position
        this.input.on('pointerdown', (pointer) => {
            // ball will go in the direction of the pointer's y-position. Example: if pointer is on the top of the screen, the ball will stay on the top
            let shotDirection = pointer.y <= this.ball.y ? -1 : 1;

            // calculates the relative x-position of pointer
            const relativeX = pointer.x - this.ball.x;

            // adjusts VelocityX relative to x-position
            this.ball.body.setVelocityX(relativeX * 0.25);

            // copied from create(). line 57
            this.ball.body.setVelocityY(Phaser.Math.Between(this.SHOT_VELOCITY_Y_MIN, this.SHOT_VELOCITY_Y_MAX) * shotDirection);
        });

        // Challenge 3: Make one obstacle move left/right and bounce against the screen edges
        // sets which wall for this challenge/task (i chose wallA but simply changing all wallA within challenge 3 to another obstacle will cahnge which obstacle moves)
        const wallA = this.walls.getChildren()[0];

        // checks for direction property to start, it doesn't so we can then have it start in a direction which is right in this case (-1 is left and 1 is right)
        if (wallA.direction === undefined) {
            wallA.direction = 1;
        }
    
        // sets the speed the obstacle (wallA) moves. I did 10 so its fast but not too fast, adding a little bit more of difficulty
        let moveSpeed = 10;
    
        // calculates wallA position to move. There might be a better way to do this challenge/task by adding things to create() but to keep it simple I kept all the challenges in update()
        const nextX = wallA.x + moveSpeed * wallA.direction;
    
        // check wallA has reached the screen edge
        if (nextX - wallA.width / 2 < 0 || nextX + wallA.width / 2 > width) {
            // reverses screen direction (its 1 originally to start, hitting edge makes it 1*-1 which is -1 so it'll move left then it'll be -1*-1 which is 1 so move right, repeat)
            wallA.direction *= -1;
        }
    
        // moves wallA
        wallA.x += moveSpeed * wallA.direction;

        // Challenge 4: Create and display (1) a shot counter (2) score (“hole-in”) and (3) successful shot percentage
        // shot count is in the bottom of create(). Lines 67 to 82)
        this.physics.add.collider(this.ball, this.cup, (ball, cup) => {
            // Increase the score by 1 when the ball touches the cup
            this.score++;
            this.scoreText.setText('Score: ' + this.score);
    
            // Challenge 1: reset ball position (same as the commented code in lines 106 to 109)
            this.ball.setPosition(width / 2, height - height / 10);
        });

        // Shot Success Percentage. Part of this task is in create() (Lines 75 to 82, and 93 to 100)
        this.physics.add.collider(this.ball, this.cup, () => {
            // Increase the score by 1 when the ball touches the cup
            this.score++;
            this.scoreText.setText('Score: ' + this.score);

            // Challenge 1: reset ball position
            this.ball.setPosition(width / 2, height - height / 10);
        });
    }
}

// Challenges/Tasks assigned at end of class 10/27/2023
// first 3 should be less than 5 lines of code, 4th one is longest code
// 1: Add logic so the ball resets to the bottom on a successful “hole-in”
// 2: Improve shot logic by making the input pointer’s relative x-position shoot the ball in the correct x direction
// 3: Make one obstacle move left/right and bounce against the screen edges
// 4: Create and display (1) a shot counter (2) score (“hole-in”) and (3) successful shot percentage