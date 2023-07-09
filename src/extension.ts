import * as vscode from 'vscode';
import { registerCommands } from './commandManager';
import { registerViews } from './viewManager';
import { registerContextCallback } from './contextManager';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerViews();
	registerContextCallback();
}

export function deactivate() {
}
