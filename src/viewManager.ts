import * as vscode from "vscode";
import { l10n } from "vscode";
import { getSerialPortProvider } from "./serialPortManager";

export var serialportView: vscode.TreeView<vscode.TreeItem>;

export function registerViews() {
    vscode.window.registerTreeDataProvider("serialport.serialportView", getSerialPortProvider());

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.text = l10n.t("$(plug) Serial Terminal");
    statusBarItem.tooltip = l10n.t("Open a serial port on terminal");
    statusBarItem.command = "serialport.openSerialTerminal";
    statusBarItem.show();
}

export function refreshSerialPortView() {
    vscode.window.registerTreeDataProvider("serialport.serialportView", getSerialPortProvider());
}