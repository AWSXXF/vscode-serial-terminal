import * as vscode from 'vscode';
import * as fs from 'fs';
import { pickBoudRate, getSerialPort, pickSerialPort } from './serialPortManager';
import { refreshSerialPortView } from './viewManager';
import { addSerialTerminal, getSerialPortTerminalFrom } from './terminalManager';
import { setSerialPortTernimalRecordingLog } from './contextManager';

export function registerCommands(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.openSerialPort",
            openSerialPort
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'serialport.openSerialTerminal',
            openSerialPort
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.refreshView",
            refreshSerialPortView
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.openSerialPortConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal"); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.startSaveLog",
            startSaveLog
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.stopSaveLog",
            stopSaveLog
        )
    );

    vscode.commands.registerCommand("doSomething", async (context) => {
        const saveLogFile = await vscode.window.showSaveDialog({
            title: "chose a file to save log",
            filters: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Log": ["log"]
            }
        });
        if (saveLogFile) {
            fs.writeFileSync(saveLogFile.fsPath, "");
            fs.appendFileSync(saveLogFile.fsPath, "hello");
        }
    });
}

async function openSerialPort(context?: any) {
    let portPath, boudRate;
    if (!context) {
        portPath = await pickSerialPort();
    } else {
        portPath = context.label;
    }
    if (portPath) {
        boudRate = await pickBoudRate();
    }

    if (portPath && boudRate) {
        const port = getSerialPort(portPath, boudRate);
        if (port) {
            addSerialTerminal(port);
        }
    }
}

async function startSaveLog() {
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
        return;
    }

    const serialPortTerminal = getSerialPortTerminalFrom(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(await serialPortTerminal.startSave());
}

function stopSaveLog() {
    const terminal = vscode.window.activeTerminal;

    if (!terminal) {
        return;
    }

    const serialPortTerminal = getSerialPortTerminalFrom(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(serialPortTerminal.stopSave());
}