import * as vscode from "vscode";
import { l10n } from "vscode";
import { getSerialPortProvider } from "./serialPortManager";
import { getLogProvider } from "./logManager";

export var serialportView: vscode.TreeView<vscode.TreeItem>;

export function registerViews() {
    registerSerialPortView();
    registerLogView();

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.text = l10n.t("$(plug) Serial Terminal");
    statusBarItem.tooltip = l10n.t("Open a serial port on terminal");
    statusBarItem.command = "serialport.openSerialTerminal";
    statusBarItem.show();
}

function registerSerialPortView() {
    vscode.window.registerTreeDataProvider("serialport.serialportView", getSerialPortProvider());
}

function registerLogView() {
    vscode.window.registerTreeDataProvider("serialport.logs", getLogProvider());
}
