import * as vscode from 'vscode';

import { pickBoudRate, getSerialPort, pickSerialPort, updateSerialPortProvider } from './serialPortManager';
import { addSerialTerminal, getSerialPortTerminalFromPortName, getSerialPortTerminalFromTerminal } from './terminalManager';
import { setSerialPortTernimalRecordingLog } from './contextManager';
import { updateLogProvider } from './logManager';

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
            "serialport.refreshSerialPortView",
            updateSerialPortProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.refreshLogView",
            updateLogProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.openSerialPortConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.serial port"); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.openLogConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.log"); })
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

    vscode.commands.registerCommand("doSomething", async () => {
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
        let existTerminal = getSerialPortTerminalFromPortName(portPath);
        console.log({ existTerminal });
        if (existTerminal?.isRunning()) {
            existTerminal.show();
            return;
        }
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

    const serialPortTerminal = getSerialPortTerminalFromTerminal(terminal);
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

    const serialPortTerminal = getSerialPortTerminalFromTerminal(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(serialPortTerminal.stopSave());
}