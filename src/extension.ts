import * as vscode from 'vscode';
import { registerCommands } from './commandManager';
import { registerViews } from './viewManager';
import { registerContextCallback } from './contextManager';
import { registerScriptNotebookSerializer } from './scriptNotebookSerializer';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerViews();
	registerContextCallback();
	registerScriptNotebookSerializer(context);
}

export function deactivate() { }
