alert("game.js loaded!");
class MinesweeperGame {
  constructor(rows = 9, cols = 9, mineCount = 10) {
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mineCount;
    this.board = [];
    this.revealed = 0;
    this.gameOver = false;
    this.flagCount = 0;
    this.firstClick = true;
    this.timer = 0;
    this.timerInterval = null;

    this.initializeBoard();
  }

  initializeBoard() {
    // 빈 보드 생성
    this.board = Array(this.rows)
      .fill()
      .map(() =>
        Array(this.cols)
          .fill()
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          }))
      );
  }

  placeMines(firstClickRow, firstClickCol) {
    // 지뢰 수가 배치 가능한 셀 수보다 많은 경우 예외 처리
    const safeArea = 9; // 첫 클릭 위치와 주변 8칸
    const totalCells = this.rows * this.cols;
    const maxMines = totalCells - safeArea;

    if (this.mineCount > maxMines) {
      this.mineCount = maxMines;
      console.warn(`지뢰 수가 너무 많아 ${maxMines}개로 조정되었습니다.`);
    }

    let minesPlaced = 0;

    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);

      // 첫 클릭 위치와 주변 8칸에는 지뢰를 배치하지 않음
      const isFirstClickArea =
        Math.abs(row - firstClickRow) <= 1 &&
        Math.abs(col - firstClickCol) <= 1;

      if (!this.board[row][col].isMine && !isFirstClickArea) {
        this.board[row][col].isMine = true;
        minesPlaced++;

        // 주변 8칸의 neighborMines 값 증가
        this.incrementNeighborMines(row, col);
      }
    }

    this.firstClick = false;

    // 디버깅용 - 개발 중에만 사용
    try {
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "development"
      ) {
        this.printMineLocations();
      }
    } catch (e) {
      // 아무것도 안 함
    }
  }

  incrementNeighborMines(row, col) {
    // 주변 8방향에 대한 상대 좌표 배열
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // 보드 범위 내에 있는지 확인
      if (
        newRow >= 0 &&
        newRow < this.rows &&
        newCol >= 0 &&
        newCol < this.cols
      ) {
        this.board[newRow][newCol].neighborMines++;
      }
    }
  }

  // 특정 셀의 주변 지뢰 수를 계산하는 유틸리티 메서드 추가
  calculateNeighborMines(row, col) {
    let count = 0;
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 &&
        newRow < this.rows &&
        newCol >= 0 &&
        newCol < this.cols &&
        this.board[newRow][newCol].isMine
      ) {
        count++;
      }
    }

    return count;
  }

  // 전체 보드의 neighborMines 값을 재계산하는 메서드 추가
  recalculateAllNeighborMines() {
    // 모든 셀의 neighborMines 값을 0으로 초기화
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.board[row][col].neighborMines = 0;
      }
    }

    // 지뢰가 있는 셀 주변의 neighborMines 값 증가
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isMine) {
          this.incrementNeighborMines(row, col);
        }
      }
    }
  }

  // 디버깅용 - 지뢰 위치 출력
  printMineLocations() {
    console.log("지뢰 위치:");
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isMine) {
          console.log(`[${row}, ${col}]`);
        }
      }
    }
  }

  // 게임 보드 크기 변경 메서드
  resizeBoard(rows, cols, mineCount) {
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mineCount;
    this.reset();
  }

  // 난이도 설정 메서드
  setDifficulty(level) {
    switch (level) {
      case "beginner":
        this.resizeBoard(9, 9, 10);
        break;
      case "intermediate":
        this.resizeBoard(16, 16, 40);
        break;
      case "expert":
        this.resizeBoard(16, 30, 99);
        break;
      case "custom":
        // 커스텀 설정은 별도 UI를 통해 처리
        break;
      default:
        this.resizeBoard(9, 9, 10); // 기본값은 초급
    }

    return {
      rows: this.rows,
      cols: this.cols,
      mines: this.mineCount,
    };
  }

  // 첫 번째 클릭 처리 메서드
  handleFirstClick(row, col) {
    if (this.firstClick) {
      this.placeMines(row, col);
      return true;
    }
    return false;
  }

  // 타이머 시작
  startTimer() {
    if (this.timerInterval) return;

    const timerElement = document.querySelector(".timer");
    this.timer = 0;
    if (timerElement) {
      timerElement.textContent = this.timer;
    }

    // 메모리 누수 방지를 위한 안전한 타이머 설정
    this.timerInterval = setInterval(() => {
      try {
        this.timer++;
        if (timerElement && timerElement.parentNode) {
          timerElement.textContent = this.timer;
        }

        // 999초 제한 (기존 지뢰찾기 게임과 동일)
        if (this.timer >= 999) {
          this.stopTimer();
        }
      } catch (error) {
        console.error("Timer error:", error);
        this.stopTimer();
      }
    }, 1000);
  }

  // 타이머 정지
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 타이머 리셋
  resetTimer() {
    this.stopTimer();
    this.timer = 0;
    const timerElement = document.querySelector(".timer");
    if (timerElement) {
      timerElement.textContent = "0";
    }
  }

  // 셀 클릭 처리
  revealCell(row, col) {
    // 이미 게임이 끝났거나, 이미 열린 셀이거나, 깃발이 꽂힌 셀이면 무시
    if (
      this.gameOver ||
      this.board[row][col].isRevealed ||
      this.board[row][col].isFlagged
    ) {
      return "invalid";
    }

    // 첫 클릭인 경우: 지뢰 배치 후, 다시 셀 오픈을 재귀적으로 호출
    if (this.firstClick) {
      this.handleFirstClick(row, col);
      this.startTimer();
      gameStats.recordGameStart(this.getDifficultyName());
      return this.revealCell(row, col); // 첫 클릭 플래그가 false로 바뀌었으니, 다시 셀 오픈
    }

    // 지뢰를 클릭한 경우
    if (this.board[row][col].isMine) {
      this.gameOver = true;
      this.stopTimer();
      this.revealAllMines();
      return "gameover";
    }

    // 셀 오픈
    this.board[row][col].isRevealed = true;
    this.revealed++;

    // 주변 지뢰가 없는 빈 셀인 경우 재귀적으로 주변 셀 오픈
    if (this.board[row][col].neighborMines === 0) {
      this.revealEmptyCells(row, col);
    }

    // 승리 조건 체크: 지뢰가 아닌 모든 셀이 열렸는지
    if (this.revealed === this.rows * this.cols - this.mineCount) {
      this.gameOver = true;
      this.stopTimer();
      return "win";
    }

    return "continue";
  }

  // 빈 셀 주변을 재귀적으로 열기
  revealEmptyCells(row, col) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      // 보드 범위 내에 있는지 확인
      if (
        newRow >= 0 &&
        newRow < this.rows &&
        newCol >= 0 &&
        newCol < this.cols
      ) {
        const cell = this.board[newRow][newCol];

        // 이미 열린 셀이거나 깃발이 꽂힌 셀은 무시
        if (cell.isRevealed || cell.isFlagged) {
          continue;
        }

        // 셀 오픈
        cell.isRevealed = true;
        this.revealed++;

        // 빈 셀이면 재귀 호출
        if (cell.neighborMines === 0) {
          this.revealEmptyCells(newRow, newCol);
        }
      }
    }
  }

  // 깃발 토글
  toggleFlag(row, col) {
    // 이미 열린 셀이거나 게임이 끝난 경우 무시
    if (this.board[row][col].isRevealed || this.gameOver) {
      return this.flagCount;
    }

    if (this.board[row][col].isFlagged) {
      this.board[row][col].isFlagged = false;
      this.flagCount--;
    } else {
      this.board[row][col].isFlagged = true;
      this.flagCount++;
    }

    // 지뢰 카운터 업데이트
    this.updateMineCounter();

    return this.flagCount;
  }

  // 모든 지뢰 보여주기 (게임 오버 시)
  revealAllMines() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isMine) {
          this.board[row][col].isRevealed = true;
        }
      }
    }
  }

  // 게임 리셋
  reset() {
    // 타이머 정리
    this.stopTimer();

    // 보드 데이터 정리
    this.board = [];
    this.revealed = 0;
    this.gameOver = false;
    this.flagCount = 0;
    this.firstClick = true;
    this.resetTimer();

    this.initializeBoard();

    // UI 업데이트
    this.updateMineCounter();

    // 모든 셀의 애니메이션 클래스 제거 (안전한 방식)
    try {
      const cells = document.querySelectorAll(".cell");
      cells.forEach((cell) => {
        if (cell && cell.parentNode) {
          cell.classList.remove("mine-exploded", "newly-revealed");
          cell.style.backgroundColor = "";
          cell.style.color = "";
          cell.style.fontWeight = "";
        }
      });
    } catch (error) {
      console.error("Error cleaning up cells:", error);
    }

    if (typeof renderBoard === "function") {
      renderBoard();
    }
  }

  // 지뢰 카운터 업데이트
  updateMineCounter() {
    const mineCountElement = document.querySelector(".mine-counter");
    if (mineCountElement) {
      mineCountElement.textContent = this.mineCount - this.flagCount;
    }
  }

  // 게임 상태 저장
  saveGame() {
    const gameState = {
      rows: this.rows,
      cols: this.cols,
      mineCount: this.mineCount,
      board: this.board,
      revealed: this.revealed,
      gameOver: this.gameOver,
      flagCount: this.flagCount,
      firstClick: this.firstClick,
      timer: this.timer,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem("minesweeper_game", JSON.stringify(gameState));
      console.log("게임 상태 저장 완료");
    } catch (error) {
      console.error("게임 상태 저장 실패:", error);
    }
  }

  // 게임 상태 불러오기
  loadGame() {
    const savedState = localStorage.getItem("minesweeper_game");
    if (!savedState) return false;

    try {
      const gameState = JSON.parse(savedState);

      // 저장된 게임 상태 복원
      this.rows = gameState.rows;
      this.cols = gameState.cols;
      this.mineCount = gameState.mineCount;
      this.board = gameState.board;
      this.revealed = gameState.revealed;
      this.gameOver = gameState.gameOver;
      this.flagCount = gameState.flagCount;
      this.firstClick = gameState.firstClick;
      this.timer = gameState.timer;

      // 타이머 재시작 (게임이 진행 중인 경우)
      if (!this.gameOver && !this.firstClick) {
        this.startTimer();
      }

      console.log("게임 상태 불러오기 완료");
      return true;
    } catch (error) {
      console.error("게임 상태 불러오기 실패:", error);
      return false;
    }
  }

  // 저장된 게임 삭제
  clearSavedGame() {
    localStorage.removeItem("minesweeper_game");
    console.log("저장된 게임 삭제 완료");
  }

  // 저장된 게임 존재 여부 확인
  hasSavedGame() {
    return localStorage.getItem("minesweeper_game") !== null;
  }

  // 현재 난이도 이름 반환
  getDifficultyName() {
    if (
      this.rows === DIFFICULTY.BEGINNER.rows &&
      this.cols === DIFFICULTY.BEGINNER.cols &&
      this.mineCount === DIFFICULTY.BEGINNER.mines
    ) {
      return "beginner";
    } else if (
      this.rows === DIFFICULTY.INTERMEDIATE.rows &&
      this.cols === DIFFICULTY.INTERMEDIATE.cols &&
      this.mineCount === DIFFICULTY.INTERMEDIATE.mines
    ) {
      return "intermediate";
    } else if (
      this.rows === DIFFICULTY.EXPERT.rows &&
      this.cols === DIFFICULTY.EXPERT.cols &&
      this.mineCount === DIFFICULTY.EXPERT.mines
    ) {
      return "expert";
    } else {
      return "custom";
    }
  }
}

// 난이도 설정
const DIFFICULTY = {
  BEGINNER: { rows: 9, cols: 9, mines: 10 },
  INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
  EXPERT: { rows: 16, cols: 30, mines: 99 },
};

// 게임 통계 클래스
class GameStatistics {
  constructor() {
    this.stats = this.loadStats();
  }

  // 통계 불러오기
  loadStats() {
    const savedStats = localStorage.getItem("minesweeper_stats");
    return savedStats
      ? JSON.parse(savedStats)
      : {
          beginner: { played: 0, won: 0, bestTime: null },
          intermediate: { played: 0, won: 0, bestTime: null },
          expert: { played: 0, won: 0, bestTime: null },
          custom: { played: 0, won: 0 },
        };
  }

  // 통계 저장
  saveStats() {
    localStorage.setItem("minesweeper_stats", JSON.stringify(this.stats));
  }

  // 게임 시작 기록
  recordGameStart(difficulty) {
    this.stats[difficulty].played++;
    this.saveStats();
  }

  // 게임 승리 기록
  recordGameWin(difficulty, time) {
    this.stats[difficulty].won++;

    // 최고 기록 갱신 확인 (custom 난이도 제외)
    if (difficulty !== "custom") {
      if (
        !this.stats[difficulty].bestTime ||
        time < this.stats[difficulty].bestTime
      ) {
        this.stats[difficulty].bestTime = time;
      }
    }

    this.saveStats();
    return this.isNewBestTime(difficulty, time);
  }

  // 최고 기록 확인
  isNewBestTime(difficulty, time) {
    if (difficulty === "custom") return false;
    return this.stats[difficulty].bestTime === time;
  }

  // 승률 계산
  getWinRate(difficulty) {
    const { played, won } = this.stats[difficulty];
    return played > 0 ? Math.round((won / played) * 100) : 0;
  }

  // 통계 초기화
  resetStats() {
    this.stats = {
      beginner: { played: 0, won: 0, bestTime: null },
      intermediate: { played: 0, won: 0, bestTime: null },
      expert: { played: 0, won: 0, bestTime: null },
      custom: { played: 0, won: 0 },
    };
    this.saveStats();
  }
}

// 게임 통계 인스턴스 생성
const gameStats = new GameStatistics();

// 게임 인스턴스 생성
const game = new MinesweeperGame();

// 난이도 변경 함수
function changeDifficulty(rows, cols, mines) {
  game.clearSavedGame(); // 난이도 변경 시 저장된 게임 삭제
  game.resizeBoard(rows, cols, mines);
  renderBoard();
  adjustBoardContainer();
  game.updateMineCounter();
  game.resetTimer();

  // 재시작 버튼 초기화
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    restartBtn.textContent = "😊";
  }
}

function renderBoard() {
  const boardElement = document.getElementById("game-board");
  boardElement.innerHTML = "";
  boardElement.style.gridTemplateColumns = `repeat(${game.cols}, 30px)`;
  boardElement.style.gridTemplateRows = `repeat(${game.rows}, 30px)`;

  for (let row = 0; row < game.rows; row++) {
    for (let col = 0; col < game.cols; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      boardElement.appendChild(cell);
    }
  }

  // 초기 보드 생성 후 상태 업데이트
  updateBoard();
}

function updateGameStatus() {
  // 게임 상태 표시
  const restartBtn = document.getElementById("restart-btn");
  if (restartBtn) {
    if (game.gameOver) {
      const isWin = game.revealed === game.rows * game.cols - game.mineCount;
      restartBtn.textContent = isWin ? "😎" : "😵";
    } else {
      restartBtn.textContent = "😊";
    }
  }
}

// 게임 보드 크기에 따라 컨테이너 크기 조정
function adjustBoardContainer() {
  const container = document.querySelector(".game-container");
  if (container) {
    const cellSize = 30; // px
    const borderWidth = 1; // px
    const width = game.cols * (cellSize + 2 * borderWidth);
    const height = game.rows * (cellSize + 2 * borderWidth);

    container.style.width = `${width + 20}px`; // 패딩 추가
    container.style.minHeight = `${height + 100}px`; // 추가 UI 공간 확보
  }
}

// 난이도 설정 UI 연결 함수
function setupDifficultyControls() {
  // 개별 난이도 버튼 이벤트 리스너
  document.getElementById("beginner-btn").addEventListener("click", () => {
    const { rows, cols, mines } = DIFFICULTY.BEGINNER;
    changeDifficulty(rows, cols, mines);
    setActiveDifficultyButton("beginner-btn");
  });

  document.getElementById("intermediate-btn").addEventListener("click", () => {
    const { rows, cols, mines } = DIFFICULTY.INTERMEDIATE;
    changeDifficulty(rows, cols, mines);
    setActiveDifficultyButton("intermediate-btn");
  });

  document.getElementById("expert-btn").addEventListener("click", () => {
    const { rows, cols, mines } = DIFFICULTY.EXPERT;
    changeDifficulty(rows, cols, mines);
    setActiveDifficultyButton("expert-btn");
  });

  document.getElementById("custom-btn").addEventListener("click", () => {
    showCustomDialog();
  });
}

// 활성 난이도 버튼 설정
function setActiveDifficultyButton(activeId) {
  const buttons = document.querySelectorAll(".difficulty-btn");
  buttons.forEach((btn) => btn.classList.remove("active"));
  document.getElementById(activeId).classList.add("active");
}

// 게임 정보 UI 업데이트
function updateGameInfo(settings) {
  const infoElement = document.getElementById("game-info");
  if (infoElement) {
    infoElement.textContent = `보드: ${settings.rows}×${settings.cols}, 지뢰: ${settings.mines}`;
  }
}

// 셀 클릭 이벤트 핸들러
function handleCellClick(event) {
  const cell = event.target;
  if (!cell.classList.contains("cell")) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  const result = game.revealCell(row, col);
  updateBoard();

  if (result === "gameover") {
    // 클릭한 지뢰 셀에 특별한 스타일 적용
    cell.classList.add("mine-exploded");

    // 약간의 지연 후 결과 화면 표시
    setTimeout(() => {
      showGameResult(false);
    }, 1000);
  } else if (result === "win") {
    // 약간의 지연 후 결과 화면 표시
    setTimeout(() => {
      showGameResult(true);
    }, 1000);
  }
}

// 우클릭 깃발 표시 이벤트 핸들러
function handleCellRightClick(event) {
  event.preventDefault(); // 컨텍스트 메뉴 방지

  const cell = event.target;
  if (!cell.classList.contains("cell")) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  game.toggleFlag(row, col);
  updateBoard();
}

// 게임 보드 UI 업데이트 함수
function updateBoard() {
  const boardElement = document.getElementById("game-board");
  const cells = boardElement.querySelectorAll(".cell");

  for (let row = 0; row < game.rows; row++) {
    for (let col = 0; col < game.cols; col++) {
      const index = row * game.cols + col;
      const cell = cells[index];
      const cellData = game.board[row][col];

      // 이전 상태 저장
      const wasRevealed = cell.classList.contains("revealed");

      // 기존 클래스 및 스타일 초기화 (애니메이션 클래스 제외)
      const animationClasses = ["newly-revealed", "mine-exploded"];
      const currentAnimationClasses = animationClasses.filter((cls) =>
        cell.classList.contains(cls)
      );

      cell.className = "cell";
      cell.textContent = "";
      cell.style.backgroundColor = "";
      cell.style.color = "";

      // 애니메이션 클래스 복원
      currentAnimationClasses.forEach((cls) => cell.classList.add(cls));

      // 셀 상태에 따라 UI 업데이트
      if (cellData.isRevealed) {
        // 새로 열린 셀에만 애니메이션 적용
        if (!wasRevealed) {
          cell.classList.add("newly-revealed");
          // 애니메이션 완료 후 클래스 제거
          setTimeout(() => {
            cell.classList.remove("newly-revealed");
          }, 200);
        }

        cell.classList.add("revealed");

        if (cellData.isMine) {
          cell.textContent = "💣";
          cell.style.backgroundColor = "#ffcccc";
        } else if (cellData.neighborMines > 0) {
          cell.textContent = cellData.neighborMines;
          // 숫자에 따라 색상 지정
          const colors = [
            "blue",
            "green",
            "red",
            "purple",
            "maroon",
            "turquoise",
            "black",
            "gray",
          ];
          cell.style.color = colors[cellData.neighborMines - 1];
          cell.style.fontWeight = "bold";
        }
      } else if (cellData.isFlagged) {
        cell.classList.add("flagged");
        cell.textContent = "🚩";
      }
    }
  }

  // 게임 상태 업데이트
  updateGameStatus();
}

// UI 이벤트 핸들러 설정
function setupBoardEvents() {
  const boardElement = document.getElementById("game-board");

  boardElement.addEventListener("click", handleCellClick);
  boardElement.addEventListener("contextmenu", handleCellRightClick);
}

// 리셋 버튼 이벤트 설정
function setupResetButton() {
  const resetButton = document.getElementById("restart-btn");
  if (resetButton) {
    resetButton.addEventListener("click", () => {
      game.clearSavedGame(); // 재시작 시 저장된 게임 삭제
      game.reset();
      adjustBoardContainer();
    });
  }
}

// 게임 결과 표시 함수
function showGameResult(isWin) {
  const resultElement = document.createElement("div");
  resultElement.className = `game-result ${isWin ? "win" : "lose"}`;

  const difficultyName = game.getDifficultyName();
  const difficultyDisplayName = {
    beginner: "초급",
    intermediate: "중급",
    expert: "고급",
    custom: "사용자 정의",
  }[difficultyName];

  if (isWin) {
    // 승리 기록 및 최고 기록 확인
    const isNewBest = gameStats.recordGameWin(difficultyName, game.timer);

    resultElement.innerHTML = `
      <h2>축하합니다! 승리했습니다!</h2>
      <div class="stats">
        <div>소요 시간: ${game.timer}초 ${isNewBest ? "(최고 기록!)" : ""}</div>
        <div>난이도: ${difficultyDisplayName}</div>
        <div>승률: ${gameStats.getWinRate(difficultyName)}%</div>
      </div>
      <button id="play-again">다시 플레이</button>
      <button id="show-stats">통계 보기</button>
    `;
  } else {
    resultElement.innerHTML = `
      <h2>게임 오버!</h2>
      <div class="stats">
        <div>소요 시간: ${game.timer}초</div>
        <div>난이도: ${difficultyDisplayName}</div>
        <div>승률: ${gameStats.getWinRate(difficultyName)}%</div>
      </div>
      <button id="try-again">다시 시도</button>
      <button id="show-stats">통계 보기</button>
    `;
  }

  document.body.appendChild(resultElement);

  // 다시 플레이 버튼 이벤트 리스너
  document
    .getElementById(isWin ? "play-again" : "try-again")
    .addEventListener("click", () => {
      document.body.removeChild(resultElement);
      game.clearSavedGame(); // 결과 화면에서 재시작 시 저장된 게임 삭제
      game.reset();
      adjustBoardContainer();
    });

  // 통계 보기 버튼 이벤트 리스너
  document.getElementById("show-stats").addEventListener("click", () => {
    document.body.removeChild(resultElement);
    showStatistics();
  });
}

// 현재 난이도 이름 반환 함수
function getDifficultyName() {
  const { rows, cols, mineCount } = game;

  if (
    rows === DIFFICULTY.BEGINNER.rows &&
    cols === DIFFICULTY.BEGINNER.cols &&
    mineCount === DIFFICULTY.BEGINNER.mines
  ) {
    return "초급 (9×9)";
  } else if (
    rows === DIFFICULTY.INTERMEDIATE.rows &&
    cols === DIFFICULTY.INTERMEDIATE.cols &&
    mineCount === DIFFICULTY.INTERMEDIATE.mines
  ) {
    return "중급 (16×16)";
  } else if (
    rows === DIFFICULTY.EXPERT.rows &&
    cols === DIFFICULTY.EXPERT.cols &&
    mineCount === DIFFICULTY.EXPERT.mines
  ) {
    return "고급 (16×30)";
  } else {
    return `사용자 정의 (${rows}×${cols})`;
  }
}

// 사용자 정의 난이도 대화상자
function showCustomDialog() {
  const dialog = document.createElement("div");
  dialog.className = "custom-dialog";
  dialog.innerHTML = `
    <h3>사용자 정의 설정</h3>
    <div>
      <label>행: <input type="number" id="custom-rows" min="5" max="24" value="9"></label>
    </div>
    <div>
      <label>열: <input type="number" id="custom-cols" min="5" max="30" value="9"></label>
    </div>
    <div>
      <label>지뢰 수: <input type="number" id="custom-mines" min="1" max="200" value="10"></label>
    </div>
    <div class="button-group">
      <button id="custom-apply">적용</button>
      <button id="custom-cancel">취소</button>
    </div>
  `;

  document.body.appendChild(dialog);

  // 적용 버튼 이벤트
  document.getElementById("custom-apply").addEventListener("click", () => {
    const rows = parseInt(document.getElementById("custom-rows").value);
    const cols = parseInt(document.getElementById("custom-cols").value);
    let mines = parseInt(document.getElementById("custom-mines").value);

    // 입력값 유효성 검사
    const validRows = Math.min(Math.max(rows, 5), 24);
    const validCols = Math.min(Math.max(cols, 5), 30);

    // 지뢰 수 유효성 검사 (전체 셀의 1/3 이하로 제한)
    const maxMines = Math.floor((validRows * validCols) / 3);
    const validMines = Math.min(Math.max(mines, 1), maxMines);

    changeDifficulty(validRows, validCols, validMines);
    setActiveDifficultyButton("custom-btn");
    document.body.removeChild(dialog);
  });

  // 취소 버튼 이벤트
  document.getElementById("custom-cancel").addEventListener("click", () => {
    document.body.removeChild(dialog);
  });

  // 외부 클릭 시 대화상자 닫기
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      document.body.removeChild(dialog);
    }
  });

  // 첫 번째 입력 필드에 포커스
  document.getElementById("custom-rows").focus();
}

// 저장된 게임 불러오기/새 게임 시작 선택 대화상자
function showLoadGameDialog() {
  const dialog = document.createElement("div");
  dialog.className = "custom-dialog";
  dialog.innerHTML = `
    <h3>저장된 게임이 있습니다</h3>
    <p>이전 게임을 계속하시겠습니까?</p>
    <div class="button-group">
      <button id="load-game-btn">이어하기</button>
      <button id="new-game-btn">새 게임</button>
    </div>
  `;

  document.body.appendChild(dialog);

  document.getElementById("load-game-btn").addEventListener("click", () => {
    if (game.loadGame()) {
      renderBoard();
      updateBoard();
      game.updateMineCounter();

      // 타이머 표시 업데이트
      const timerElement = document.querySelector(".timer");
      if (timerElement) {
        timerElement.textContent = game.timer;
      }

      // 게임 상태에 따라 이모티콘 설정
      updateGameStatus();

      adjustBoardContainer();
    }
    document.body.removeChild(dialog);
  });

  document.getElementById("new-game-btn").addEventListener("click", () => {
    game.clearSavedGame();
    game.reset();
    adjustBoardContainer();
    document.body.removeChild(dialog);
  });

  // 외부 클릭 시 대화상자 닫기
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      // 기본적으로 새 게임 시작
      game.clearSavedGame();
      game.reset();
      adjustBoardContainer();
      document.body.removeChild(dialog);
    }
  });
}

// 자동 저장 기능
function setupAutoSave() {
  // 주기적으로 게임 상태 저장 (5초마다)
  setInterval(() => {
    if (!game.gameOver && !game.firstClick) {
      game.saveGame();
    }
  }, 5000);

  // 페이지 언로드 시 게임 상태 저장
  window.addEventListener("beforeunload", () => {
    if (!game.gameOver && !game.firstClick) {
      game.saveGame();
    }
  });
}

// 통계 화면 표시
function showStatistics() {
  const statsElement = document.createElement("div");
  statsElement.className = "game-result";

  const stats = gameStats.stats;

  statsElement.innerHTML = `
    <h2>게임 통계</h2>
    <div class="stats-container">
      <table>
        <tr>
          <th>난이도</th>
          <th>게임 수</th>
          <th>승리</th>
          <th>승률</th>
          <th>최고 기록</th>
        </tr>
        <tr>
          <td>초급</td>
          <td>${stats.beginner.played}</td>
          <td>${stats.beginner.won}</td>
          <td>${gameStats.getWinRate("beginner")}%</td>
          <td>${
            stats.beginner.bestTime ? stats.beginner.bestTime + "초" : "-"
          }</td>
        </tr>
        <tr>
          <td>중급</td>
          <td>${stats.intermediate.played}</td>
          <td>${stats.intermediate.won}</td>
          <td>${gameStats.getWinRate("intermediate")}%</td>
          <td>${
            stats.intermediate.bestTime
              ? stats.intermediate.bestTime + "초"
              : "-"
          }</td>
        </tr>
        <tr>
          <td>고급</td>
          <td>${stats.expert.played}</td>
          <td>${stats.expert.won}</td>
          <td>${gameStats.getWinRate("expert")}%</td>
          <td>${stats.expert.bestTime ? stats.expert.bestTime + "초" : "-"}</td>
        </tr>
        <tr>
          <td>사용자 정의</td>
          <td>${stats.custom.played}</td>
          <td>${stats.custom.won}</td>
          <td>${gameStats.getWinRate("custom")}%</td>
          <td>-</td>
        </tr>
      </table>
    </div>
    <button id="close-stats">닫기</button>
    <button id="reset-stats">통계 초기화</button>
  `;

  document.body.appendChild(statsElement);

  // 닫기 버튼 이벤트 리스너
  document.getElementById("close-stats").addEventListener("click", () => {
    document.body.removeChild(statsElement);
  });

  // 통계 초기화 버튼 이벤트 리스너
  document.getElementById("reset-stats").addEventListener("click", () => {
    if (confirm("정말 모든 통계를 초기화하시겠습니까?")) {
      gameStats.resetStats();
      document.body.removeChild(statsElement);
      showStatistics(); // 초기화된 통계 다시 표시
    }
  });
}

// IPC 이벤트 리스너 (Electron 메인 프로세스와 통신)
function setupIPC() {
  try {
    if (typeof require !== "undefined") {
      const { ipcRenderer } = require("electron");

      // IPC 이벤트 리스너 등록
      ipcRenderer.on("new-game", () => {
        try {
          game.clearSavedGame();
          game.reset();
          renderBoard();
          adjustBoardContainer();
          const restartBtn = document.getElementById("restart-btn");
          if (restartBtn) {
            restartBtn.textContent = "😊";
          }
        } catch (error) {
          console.error("Error handling new-game:", error);
        }
      });

      ipcRenderer.on("change-difficulty", (event, difficulty) => {
        try {
          switch (difficulty) {
            case "beginner":
              changeDifficulty(
                DIFFICULTY.BEGINNER.rows,
                DIFFICULTY.BEGINNER.cols,
                DIFFICULTY.BEGINNER.mines
              );
              setActiveDifficultyButton("beginner-btn");
              break;
            case "intermediate":
              changeDifficulty(
                DIFFICULTY.INTERMEDIATE.rows,
                DIFFICULTY.INTERMEDIATE.cols,
                DIFFICULTY.INTERMEDIATE.mines
              );
              setActiveDifficultyButton("intermediate-btn");
              break;
            case "expert":
              changeDifficulty(
                DIFFICULTY.EXPERT.rows,
                DIFFICULTY.EXPERT.cols,
                DIFFICULTY.EXPERT.mines
              );
              setActiveDifficultyButton("expert-btn");
              break;
            case "custom":
              showCustomDialog();
              break;
          }
        } catch (error) {
          console.error("Error handling change-difficulty:", error);
        }
      });

      ipcRenderer.on("show-statistics", () => {
        try {
          showStatistics();
        } catch (error) {
          console.error("Error handling show-statistics:", error);
        }
      });

      ipcRenderer.on("show-help", () => {
        try {
          showHelp();
        } catch (error) {
          console.error("Error handling show-help:", error);
        }
      });

      ipcRenderer.on("show-about", () => {
        try {
          showAbout();
        } catch (error) {
          console.error("Error handling show-about:", error);
        }
      });
    }
  } catch (error) {
    console.error("Error setting up IPC:", error);
  }
}

// 도움말 표시 함수
function showHelp() {
  const helpElement = document.createElement("div");
  helpElement.className = "game-result";
  helpElement.innerHTML = `
    <h2>게임 방법</h2>
    <div class="help-content">
      <p><strong>목표:</strong> 지뢰를 피해 모든 안전한 칸을 열어야 합니다.</p>
      <p><strong>조작:</strong></p>
      <ul>
        <li>좌클릭: 칸 열기</li>
        <li>우클릭: 깃발 표시/제거</li>
      </ul>
      <p><strong>숫자:</strong> 주변 8칸에 있는 지뢰의 개수를 나타냅니다.</p>
      <p><strong>깃발:</strong> 지뢰가 있다고 생각되는 위치에 표시합니다.</p>
      <p><strong>승리 조건:</strong> 지뢰가 아닌 모든 칸을 열면 승리합니다.</p>
    </div>
    <button id="close-help">닫기</button>
  `;

  document.body.appendChild(helpElement);

  document.getElementById("close-help").addEventListener("click", () => {
    document.body.removeChild(helpElement);
  });
}

// 정보 표시 함수
function showAbout() {
  const aboutElement = document.createElement("div");
  aboutElement.className = "game-result";
  aboutElement.innerHTML = `
    <h2>지뢰찾기</h2>
    <div class="about-content">
      <p>버전: 1.0.0</p>
      <p>Electron 기반 지뢰찾기 게임</p>
      <p>© 2024 Minesweeper Electron</p>
      <p>클래식 지뢰찾기 게임의 현대적 구현</p>
    </div>
    <button id="close-about">닫기</button>
  `;

  document.body.appendChild(aboutElement);

  document.getElementById("close-about").addEventListener("click", () => {
    document.body.removeChild(aboutElement);
  });
}

// 메모리 사용량 모니터링
let memoryMonitor = null;

function startMemoryMonitoring() {
  if (memoryMonitor) return;

  memoryMonitor = setInterval(() => {
    try {
      if (performance && performance.memory) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);

        // 메모리 사용량이 80%를 넘으면 경고
        if (usedMB / limitMB > 0.8) {
          console.warn(
            `High memory usage: ${usedMB}MB / ${limitMB}MB (${Math.round(
              (usedMB / limitMB) * 100
            )}%)`
          );

          // 메모리 정리 시도
          if (window.gc) {
            window.gc();
          }
        }

        // 개발 모드에서만 로그 출력
        if (process.env.NODE_ENV === "development") {
          console.log(`Memory: ${usedMB}MB / ${totalMB}MB / ${limitMB}MB`);
        }
      }
    } catch (error) {
      console.error("Memory monitoring error:", error);
    }
  }, 10000); // 10초마다 체크
}

function stopMemoryMonitoring() {
  if (memoryMonitor) {
    clearInterval(memoryMonitor);
    memoryMonitor = null;
  }
}

// 메모리 누수 방지를 위한 정리 함수
function cleanupGame() {
  try {
    if (game) {
      game.stopTimer();
    }

    // 메모리 모니터링 정지
    stopMemoryMonitoring();

    // 모든 이벤트 리스너 제거
    const boardElement = document.getElementById("game-board");
    if (boardElement) {
      boardElement.replaceWith(boardElement.cloneNode(true));
    }

    // 타이머 정리
    if (window.autoSaveInterval) {
      clearInterval(window.autoSaveInterval);
      window.autoSaveInterval = null;
    }

    // 가비지 컬렉션 강제 실행
    if (window.gc) {
      window.gc();
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

// 초기화 및 이벤트 설정
document.addEventListener("DOMContentLoaded", () => {
  try {
    // 메모리 모니터링 시작
    startMemoryMonitoring();

    // IPC 설정
    setupIPC();

    // 저장된 게임이 있는지 확인
    if (game.hasSavedGame()) {
      showLoadGameDialog();
    } else {
      // 저장된 게임이 없으면 새 게임 시작
      renderBoard();
      adjustBoardContainer();
      game.updateMineCounter();
      game.resetTimer();
      setActiveDifficultyButton("beginner-btn");
    }

    // 통계 버튼 추가
    const difficultySelector = document.querySelector(".difficulty-selector");
    if (difficultySelector) {
      const statsButton = document.createElement("button");
      statsButton.id = "stats-btn";
      statsButton.textContent = "통계";
      statsButton.className = "difficulty-btn";
      difficultySelector.appendChild(statsButton);

      statsButton.addEventListener("click", () => {
        try {
          showStatistics();
        } catch (error) {
          console.error("Error showing statistics:", error);
        }
      });
    }

    // 이벤트 리스너 등록
    setupDifficultyControls();
    setupBoardEvents();
    setupResetButton();
    setupAutoSave();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
});

// 페이지 언로드 시 정리
window.addEventListener("beforeunload", () => {
  cleanupGame();
});

// 페이지 숨김 시 타이머 일시정지 (메모리 절약)
document.addEventListener("visibilitychange", () => {
  if (game && game.timerInterval) {
    if (document.hidden) {
      // 페이지가 숨겨지면 타이머 일시정지
      game.stopTimer();
    } else {
      // 페이지가 다시 보이면 타이머 재시작
      if (!game.gameOver && !game.firstClick) {
        game.startTimer();
      }
    }
  }
});
