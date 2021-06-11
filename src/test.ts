import * as vscode from 'vscode';
import * as fs from 'fs';
import * as nPath from 'path';
import { getLinkedModules } from './linkedModules';

import { fsExistsSync, getFolderByPath } from './util/file';
// 树节点
export class EntryItem extends vscode.TreeItem
{
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
            path: nPath.join(rootFolder?.uri?.path, rootFolder.name)
        }]
    }
}

async function showLinkedModules(packagePath: string): Promise<any> {
    // 获取根目录下的所有文件夹
    const modules = await getLinkedModules(packagePath)
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
                const modules = await showLinkedModules(element?.resourceUri?.path || '');
                const res = modules.map((item: {name: string, actualPath: string}) => {
                    return  new EntryItem(item.name, vscode.TreeItemCollapsibleState.None);
                })
                resolve(res);
                // var childs = [];
                // for (let index = 0; index < 3; index++) {
                //     let str = index.toString();
                //     var item = new EntryItem(str,vscode.TreeItemCollapsibleState.None);
                //     item.command = {command:"sidebar_test_id1.openChild", //命令id
                //                     title:"标题",
                //                     arguments:[str] //命令接收的参数
                //                     };
                //     childs[index] = item;
                // }
                
            })
        } else { //根节点

            return new Promise( async (resolve, reject) => {
                const res = await getRootFolder();
              
                const root = res.map((item: {name: string, path: string}) => {
                    return new EntryItem(vscode.Uri.file(item.path), vscode.TreeItemCollapsibleState.Collapsed)
                });
                resolve(root);
                // resolve([new EntryItem("root",vscode.TreeItemCollapsibleState.Collapsed),
                // new EntryItem("root1",vscode.TreeItemCollapsibleState.Collapsed)])
            })
        }
    }
}


() => {

}