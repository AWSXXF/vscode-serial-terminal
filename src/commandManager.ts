import * as vscode from 'vscode';

import { pickBoudRate, getSerialPort, pickSerialPort, updateSerialPortProvider } from './serialPortManager';
import { SerialPortTerminalManager } from './serialPortTerminalManager';
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
    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.viewLog",
            viewLog
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.revealInExplorer",
            revealInExplorer
        )
    );

    vscode.commands.registerCommand("doSomething", async () => {
    });
}

async function openSerialPort(context?: any) {
    let portPath, boudRate;
    var serialPortTerminals = SerialPortTerminalManager.getInstance();
    if (!context) {
        portPath = await pickSerialPort();
    } else {
        portPath = context.label;
    }

    let existTerminal = serialPortTerminals.getFromPortPath(portPath);
    if (existTerminal?.isOpen) {
        existTerminal.show();
        return;
    }
    boudRate = await pickBoudRate();

    if (portPath && boudRate) {
        serialPortTerminals.showSerialPortTerminal(portPath, boudRate, () => {
            updateSerialPortProvider();
        });
    }
}

async function startSaveLog() {
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
        return;
    }

    const serialPortTerminal = SerialPortTerminalManager.getInstance().getFromTerminal(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(await serialPortTerminal.startSaveLog(() => {
        updateLogProvider();
    }));
}

function stopSaveLog() {
    const terminal = vscode.window.activeTerminal;

    if (!terminal) {
        return;
    }

    const serialPortTerminal = SerialPortTerminalManager.getInstance().getFromTerminal(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(serialPortTerminal.stopSave() ? false : true);
}

function viewLog(context: vscode.TreeItem) {
    vscode.commands.executeCommand("vscode.open", context.resourceUri);
    vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession", context.resourceUri);
}

function revealInExplorer(context: vscode.TreeItem) {
    vscode.commands.executeCommand("revealFileInOS", context.resourceUri);
}