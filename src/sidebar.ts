import * as vscode from 'vscode';
import * as fs from 'fs';
import * as nPath from 'path';
import { getLinkedModules, unlinkModules } from './linkedModules';

import { fsExistsSync, getFolderByPath } from './util/file';
import { Command } from 'vscode';
// 树节点
class EntryItem extends vscode.TreeItem
{
}

interface RootItem {
    name: string;
    path: string;
}


async function getRootFolder(): Promise<any> {
    const workspaceFolders: any = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || !workspaceFolders.length) return;

    if (workspaceFolders.length > 1) {
        return;
    }

    const rootFolder = workspaceFolders?.[0];
    const lernaPath = `${rootFolder?.uri?.path}/packages`;
    console.log('lernaPath=>',rootFolder, lernaPath, fsExistsSync(lernaPath));
    // 判断是否是lerna项目
    if (fsExistsSync(lernaPath)){
        return getFolderByPath(lernaPath);
    } else {
        return [{
            name: rootFolder.name,
            path: nPath.join(rootFolder?.uri?.path)
        }];
    }
}

async function getCurrLinkedModules(packagePath: string): Promise<any> {
    // 获取根目录下的所有文件夹
    const modules = await getLinkedModules(packagePath);
    return modules;
}


//树的内容组织管理
export class EntryList implements vscode.TreeDataProvider<EntryItem>
{
    onDidChangeTreeData?: vscode.Event<void | EntryItem | null | undefined> | undefined;
    getTreeItem(element: EntryItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: EntryItem): vscode.ProviderResult<EntryItem[]> {
        if (element) {//子节点
            return new Promise(async (resolve, reject) => {
                const modules = await getCurrLinkedModules(element?.resourceUri?.path || '');
                const res = modules.map((item: {name: string, actualPath: string}) => {
                    return  new EntryItem(item.name, vscode.TreeItemCollapsibleState.None);
                });
                console.log('res=>', res);
                resolve(res);
                
            });
        } else { //根节点

            return new Promise( async (resolve, reject) => {
                const res = await getRootFolder();
                const root = res.map((item: {name: string, path: string}) => {
                    const entryItem = new EntryItem(vscode.Uri.file(item.path), vscode.TreeItemCollapsibleState.Collapsed);
                    // const command: Command = {
                    //     title: 'UnLink',
                    //     command: 'nodeDependencies.aUnlinkEntry',
                    // };
                    entryItem.contextValue = 'folder';
                    return entryItem;
                });
                console.log('root=>', root);
                resolve(root);
            });
        }
    }
}

export const unlinkAllByPath = async (rootPath: string) => {
    await unlinkModules(rootPath);
};

export const unlinkAll = async () => {
    const folder = await getRootFolder();

    const pAll = folder.map(async (item: RootItem) => {
        await unlinkModules(item.path);
    });
    await Promise.all(pAll);
};
