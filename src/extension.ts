import * as vscode from 'vscode';
import { registerCommands } from './commandManager';
import { registerViews } from './viewManager';
import { registerContextCallback } from './contextManager';

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
	registerViews();
	registerContextCallback();
}

export function deactivate() { }
