import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerContextCallback } from './contextManager';
import { registerScriptNotebookSerializer } from './scriptNotebookSerializer';
import { registerSerialPortView } from './serialPortView';
import { registerLogView } from './logView';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerSerialPortView(context);
	registerLogView(context);
	registerScriptNotebookSerializer(context);
	registerContextCallback();
}

export function deactivate() { }
