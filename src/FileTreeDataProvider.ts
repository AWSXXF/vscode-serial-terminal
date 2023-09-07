import * as vscode from 'vscode';
import * as fs from 'fs';

class FileTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem>{
    private filePatton: string;
    private uriGetter: (() => vscode.Uri);
    private options?: {
        readdirErrorMessagePrefix?: string,
        command?: string
    };
    private updateEmitter = new vscode.EventEmitter<void>();
    private _watcher;

    constructor(
        filePattons: string[],
        uriGetter: (() => vscode.Uri),
        options?: {
            readdirErrorMessagePrefix?: string,
            command?: string
        }) {
        this.filePatton = '(' + filePattons.join('|') + ')$';
        console.log({ filePatton: this.filePatton });
        this.uriGetter = uriGetter;
        this.options = options;
        this._watcher = fs.watch(this.uriGetter().fsPath, () => {
            this.updateEmitter.fire();
        });
    }

    onDidChangeTreeData?: vscode.Event<void | vscode.TreeItem | vscode.TreeItem[] | null | undefined> | undefined
        = this.updateEmitter.event;

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        return new Promise((resolve, reject) => {
            const dirUri = this.uriGetter();
            var files;
            try {
                files = fs.readdirSync(dirUri.fsPath);
            } catch (err) {
                vscode.window.showErrorMessage(this.options?.readdirErrorMessagePrefix + (err as Error).message);
            }

            if (files) {
                const treeItem = files.filter((file) => {
                    return fs.statSync(vscode.Uri.joinPath(dirUri, file).fsPath).isFile() && file.match(this.filePatton);
                }).map((file) => {
                    const item = new vscode.TreeItem(vscode.Uri.joinPath(dirUri, file));
                    if (this.options?.command) {
                        item.command = {
                            title: "View",
                            command: this.options.command,
                            arguments: [item]
                        };
                    }
                    return item;
                });
                resolve(treeItem);
            } else {
                reject();
            }
        });
    }
}

export { FileTreeDataProvider };