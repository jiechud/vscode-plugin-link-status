

const path = require('path');
const userHome = require('./userHomeDir').default;


const FALLBACK_CONFIG_DIR = path.join(userHome, '.config', 'yarn');
// const FALLBACK_CACHE_DIR = path.join(userHome, '.cache', 'yarn');


function getLocalAppDataDir(): string {
  return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Yarn') : null;
}

export function getDataDir(): string {
  if (process.platform === 'win32') {
    const WIN32_APPDATA_DIR = getLocalAppDataDir();
    return WIN32_APPDATA_DIR === null ? FALLBACK_CONFIG_DIR : path.join(WIN32_APPDATA_DIR, 'Data');
  } else if (process.env.XDG_DATA_HOME) {
    return path.join(process.env.XDG_DATA_HOME, 'yarn');
  } else {
    // This could arguably be ~/Library/Application Support/Yarn on Macs,
    // but that feels unintuitive for a cli tool

    // Instead, use our prior fallback. Some day this could be
    // path.join(userHome, '.local', 'share', 'yarn')
    // or return path.join(WIN32_APPDATA_DIR, 'Data') on win32
    return FALLBACK_CONFIG_DIR;
  }
}


export function getConfigDir(): string {
  if (process.platform === 'win32') {
    // Use our prior fallback. Some day this could be
    // return path.join(WIN32_APPDATA_DIR, 'Config')
    // console.log('working on win32');
    const WIN32_APPDATA_DIR = getLocalAppDataDir();
    // console.log(WIN32_APPDATA_DIR);
    return WIN32_APPDATA_DIR === null ? FALLBACK_CONFIG_DIR : path.join(WIN32_APPDATA_DIR, 'Config');
  } else if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'yarn');
  } else {
    return FALLBACK_CONFIG_DIR;
  }
}