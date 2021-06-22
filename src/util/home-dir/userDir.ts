

const path = require('path');
const userHome = require('./userHomeDir').default;


const FALLBACK_CONFIG_DIR = path.join(userHome, '.config', 'yarn');
const FALLBACK_CACHE_DIR = path.join(userHome, '.cache', 'yarn');


function getLocalAppDataDir(): string {
    return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Yarn') : null;
  }

export function getConfigDir(): string {
    if (process.platform === 'win32') {
      // Use our prior fallback. Some day this could be
      // return path.join(WIN32_APPDATA_DIR, 'Config')
      const WIN32_APPDATA_DIR = getLocalAppDataDir();
      return WIN32_APPDATA_DIR == null ? FALLBACK_CONFIG_DIR : path.join(WIN32_APPDATA_DIR, 'Config');
    } else if (process.env.XDG_CONFIG_HOME) {
      return path.join(process.env.XDG_CONFIG_HOME, 'yarn');
    } else {
      return FALLBACK_CONFIG_DIR;
    }
  }