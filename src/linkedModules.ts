import * as path from 'path';

import * as fs from 'fs';
import * as util from 'util';
import * as child_process from 'child_process';
import { getConfigDir, getDataDir} from './util/home-dir/userDir';


const readdir = util.promisify(fs.readdir);
const readlink = util.promisify(fs.readlink);
const lstat = util.promisify(fs.lstat);
const unlink = util.promisify(fs.unlink);
const exec = util.promisify(child_process.exec);


export interface ILinkedModule {
    name: string;
    actualPath: string;
}

export async function hasLinkedModules(rootPath: string): Promise<boolean> {
    // TODO
    return (await getLinkedModules(rootPath)).length > 0;
}

export async function getLinkedModules(rootPath: string): Promise<ILinkedModule[]> {
    return _getLinkedModules(path.join(rootPath, 'node_modules'));
}

export async function unlinkModules(rootPath: string) {
    try {
        const modules = await getLinkedModules(rootPath);
        
        const pAll = modules.map(async (item: ILinkedModule) => {
            return await _yarnUnLink(item, rootPath);
        });
        await Promise.all(pAll);
        return true;
    } catch (error) {
        return false;
    }

}

export async function linkModules(rootPath: string) {
    try {
        const modulesYarnList = await getYarnLinkedModules();
        const pAll = modulesYarnList.map(async (item: ILinkedModule) => {
            return await _yarnLink(item, rootPath);
        });
        await Promise.all(pAll);
        return true;
    } catch (error) {
        return false;
    }

}

export async function getYarnLinkedModules() {
    // const configDir = getConfigDir();
    const dataDir = getDataDir();
   return await _getLinkedModules(path.join(dataDir, 'link'));
}

export async function linkedModule(linkModule: ILinkedModule, rootPath: string) {
   return await _yarnLink(linkModule, rootPath);
}

export async function unLinkedModule(linkModule: ILinkedModule, rootPath: string) {
    return await _yarnUnLink(linkModule, rootPath);
 }

async function _getLinkedModules(nodeModulesDir: string): Promise<ILinkedModule[]> {
    let modules: string[];
    try {
        modules = await readdir(nodeModulesDir);
    } catch (e) {
        return [];
    }

    const linkedModules = await _getLinkedModulesFromDir(nodeModulesDir, modules);
    // console.log('the path 2 find linked modules is: '+nodeModulesDir);
    for (let m of modules) {
        if (m.startsWith('@')) {
            linkedModules.push(... await _getLinkedModules(path.join(nodeModulesDir, m)));
        }
    }

    return linkedModules;
}

async function _getLinkedModulesFromDir(nodeModulesDir: string, modules: string[]): Promise<any> {
    const results = await Promise.all(
        modules.map(async m => {
            const absPath = path.join(nodeModulesDir, m);
            if (await isLinked(absPath)) {
                return <ILinkedModule>{
                    name: m,
                    actualPath: await _getSymlinkTarget(absPath)
                };
            } else {
                return null;
            }
        }));
    return results.filter(result => !!result);
}

/**
 * 递归获取link的最终位置
 * @param folderPath 
 * @returns 
 */
async function _getSymlinkTarget(folderPath: string): Promise<string> {
    const target = await readlink(folderPath);
    const absTarget = path.resolve(folderPath, '..', target);
    if (await isLinked(absTarget)) {
        return _getSymlinkTarget(absTarget);
    }

    return absTarget;
}

async function isLinked(folderPath: string): Promise<boolean> {
    try {
        const stat: fs.Stats = await lstat(folderPath);
        return stat.isSymbolicLink();
    } catch (e) {
        return false;
    }
}

async function _unLink(folderPath: string): Promise<boolean> {
    try {
        console.log('unlink==>path', folderPath);
        await unlink(folderPath);
        return true;
    } catch (error) {
        return false;
    }
}

async function _yarnUnLink(linkModule:ILinkedModule, rootPath: string) {
    try {
        const res: any = await exec(`yarn unlink ${linkModule.name}`, {
            cwd: rootPath,
        });
        return res.stdout;
        
    } catch (error) {
        return false;
    }
}


async function _yarnLink(linkModule:ILinkedModule, rootPath: string) {
    try {
        // console.log('name ==>', linkModule.name,'path ==>', rootPath);
        const res: any = await exec(`yarn link ${linkModule.name}`, {
            cwd: rootPath,
        });
        return res.stdout;
        
    } catch (error) {
        return false;
    }
}