import * as vscode from 'vscode';
import { SerialPort } from 'serialport';
import { registerCommands } from './commandManager';
import { registerViews } from './viewManager';

export function activate(context: vscode.ExtensionContext) {
	registerCommands();
	registerViews();
}

export function deactivate() { }
