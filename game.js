// configuration object to set size of the grid and when the game is successfully finished.
const config = {
    "grid": 4,
    "sum": 2048
}

// standard input module from node to collect the information about the move from the user.
const standard_input = process.stdin;
standard_input.setEncoding('utf-8');

// class containing all methods to the game.
class Game {
    // constructor method to initialize the variables.
    constructor() {
        this.gridSize = config.grid;
        this.tileNoCheck = config.sum;
        this.board = [];
        this.pastBoard = [];
        this.score = 0;
        this.highestNumber = 0;
        this.emptySpaces = [];
    }

    // method is used to start the game. It generates the initial grid and 
    // start process for the user to enter their inputs. 
    startGame() {
        this.generateInitialBoard();
        this.printBoard();
        this.getMoveInput();
    }

    // method initializes starting board.
    generateInitialBoard() {
        for (let i = 0; i < this.gridSize; i++) {
            let tempArr = [...new Array(this.gridSize)].map(() => 0);
            this.board.push(tempArr);
        }

        let a_ix = this.randomInt(1, this.gridSize);
        let b_ix = this.randomInt(1, this.gridSize);
        if (a_ix == b_ix) {
            b_ix = b_ix == this.gridSize ? b_ix - 1 : b_ix + 1;
        }
        this.board[a_ix - 1][b_ix - 1] = Math.random() > 0.5 ? 4 : 2;
        this.board[b_ix - 1][a_ix - 1] = Math.random() > 0.5 ? 4 : 2;

    }

    // method is used to print the board in console.
    printBoard() {
        console.log("Score : " + this.score + "\n");
        for (let i = 0; i < this.gridSize; i++) {
            console.log(this.board[i].toString().replace(/,/g, "     ") + "\n");
        }
    }

    // method to generate random number.
    randomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low)
    }

    // method initializes the process and gets input from the user.
    getMoveInput() {
        console.log("Please input the next step -> { 1 : left, 2 : right, 3 : up, 4 : down }");
        let gameObj = this;
        standard_input.on('data', function (data) {
            if (data >= 1 && data <= 4) {
                console.log("Please input the next step -> { 1 : left, 2 : right, 3 : up, 4 : down }");
                gameObj.reBuildBoard(data);
            } else {
                console.log("Please give a valid input");
            }
        });
    }

    // method triggers respective method based on user input.
    reBuildBoard(move) {
        this.pastBoard = this.board.map(function (arr) {
            return arr.slice();
        });
        if (parseInt(move) == 1) {
            this.moveLeft();
        } else if (parseInt(move) == 2) {
            this.moveRight();
        } else if (parseInt(move) == 3) {
            this.moveUp();
        } else if (parseInt(move) == 4) {
            this.moveDown();
        }
    }

    // method moves all the elements on board to left, combines the numbers if they are same and adjacent.
    // No reverse or rotation is required as we were aligning all to left in reduceRow method.
    moveLeft() {
        let tempGrid = [];
        for (let i = 0; i < this.gridSize; i++) {
            let tempIx = 0;
            let tempList = [];
            for (let j = 0; j < this.gridSize; j++) {
                tempList.push(this.board[i][tempIx]);
                tempIx += 1;
            }
            let tempListMerged = this.reduceRow(tempList);
            tempGrid.push(tempListMerged);
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = tempGrid[i][j];
            }
        }
        this.afterMove();
    }

    // method moves all the elements on board to right, combines the numbers if they are same and adjacent.
    // reverse is required as we were aligning all to left in reduceRow method.
    moveRight() {
        let tempGrid = [];
        for (let i = 0; i < this.gridSize; i++) {
            let tempIx = this.gridSize - 1;
            let tempList = [];
            for (let j = 0; j < this.gridSize; j++) {
                tempList.push(this.board[i][tempIx]);
                tempIx -= 1;
            }
            let tempListMerged = this.reduceRow(tempList);
            tempGrid.push(tempListMerged);
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = tempGrid[i][this.gridSize - 1 - j];
            }
        }
        this.afterMove();
    }

    // method moves all the elements on board to up, combines the numbers if they are same and adjacent.
    // rotation is required as we were aligning all to left in reduceRow method.
    moveUp() {
        let tempGrid = [];
        for (let i = 0; i < this.gridSize; i++) {
            let tempIx = 0;
            let tempList = [];
            for (let j = 0; j < this.gridSize; j++) {
                tempList.push(this.board[tempIx][i]);
                tempIx += 1;
            }
            let tempListMerged = this.reduceRow(tempList);
            tempGrid.push(tempListMerged);
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = tempGrid[j][i];
            }
        }
        this.afterMove();
    }

    // method moves all the elements on board to down, combines the numbers if they are same and adjacent.
    // reverse or rotation is required as we were aligning all to left in reduceRow method.
    moveDown() {
        let tempGrid = [];
        for (let i = 0; i < this.gridSize; i++) {
            let tempIx = this.gridSize - 1;
            let tempList = [];
            for (let j = 0; j < this.gridSize; j++) {
                tempList.push(this.board[tempIx][i]);
                tempIx -= 1;
            }
            let tempListMerged = this.reduceRow(tempList);
            tempGrid.push(tempListMerged);
        }

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] = tempGrid[j][this.gridSize - 1 - i];
            }
        }
        this.afterMove();
    }

    // method adds up the adjacent elements if they are same, calculate score. All the elements in array are alligned to left.
    reduceRow(row) {
        let return_result = [...new Array(row.length)].map(() => 0);
        let last_ix = 0;

        for (let curr_ix = 0; curr_ix < row.length; curr_ix++) {
            if (row[curr_ix] != 0) {
                return_result[last_ix] = row[curr_ix];
                last_ix += 1;
            }
        }

        for (let ix = 0; ix < row.length; ix++) {
            if (return_result[ix] == return_result[ix + 1] && return_result[ix] != 0) {
                this.score = this.score + return_result[ix] + return_result[ix + 1];
                this.highestNumber = return_result[ix] + return_result[ix + 1] > this.highestNumber ? return_result[ix] + return_result[ix + 1] : this.highestNumber;
                return_result[ix] = return_result[ix] + return_result[ix + 1];
                return_result.splice(ix + 1, 1);
                return_result.push(0);
            }
        }
        return return_result;
    }

    // method gets empty spaces, randomy inserts number to continue the game.
    insertNumber() {
        this.emptySpaces = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.board[i][j] == 0 ? this.emptySpaces.push({ "x": i, "y": j }) : undefined;
            }
        }
        let randObj = this.emptySpaces[this.randomInt(0, this.emptySpaces.length)];
        if (this.emptySpaces.length > 0) {
            this.board[randObj.x][randObj.y] = Math.random() > 0.5 ? 4 : 2;
        }
    }

    // methods checks if there is any change in the previous grid and current. 
    // It is used to verify beforing inserting new number into grid.
    compareBoards() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] != this.pastBoard[i][j]) {
                    return true;
                }
            }
        }
        return false;
    }

    // method checks if there is any possible moves in the game.
    checkGameOver() {
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.board[i][j] == 0) {
                    return false;
                }
                if (i != this.gridSize - 1 && this.board[i][j] == this.board[i + 1][j]) {
                    return false;
                }
                if (j != this.gridSize - 1 && this.board[i][j] == this.board[i][j + 1]) {
                    return false;
                }
            }
        }
        return true;
    }

    // method to complete tasks after moving like, inserting number, checking for game over.
    afterMove() {
        if (this.tileNoCheck == this.highestNumber) {
            console.log("Congragulations!!!!" + "\n" + "You have completed the game." + "\n" + "Your Score : " + this.score);
            process.exit();
        } else {
            let cmpFlg = this.compareBoards();
            if (cmpFlg) {
                this.insertNumber();
                let chkGameOverFlg = this.checkGameOver();
                if (chkGameOverFlg) {
                    this.printBoard();
                    console.log("Game Over!!!!" + "\n" + "No moves left." + "\n" + "Your Score : " + this.score);
                    process.exit();
                } else {
                    this.printBoard();
                }
            } else {
                this.printBoard();
            }
        }
    }

}

// creating instance to the class and starting the game.
let game = new Game();
game.startGame();
