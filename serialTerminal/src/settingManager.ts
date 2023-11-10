import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';

function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get('SerialTerminal.serial port.Boud Rate') as Array<number>;
}

function getLogDirUri(): vscode.Uri {
    let folderUri = getSettingFolderOrSetDefault('SerialTerminal.log.savePath', vscode.Uri.joinPath(
        vscode.Uri.file(os.homedir()),
        "serialTerminal",
        'terminalLog'
    ).fsPath);
    return folderUri;
}

function getScriptDirUri(): vscode.Uri {
    return getSettingFolderOrSetDefault('SerialTerminal.script.savePath', vscode.Uri.joinPath(
        vscode.Uri.file(os.homedir()),
        "serialTerminal",
        'scriptNoteBook'
    ).fsPath);
}

function getLogDefaultAddingTimeStamp(): boolean {
    return getSettingOrSetDefault('SerialTerminal.log.defaultAddingTimeStamp', false);
}

function getSettingFolderOrSetDefault(section: string, defaultName: string): vscode.Uri {
    let folderPath = getSettingOrSetDefault(section, defaultName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    return vscode.Uri.file(folderPath);
}

function getSettingOrSetDefault<T>(section: string, defaultValue: T): T {
    let value = vscode.workspace.getConfiguration().get<T>(section);
    if (undefined === value || value === '') {
        vscode.workspace.getConfiguration().update(
            section,
            defaultValue,
            vscode.ConfigurationTarget.Global
        );
        return defaultValue;
    }
    return value;
}

export {
    getBoundRates,
    getLogDirUri,
    getScriptDirUri,
    getLogDefaultAddingTimeStamp,
};