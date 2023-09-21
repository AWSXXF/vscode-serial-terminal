import * as vscode from 'vscode';
import * as fs from 'fs';

import { pickBoudRate, pickSerialPort, updateSerialPortProvider } from './serialPortView';
import { SerialPortTerminalManager } from './serialPortTerminalManager';
import { setSerialPortTernimalRecordingLog } from './contextManager';
import { l10n } from 'vscode';
import { getLogUri, getScriptUri } from './settingManager';

function registerCommands(context: vscode.ExtensionContext) {
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

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.revealScriptNoteBooks",
            () => vscode.commands.executeCommand("revealFileInOS", getScriptUri())
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.revealLogs",
            () => vscode.commands.executeCommand("revealFileInOS", getLogUri())
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.deleteResource",
            deleteResource
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.viewReadOnlyDocument",
            viewReadOnlyDocument
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

    setSerialPortTernimalRecordingLog(await serialPortTerminal.startSaveLog());
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
}
async function deleteResource(context: vscode.TreeItem) {
    if (context.resourceUri) {
        await vscode.workspace.fs.delete(context.resourceUri);
    }
}

async function viewReadOnlyDocument(uri: vscode.Uri) {
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse('readonly:' + uri.path));
    await vscode.window.showTextDocument(doc, { preview: false });
}

export { registerCommands };