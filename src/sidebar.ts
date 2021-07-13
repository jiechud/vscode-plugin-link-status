import * as vscode from 'vscode';
import * as nPath from 'path';
import { getLinkedModules, unlinkModules, linkModules, getYarnLinkedModules, linkedModule, ILinkedModule, unLinkedModule } from './linkedModules';

import { fsExistsSync, getFolderByPath } from './util/file';

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
    if (!workspaceFolders || !workspaceFolders.length) {return;}

    if (workspaceFolders.length > 1) {return;}
    const rootFolder = workspaceFolders?.[0];
    const lernaPath = `${rootFolder?.uri?.fsPath}/packages`;
    // const lernaPath = `${rootFolder?.uri?.path}/packages`;
    console.log('lernaPath=>',rootFolder, lernaPath, fsExistsSync(lernaPath));
    // 判断是否是lerna项目
    if (fsExistsSync(lernaPath)){
        console.log('Is lerna');
        return getFolderByPath(lernaPath);
    } else {
        console.log('not lerna');
        return [{
            name: rootFolder.name,
            path: nPath.join(rootFolder?.uri?.fsPath)
            // path: nPath.join(rootFolder?.uri?.path)
        }];
    }
}

async function getCurrLinkedModules(packagePath: string): Promise<any> {
    // 获取根目录下的所有文件夹
    const modules = await getLinkedModules(packagePath);
    const modulesYarnList = await getYarnLinkedModules();
    
    const modulesMap: any = {};
    modules.forEach((item) => {
        modulesMap[item.name] = item;
    });
    modulesYarnList.forEach((item: any) => {
    //    item.isLink = modulesMap[item.name];
       item.isLink = (modulesMap[item.name]? true:false );
    });
    // console.log('number of registered link' + modulesYarnList.length);
    return modulesYarnList;
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
                // console.log('path 2 get Linked Modules ===>',element?.resourceUri?.fsPath || '');
                const modules = await getCurrLinkedModules(element?.resourceUri?.fsPath || '');
                // const modules = await getCurrLinkedModules(element?.resourceUri?.path || '');
                const res = modules.map((item: {name: string, actualPath: string, isLink: boolean}) => {
                    // console.log(item.name+' isLink is '+ item.isLink);
                    const itemLabel: any = !item.isLink ? item.name : {
                        label: item.name,
                        highlights:[[0, item.name.length]]
                    };
                    const entryItem: any = new EntryItem(itemLabel, vscode.TreeItemCollapsibleState.None);
                    entryItem.contextValue = 'link';
                    entryItem._data= {path: element?.resourceUri?.fsPath, name: item.name}; // 存放些扩展数据
                    // entryItem._data= {path: element?.resourceUri?.path, name: item.name}; // 存放些扩展数据
                    return entryItem;
                });
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

export const linkAllByPath = async (rootPath: string) => {
    await linkModules(rootPath);
};

export const unlinkAll = async () => {
    const folder = await getRootFolder();
    // console.log('rootfolder when unlinkAll ==>', folder);
    const pAll = folder.map(async (item: RootItem) => {
        await unlinkModules(item.path);
    });
    await Promise.all(pAll);
};

export const linkAll = async () => {
    const folder = await getRootFolder();
    // console.log('rootfolder when unlinkAll ==>', folder);
    const pAll = folder.map(async (item: RootItem) => {
        await linkModules(item.path);
    });
    await Promise.all(pAll);
};

export const unLink = async (packageName: string, rootPath: string) => {
    const linkedModuleD: ILinkedModule= {
        name: packageName,
        actualPath: '',
    };
   await unLinkedModule(linkedModuleD, rootPath);
};

export const link = async (packageName: string, rootPath: string) => {
    // console.log('name ==>', packageName,'path ==>', rootPath);
    const linkedModuleD: ILinkedModule= {
        name: packageName,
        actualPath: '',
    };
   await linkedModule(linkedModuleD, rootPath);
};