import * as vscode from "vscode";
import { l10n } from "vscode";
import { getSerialPortProvider } from "./serialPortManager";
import { getLogProvider } from "./logManager";

export var serialportView: vscode.TreeView<vscode.TreeItem>;

export function registerViews() {
    registerSerialPortView();
    registerLogView();
}

function registerSerialPortView() {
    vscode.window.registerTreeDataProvider("serialport.serialportView", getSerialPortProvider());
}

function registerLogView() {
    vscode.window.registerTreeDataProvider("serialport.logs", getLogProvider());
}
