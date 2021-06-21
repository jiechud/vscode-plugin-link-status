import * as fs from 'fs';
import * as nPath from 'path';
//检测文件或者文件夹存在 nodeJS
export function fsExistsSync(path: string): boolean{
    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

export function getFolderByPath(path: string): Array<any> {
    const files = fs.readdirSync(path);
    let folderList: any = [];
    files.forEach(function (item, index) {
        const currPath = nPath.join(path, item);
        let stat = fs.lstatSync(currPath);
        if (stat.isDirectory() === true) { 
            folderList.push({
                path: currPath,
                name: item
            });
        }
    });

    return folderList;
}
