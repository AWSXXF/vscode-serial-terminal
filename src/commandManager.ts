import * as vscode from 'vscode';
import { pickBoudRate, getSerialPort, openSerialPortTerminal, pickSerialPort } from './serialPortManager';
import { refreshSerialPortView } from './viewManager';
import { getBoundRates } from './settingManager';

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

    vscode.commands.registerCommand("serialTerminal.openSerialPortWithLog", (context) => { });

    vscode.commands.registerCommand("serialport.refreshView", refreshSerialPortView);

    vscode.commands.registerCommand("serialport.openSerialPortConfigaration", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal");
    });

    vscode.commands.registerCommand("doSomething", async (context) => {
        // vscode.window.showInformationMessage(l10n.t())
        console.log(getBoundRates());
    });

    vscode.commands.registerCommand('serialport.openSerialTervalue:minal', async () => {
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
}
