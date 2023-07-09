import * as vscode from 'vscode';
import * as fs from 'fs';
import { extensionContext } from './extension';

export function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get('SerialTerminal.serial port.Boud Rate') as Array<number>;
}

export function getLogUri(): vscode.Uri {
    const logPath = vscode.workspace.getConfiguration().get('SerialTerminal.log.savepath') as string;
    if (logPath === '') {
        return vscode.Uri.joinPath(extensionContext.extensionUri, "log");
    }

    if (!fs.existsSync(logPath)) {
        vscode.window.showErrorMessage("Log path `" + logPath + "` no found");
        vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.log.savepath");
        return vscode.Uri.joinPath(extensionContext.extensionUri, "log");
    }

    return vscode.Uri.file(logPath);
}