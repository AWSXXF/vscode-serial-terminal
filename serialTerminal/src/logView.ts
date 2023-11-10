import * as vscode from 'vscode';
import { getLogDirUri } from './settingManager';
import { FileTreeDataProvider } from './FileTreeDataProvider';


function registerLogView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            "serialport.logs",
            new FileTreeDataProvider(
                ['.txt', '.log'],
                getLogDirUri,
                {
                    command: "serialTerminal.openTreeItemResource",
                    readdirErrorMessagePrefix: vscode.l10n.t("Script path error: ")
                }
            )
        )
    );
}

export { registerLogView };