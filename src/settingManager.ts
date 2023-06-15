import * as vscode from 'vscode';

export function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get('SerialTerminal.serial port.Boud Rate') as Array<number>;
}

