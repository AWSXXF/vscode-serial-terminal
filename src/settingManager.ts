import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';

export function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get('SerialTerminal.serial port.Boud Rate') as Array<number>;
}

async function getSettingFolder(section: string, dialogTitle: string): Promise<vscode.Uri | undefined> {
    let logPath = vscode.workspace.getConfiguration().get(section) as string;
    if (logPath === '' || !fs.existsSync(logPath)) {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            title: dialogTitle
        });
        if (folderUri && folderUri.length === 1) {
            vscode.workspace.getConfiguration().update(
                section,
                folderUri[0].fsPath,
                vscode.ConfigurationTarget.Global
            );
            logPath = folderUri[0].fsPath;
        } else {
            return;
        }
    }
    return vscode.Uri.file(logPath);
}

export function getLogUri(): vscode.Uri {
    return getSettingFolderDefault('SerialTerminal.log.savepath', 'terminalLog');
}

export function getScriptUri(): vscode.Uri {
    return getSettingFolderDefault('SerialTerminal.script.savepath', 'scriptNoteBook');
}

export function getSettingFolderDefault(section: string, defaultName: string): vscode.Uri {
    let folderPath = vscode.workspace.getConfiguration().get(section) as string;
    if (!fs.existsSync(folderPath)) {
        folderPath = vscode.Uri.joinPath(
            vscode.Uri.file(os.homedir()),
            "serialTerminal",
            defaultName
        ).fsPath;
        fs.mkdirSync(folderPath, { recursive: true });
        vscode.workspace.getConfiguration().update(
            section,
            folderPath,
            vscode.ConfigurationTarget.Global
        );
    }

    return vscode.Uri.file(folderPath);
}