const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");

// 크래시 복구 설정
const CRASH_RECOVERY_FILE = path.join(
  app.getPath("userData"),
  "crash-recovery.json"
);

// 크래시 복구 데이터 저장
function saveCrashRecoveryData(data) {
  try {
    fs.writeFileSync(CRASH_RECOVERY_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save crash recovery data:", error);
  }
}

// 크래시 복구 데이터 로드
function loadCrashRecoveryData() {
  try {
    if (fs.existsSync(CRASH_RECOVERY_FILE)) {
      const data = JSON.parse(fs.readFileSync(CRASH_RECOVERY_FILE, "utf8"));
      return data;
    }
  } catch (error) {
    console.error("Failed to load crash recovery data:", error);
  }
  return null;
}

// 크래시 복구 데이터 삭제
function clearCrashRecoveryData() {
  try {
    if (fs.existsSync(CRASH_RECOVERY_FILE)) {
      fs.unlinkSync(CRASH_RECOVERY_FILE);
    }
  } catch (error) {
    console.error("Failed to clear crash recovery data:", error);
  }
}

// 크래시 횟수 추적
function incrementCrashCount() {
  const data = loadCrashRecoveryData() || { crashCount: 0, lastCrash: null };
  data.crashCount = (data.crashCount || 0) + 1;
  data.lastCrash = new Date().toISOString();
  saveCrashRecoveryData(data);
  return data.crashCount;
}

// 크래시 횟수 확인
function getCrashCount() {
  const data = loadCrashRecoveryData();
  return data ? data.crashCount : 0;
}

// 크래시 복구 데이터 초기화
function resetCrashCount() {
  const data = loadCrashRecoveryData() || {};
  data.crashCount = 0;
  data.lastCrash = null;
  saveCrashRecoveryData(data);
}

// 크래시 복구 필요 여부 확인
function needsCrashRecovery() {
  const crashCount = getCrashCount();
  return crashCount > 0 && crashCount < 5; // 5회 미만의 크래시만 복구 시도
}

// 안전 모드 설정
function enableSafeMode() {
  const data = loadCrashRecoveryData() || {};
  data.safeMode = true;
  data.safeModeEnabled = new Date().toISOString();
  saveCrashRecoveryData(data);
}

// 안전 모드 비활성화
function disableSafeMode() {
  const data = loadCrashRecoveryData() || {};
  data.safeMode = false;
  data.safeModeDisabled = new Date().toISOString();
  saveCrashRecoveryData(data);
}

// 안전 모드 상태 확인
function isSafeMode() {
  const data = loadCrashRecoveryData();
  return data ? data.safeMode : false;
}

module.exports = {
  saveCrashRecoveryData,
  loadCrashRecoveryData,
  clearCrashRecoveryData,
  incrementCrashCount,
  getCrashCount,
  resetCrashCount,
  needsCrashRecovery,
  enableSafeMode,
  disableSafeMode,
  isSafeMode,
};
