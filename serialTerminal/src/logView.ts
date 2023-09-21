import * as vscode from 'vscode';
import * as fs from 'fs';
import { getLogUri } from './settingManager';
import { FileTreeDataProvider } from './FileTreeDataProvider';


function registerLogView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            "serialport.logs",
            new FileTreeDataProvider(
                ['.txt', '.log'],
                getLogUri,
                {
                    command: "serialTerminal.openTreeItemResource",
                    readdirErrorMessagePrefix: vscode.l10n.t("Script path error: ")
                }
            )
        )
    );
}

export { registerLogView };