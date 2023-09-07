import * as vscode from 'vscode';
import * as fs from 'fs';
import { getScriptUri } from './settingManager';
import { FileTreeDataProvider } from './FileTreeDataProvider';

function registerScriptView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider(
            "serialport.scriptsNotebooks",
            new FileTreeDataProvider(
                ['.scrnb'],
                getScriptUri,
                {
                    command: "serialTerminal.openTreeItemResource",
                    readdirErrorMessagePrefix: vscode.l10n.t("Script path error: ")
                }
            )
        )
    );
}

export { registerScriptView };