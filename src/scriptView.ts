import * as vscode from 'vscode';
import * as fs from 'fs';
import { getScriptUri } from './settingManager';

export function registerScriptView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("serialport.scriptsNotebooks", scriptProvider)
    );
}

export function updateScriptProvider() {
    scriptProvider.update();
}

const scriptProvider = new (class implements vscode.TreeDataProvider<vscode.TreeItem> {
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
            const scriptDirUri = getScriptUri();
            var scripts;
            try {
                scripts = fs.readdirSync(scriptDirUri.fsPath);
            } catch (err) {
                vscode.window.showErrorMessage(vscode.l10n.t("Script path error: {0}", (err as Error).message));
            }

            console.log({ scripts });

            if (scripts) {
                const treeItem = scripts.filter((file) => {
                    return fs.statSync(vscode.Uri.joinPath(scriptDirUri, file).fsPath).isFile() && file.match('^.*\\.scrnb$');
                }).map((file) => {
                    return {
                        resourceUri: vscode.Uri.joinPath(scriptDirUri, file)
                    };
                });
                resolve(treeItem);
            } else {
                reject();
            }
        });
    }

})();