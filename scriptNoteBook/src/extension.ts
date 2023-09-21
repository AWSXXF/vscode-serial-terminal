import * as vscode from 'vscode';
import { registerScriptNotebookSerializer } from './noteBookSerializer';
import { registerScriptNotebookController } from './noteBookController';

export function activate(context: vscode.ExtensionContext) {
    registerScriptNotebookSerializer(context);
    registerScriptNotebookController(context);
}

export function deactivate() { }
