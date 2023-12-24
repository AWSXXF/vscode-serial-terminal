import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';

const serialPortSettingId = 'SerialTerminal.serial port';
const logSettingId = 'SerialTerminal.log';
const scriptSettingId = 'SerialTerminal.script';


const configurationsReg: { [Symbol.match](string: string): RegExpMatchArray | null; } = /^(\d+)(n|e|o|)(5|6|7|8|)(1|1.5|2|)$/;
const configurationsSettingId = 'SerialTerminal.serial port.configurations';
const logSavePathSettingId = 'SerialTerminal.log.savePath';
const scriptSavePathSettingId = 'SerialTerminal.script.savePath';
const logDefaultAddingTimeStampSettingId = 'SerialTerminal.log.defaultAddingTimeStamp';


function getConfigurations(): Array<string> {
    let configurationsStrings = vscode.workspace.getConfiguration().get(configurationsSettingId) as Array<string>;
    return configurationsStrings.filter(value => value.match(configurationsReg));
}

function getLogDirUri(): vscode.Uri {
    let folderUri = getSettingFolderOrSetDefault(logSavePathSettingId, vscode.Uri.joinPath(
        vscode.Uri.file(os.homedir()),
        "serialTerminal",
        'terminalLog'
    ).fsPath);
    return folderUri;
}

function getScriptDirUri(): vscode.Uri {
    return getSettingFolderOrSetDefault(scriptSavePathSettingId, vscode.Uri.joinPath(
        vscode.Uri.file(os.homedir()),
        "serialTerminal",
        'scriptNoteBook'
    ).fsPath);
}

function getLogDefaultAddingTimeStamp(): boolean {
    return getSettingOrSetDefault(logDefaultAddingTimeStampSettingId, false);
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
    serialPortSettingId,
    logSettingId,
    scriptSettingId,
    configurationsReg,
    configurationsSettingId,
    getConfigurations,
    getLogDirUri,
    getScriptDirUri,
    getLogDefaultAddingTimeStamp,
};