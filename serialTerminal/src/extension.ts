import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerContextCallback } from './contextManager';
import { registerScriptNotebookSerializer } from './scriptNotebookSerializer';
import { registerSerialPortView } from './serialPortView';
import { registerLogView } from './logView';
import { registerScriptNotebookController } from './scriptNotebookController';
import { registerScriptView } from './scriptView';
import { registerReadOnlyDocument } from './readOnlyDcoument';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerSerialPortView(context);
	registerLogView(context);
	registerScriptView(context);
	registerScriptNotebookSerializer(context);
	registerScriptNotebookController(context);
	registerContextCallback(context);
	registerReadOnlyDocument(context);
}

export function deactivate() { }
