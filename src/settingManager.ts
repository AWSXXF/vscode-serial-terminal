import * as vscode from 'vscode';
import * as fs from 'fs';
import { extensionContext } from './extension';

export function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get('SerialTerminal.serial port.Boud Rate') as Array<number>;
}

export function getLogUri(): vscode.Uri {
    const defaultUri = vscode.Uri.joinPath(extensionContext.extensionUri, "userData/log");
    if (!fs.existsSync(defaultUri.fsPath)) {
        fs.mkdirSync(defaultUri.fsPath, { recursive: true });
    }

    const logPath = vscode.workspace.getConfiguration().get('SerialTerminal.log.savepath') as string;
    if (logPath === '') {
        return defaultUri;
    }

    if (!fs.existsSync(logPath)) {
        vscode.window.showErrorMessage("Log path `" + logPath + "` no found");
        vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.log.savepath");
        return defaultUri;
    }

    return vscode.Uri.file(logPath);
}

export function getScriptUri(): vscode.Uri {
    const defaultUri = vscode.Uri.joinPath(extensionContext.extensionUri, "userData/scriptNoteBook");
    if (!fs.existsSync(defaultUri.fsPath)) {
        fs.mkdirSync(defaultUri.fsPath, { recursive: true });
    }

    const scriptPath = vscode.workspace.getConfiguration().get('SerialTerminal.script.savepath') as string;
    if (scriptPath === '') {
        return defaultUri;
    }

    if (!fs.existsSync(scriptPath)) {
        vscode.window.showErrorMessage("script path `" + scriptPath + "` no found");
        vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.script.savepath");
        return defaultUri;
    }

    return vscode.Uri.file(scriptPath);
}