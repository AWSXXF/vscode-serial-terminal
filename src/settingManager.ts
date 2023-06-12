import * as vscode from 'vscode';

export function getBoundRates(): Array<number> {
    return vscode.workspace.getConfiguration().get("SerialTerminal.BoudRate") as Array<number>;
}

