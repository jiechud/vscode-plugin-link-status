
import * as vscode from 'vscode';
import * as sidebar from './test';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	 //注册侧边栏面板的实现
	 const sidebar_test = new sidebar.EntryList();
	 console.log('sidebar_test=>', sidebar_test)
	 vscode.window.registerTreeDataProvider("sidebar_test_id1",sidebar_test);
	 
	 //注册命令 
	 vscode.commands.registerCommand("nodeDependencies.refreshEntry",args => {
		vscode.window.registerTreeDataProvider("sidebar_test_id1",sidebar_test);
		vscode.window.showInformationMessage('刷新成功');
	 });

}

// this method is called when your extension is deactivated
export function deactivate() {
	console.log('您的扩展已经被释放 ！')
}
