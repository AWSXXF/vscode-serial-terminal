import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerContextCallback } from './contextManager';
import { registerSerialPortView } from './serialPortView';
import { registerLogView } from './logView';
import { registerScriptView } from './scriptView';
import { registerReadOnlyDocument } from './readOnlyDcoument';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerSerialPortView(context);
	registerLogView(context);
	registerScriptView(context);
	registerContextCallback(context);
	registerReadOnlyDocument(context);

	// vscode.workspace.onDidChangeConfiguration((event) => {
	// 	if (event.affectsConfiguration('files.autoSave')) {
	// 		console.log("my setting change");
	// 	}
	// });
}

export function deactivate() { }
