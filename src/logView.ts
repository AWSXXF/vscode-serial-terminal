import * as vscode from 'vscode';
import * as fs from 'fs';
import { getLogUri } from './settingManager';


export function registerLogView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("serialport.logs", logProvider)
    );
}

const logProvider = new (class implements vscode.TreeDataProvider<vscode.TreeItem> {

    private updateEmitter = new vscode.EventEmitter<void>();
    onDidChangeTreeData: vscode.Event<void | vscode.TreeItem | vscode.TreeItem[] | null | undefined> | undefined = this.updateEmitter.event;
    update() {
        this.updateEmitter.fire();
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        return new Promise((resolve, reject) => {
            const logDirUri = getLogUri();
            var logs;
            try {
                logs = fs.readdirSync(logDirUri.fsPath);
            } catch (err) {
                vscode.window.showErrorMessage(vscode.l10n.t("Log path error: {0}", (err as Error).message));
            }

            if (logs) {
                const treeItem = logs.filter((file) => {
                    return fs.statSync(vscode.Uri.joinPath(logDirUri, file).fsPath).isFile() && file.match('^.*\\.log$') || file.match('^.*\\.txt$');
                }).map((file) => {
                    const item = new vscode.TreeItem(vscode.Uri.joinPath(logDirUri, file));
                    item.command = {
                        title: "View",
                        command: "serialTerminal.viewLog",
                        arguments: [item]
                    };
                    return item;
                });
                resolve(treeItem);
            } else {
                reject();
            }
        });
    }
})();

export function updateLogProvider() {
    logProvider.update();
}
