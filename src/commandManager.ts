import * as vscode from 'vscode';
import { l10n } from 'vscode';
import { pickBoudRate, getSerialPort, openSerialPortTerminal, getSerialPortProvider, pickSerialPort } from './serialPortManager';

export function registerCommands() {
    vscode.commands.registerCommand("serialTerminal.openSerialPort", async (context) => {
        const portPath = context.label;
        const boudRate = await pickBoudRate();
        if (portPath && boudRate) {
            const port = getSerialPort(portPath, boudRate);
            if (port) {
                openSerialPortTerminal(port);
            }
        }
    });

    vscode.commands.registerCommand("serialTerminal.openSerialPortWithLog", (context) => {

    });

    vscode.commands.registerCommand("doSomething", (context) => {
        // vscode.window.showInformationMessage(l10n.t())
    });

    let disposable = vscode.commands.registerCommand('serialport.openSerialTerminal', async () => {
        // 获取用户选择的串口设备
        const portPath = await pickSerialPort();
        const boudRate = await pickBoudRate();

        if (portPath && boudRate) {
            const port = getSerialPort(portPath, boudRate);
            if (port) {
                openSerialPortTerminal(port);
            }
        }
    });

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.text = l10n.t("$(plug) Serial Terminal");
    statusBarItem.tooltip = l10n.t("Open a serial port on terminal");
    statusBarItem.command = "serialport.openSerialTerminal";
    statusBarItem.show();

    vscode.window.registerTreeDataProvider("serialport.serialportView", getSerialPortProvider());
}
