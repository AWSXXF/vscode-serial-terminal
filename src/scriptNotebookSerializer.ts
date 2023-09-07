import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';

interface ScriptNoteBookRaw {
    cells: ScriptNoteBookCell[],
}

interface ScriptNoteBookCell {
    type: 'code' | 'markdown',
    source: string[],
}

function registerScriptNotebookSerializer(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.registerNotebookSerializer(
            "scrnb",
            new (class implements vscode.NotebookSerializer {
                async deserializeNotebook(content: Uint8Array, token: vscode.CancellationToken): Promise<vscode.NotebookData> {
                    var contents = new TextDecoder().decode(content);
                    let raw: ScriptNoteBookCell[];
                    try {
                        let tmp = (<ScriptNoteBookRaw>JSON.parse(contents)).cells;
                        raw = tmp;
                    } catch (error) {
                        raw = [];
                    }
                    const cells = raw ? raw.map(item =>
                        new vscode.NotebookCellData(
                            item.type === 'code' ?
                                vscode.NotebookCellKind.Code :
                                vscode.NotebookCellKind.Markup,
                            item.source.join('\n'),
                            item.type === 'code' ? 'shellscript' : 'markdown'
                        )
                    ) : [];

                    return new vscode.NotebookData(cells);
                }

                async serializeNotebook(data: vscode.NotebookData, token: vscode.CancellationToken): Promise<Uint8Array> {
                    let contents: ScriptNoteBookRaw = { cells: [] };
                    for (const cell of data.cells) {
                        contents.cells.push({
                            type: cell.kind === vscode.NotebookCellKind.Code ? 'code' : 'markdown',
                            source: cell.value.split(/\r?\n/g)
                        });
                    }

                    return new TextEncoder().encode(JSON.stringify(contents));
                }
            })())
    );
}

export { registerScriptNotebookSerializer };