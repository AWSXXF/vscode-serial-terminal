import * as vscode from 'vscode';
import * as fs from 'fs';

import { pickBoudRate, getSerialPort, pickSerialPort, updateSerialPortProvider } from './serialPortView';
import { SerialPortTerminalManager } from './serialPortTerminalManager';
import { setSerialPortTernimalRecordingLog } from './contextManager';
import { updateLogProvider } from './logView';
import { updateScriptProvider } from './scriptView';
import { l10n } from 'vscode';
import { getScriptUri } from './settingManager';

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
            "serialport.refreshScriptView",
            updateScriptProvider
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
            "serialport.openScriptConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", "SerialTerminal.script"); })
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
            "serialTerminal.openTreeItemResource",
            openTreeItemResource
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

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.createScriptNotebook",
            createScriptNotebook
        )
    );

    vscode.commands.registerCommand("doSomething", async (context) => {
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
    openTreeItemResource(context);
    vscode.commands.executeCommand("workbench.action.files.setActiveEditorReadonlyInSession", context.resourceUri);
}

function openTreeItemResource(context: vscode.TreeItem) {
    vscode.commands.executeCommand("vscode.open", context.resourceUri);
}

function revealInExplorer(context: vscode.TreeItem) {
    vscode.commands.executeCommand("revealFileInOS", context.resourceUri);
}

async function createScriptNotebook() {
    const fileName = await vscode.window.showInputBox({
        title: "Please enter the script notebook file name",
        prompt: l10n.t("Only letters, numbers, `_` and `-` are allowed"),
        validateInput: (value: string) => {
            const result = value.match(/^[0-9a-zA-Z_-]*$/g)?.toString();
            return result ? undefined : l10n.t("Only letters, numbers, `_` and `-` are allowed");
        }
    });
    if (!fileName) {
        return false;
    }
    const scriptNotebookFile = vscode.Uri.joinPath(getScriptUri(), fileName + ".scrnb");
    fs.writeFileSync(scriptNotebookFile.fsPath, "");
    vscode.commands.executeCommand("vscode.open", scriptNotebookFile);
    updateScriptProvider();
}