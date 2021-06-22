
import * as vscode from 'vscode';
import * as sidebar from './sidebar';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	//注册侧边栏面板的实现
	const sidebar_test = new sidebar.EntryList();
	vscode.window.registerTreeDataProvider("sidebar_test_id1", sidebar_test);

	//注册命令 
	/**
	 * 刷新操作
	 */
	vscode.commands.registerCommand("nodeDependencies.refreshEntry", args => {
		vscode.window.registerTreeDataProvider("sidebar_test_id1", sidebar_test);
		vscode.window.showInformationMessage('刷新成功');
	});

	async function unlinkAll(rootPath?: string) {
		try {
			if (rootPath) {
				await sidebar.unlinkAllByPath(rootPath);
			} else {
				await sidebar.unlinkAll();
			}
			await vscode.window.registerTreeDataProvider("sidebar_test_id1", sidebar_test);
			vscode.window.showInformationMessage('Link取消成功');
		} catch (error) {
			vscode.window.showInformationMessage('Link取消失败');
		}

	}


	/**
	 * 取消所有link
	 */
	vscode.commands.registerCommand("nodeDependencies.unlinkAllEntry", async (args) => {
		unlinkAll();
	});

	/**
	 * 取消所有link
	 */
	vscode.commands.registerCommand("nodeDependencies.unlinkEntry", async (args) => {
		unlinkAll(args?.resourceUri?.path);
	});


	/**
	 * 取消所有link
	 */
	vscode.commands.registerCommand("nodeDependencies.unlinkSingleEntry", async (args) => {
		try {
			await sidebar.unLink(args?._data?.name, args?._data?.path);
			await vscode.window.registerTreeDataProvider("sidebar_test_id1", sidebar_test);
			vscode.window.showInformationMessage('Link成功!');
		} catch (error) {
			vscode.window.showInformationMessage('Link失败!');
		}
	});


	/**
	 * link
	 */
	vscode.commands.registerCommand("nodeDependencies.linkEntry", async (args) => {
		try {
			await sidebar.link(args?._data?.name, args?._data?.path);
			await vscode.window.registerTreeDataProvider("sidebar_test_id1", sidebar_test);
			vscode.window.showInformationMessage('Link成功!');
		} catch (error) {
			vscode.window.showInformationMessage('Link失败!');
		}

	});

}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log('您的扩展已经被释放 ！');
}
