import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { registerContextCallback } from './contextManager';
import { registerSerialPortView } from './serialPortView';
import { registerLogView } from './logView';
import { registerScriptView } from './scriptView';
import { registerReadOnlyDocument } from './readOnlyDcoument';
import { registerSerialPortTerminalProfile } from './SerialTerminalProfileProvider';

export var extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext) {
	extensionContext = context;
	registerCommands(context);
	registerSerialPortView(context);
	registerLogView(context);
	registerScriptView(context);
	registerContextCallback(context);
	registerReadOnlyDocument(context);
	registerSerialPortTerminalProfile(context);
}

export function deactivate() { }
