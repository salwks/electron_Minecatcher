const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const crashRecovery = require("./crash-recovery");

let mainWindow;

// 예외 처리 강화
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // 크래시 방지를 위한 안전한 종료
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// 메모리 누수 방지를 위한 정리 함수
function cleanup() {
  if (mainWindow) {
    mainWindow.removeAllListeners();
    mainWindow.webContents.removeAllListeners();
    mainWindow = null;
  }
}

// 앱 메뉴 설정
function createMenu() {
  const template = [
    {
      label: "파일",
      submenu: [
        {
          label: "새 게임",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("new-game");
            }
          },
        },
        { type: "separator" },
        { label: "종료", role: "quit" },
      ],
    },
    {
      label: "난이도",
      submenu: [
        {
          label: "초급",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("change-difficulty", "beginner");
            }
          },
        },
        {
          label: "중급",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("change-difficulty", "intermediate");
            }
          },
        },
        {
          label: "고급",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("change-difficulty", "expert");
            }
          },
        },
        {
          label: "사용자 정의",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              // 사용자 정의는 렌더러에서 IPC로 크기 전달
              mainWindow.webContents.send("change-difficulty", "custom");
            }
          },
        },
      ],
    },
    {
      label: "통계",
      click: () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("show-statistics");
        }
      },
    },
    {
      label: "도움말",
      submenu: [
        {
          label: "게임 방법",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("show-help");
            }
          },
        },
        { type: "separator" },
        {
          label: "정보",
          click: () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send("show-about");
            }
          },
        },
      ],
    },
  ];

  // 개발 모드에서만 개발자 도구 메뉴 추가
  if (process.env.NODE_ENV === "development") {
    template.push({
      label: "개발",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  // 기존 창이 있다면 정리
  if (mainWindow) {
    cleanup();
  }

  // 안전 모드 설정 확인
  const isSafeMode = crashRecovery.isSafeMode();
  console.log("Creating window in safe mode:", isSafeMode);

  const preloadPath = path.join(__dirname, "preload.js");
  console.log("preload 경로:", preloadPath);

  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      nodeIntegration: false, // 보안 강화
      contextIsolation: true, // 보안 강화
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      enableWebSQL: false,
      backgroundThrottling: false,
      v8CacheOptions: isSafeMode ? "none" : "code",
      enableBlinkFeatures: isSafeMode ? "" : "GarbageCollection",
      ...(isSafeMode && {
        disableDialogs: true,
        enableWebCodecs: false,
        enableWebRTC: false,
      }),
      preload: preloadPath,
      sandbox: false,
    },
    show: false,
    backgroundColor: "#ffffff",
  });

  // 메모리 사용량 모니터링
  if (process.env.NODE_ENV === "development") {
    setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const memoryInfo = process.getProcessMemoryInfo();
        console.log("Memory usage:", memoryInfo);
      }
    }, 30000); // 30초마다 체크
  }

  mainWindow.loadFile("src/index.html");

  // 웹 컨텐츠가 완전히 로드된 후 표시
  mainWindow.webContents.once("did-finish-load", () => {
    // 메뉴 생성을 지연시켜 안정성 향상
    setTimeout(() => {
      createMenu();
      mainWindow.show(); // 모든 준비가 완료된 후 표시
    }, 100);
  });

  // 개발용 개발자 도구 열기 (개발 시에만)
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.once("dom-ready", () => {
      mainWindow.webContents.openDevTools();
    });
  }

  // 웹 컨텐츠 크래시 처리 강화
  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.error("Render process gone:", details);
    crashRecovery.incrementCrashCount();

    // 자동 재시작 (최대 3회)
    if (!mainWindow.restartCount) {
      mainWindow.restartCount = 0;
    }

    if (mainWindow.restartCount < 3) {
      mainWindow.restartCount++;
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
      }, 1000);
    } else {
      console.error("Too many restarts, closing app");
      app.quit();
    }
  });

  // 메모리 부족 처리
  mainWindow.webContents.on("crashed", (event) => {
    console.error("Web contents crashed");
    crashRecovery.incrementCrashCount();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.reload();
    }
  });

  // 창이 닫힐 때 참조 정리
  mainWindow.on("closed", () => {
    cleanup();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    // 크래시 복구 확인
    if (crashRecovery.needsCrashRecovery()) {
      console.log(
        "Crash recovery needed. Crash count:",
        crashRecovery.getCrashCount()
      );

      // 안전 모드 활성화
      if (crashRecovery.getCrashCount() >= 3) {
        crashRecovery.enableSafeMode();
        console.log("Safe mode enabled due to multiple crashes");
      }
    }

    createWindow();

    // 성공적으로 시작되면 크래시 카운트 리셋
    setTimeout(() => {
      crashRecovery.resetCrashCount();
      if (crashRecovery.isSafeMode()) {
        crashRecovery.disableSafeMode();
        console.log("Safe mode disabled - app running successfully");
      }
    }, 5000); // 5초 후 안정성 확인
  } catch (error) {
    console.error("Error creating window:", error);
    crashRecovery.incrementCrashCount();
    app.quit();
  }

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      try {
        createWindow();
      } catch (error) {
        console.error("Error creating window on activate:", error);
        crashRecovery.incrementCrashCount();
      }
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    cleanup();
    app.quit();
  }
});

// 앱 종료 전 정리
app.on("before-quit", () => {
  cleanup();
});

// 프로세스 종료 시 정리
process.on("exit", () => {
  cleanup();
});

// SIGTERM 시그널 처리
process.on("SIGTERM", () => {
  cleanup();
  app.quit();
});
