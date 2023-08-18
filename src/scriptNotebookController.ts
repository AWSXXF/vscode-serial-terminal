import * as vscode from 'vscode';

export function registerScriptNotebookController(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        new (class {
            private readonly id = 'script-notebook-controller';
            private readonly type = 'scrnb';
            private readonly label = 'Script Notebook';
            private readonly supportedLanguages = ['shellscript', 'raw', 'plaintext'];

            private readonly controller: vscode.NotebookController;

            constructor() {
                this.controller = vscode.notebooks.createNotebookController(
                    this.id,
                    this.type,
                    this.label
                );
                this.controller.supportedLanguages = this.supportedLanguages;
                this.controller.executeHandler = this.doExecuteAll.bind(this);
            }

            private async doExecuteAll(
                cells: vscode.NotebookCell[],
                notebook: vscode.NotebookDocument,
                controller: vscode.NotebookController
            ): Promise<void> {
                for (let cell of cells) {
                    this.doExecute(cell);
                }
            }

            private async doExecute(cell: vscode.NotebookCell): Promise<void> {
                let cmds = cell.document.getText().split(/\r?\n/g);
                cmds.forEach(value => {
                    vscode.window.activeTerminal?.sendText(value);
                });
            }

            dispose() {
                this.controller.dispose();
            }
        })()
    );
}