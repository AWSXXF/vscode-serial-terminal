import * as vscode from 'vscode';
import * as fs from 'fs';

import { pickConfiguration, pickSerialPort, updateSerialPortProvider } from './serialPortView';
import { serialPortTerminalManager } from "./serialPortTerminalManager";
import { setSerialPortTernimalRecordingLog } from './contextManager';
import { l10n } from 'vscode';
import { getLogDirUri, getScriptDirUri, logSettingId, scriptSettingId, serialPortSettingId } from './settingManager';

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
            () => { vscode.commands.executeCommand("workbench.action.openSettings", serialPortSettingId); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.openLogConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", logSettingId); })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialport.openScriptConfigaration",
            () => { vscode.commands.executeCommand("workbench.action.openSettings", scriptSettingId); })
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
            () => vscode.commands.executeCommand("revealFileInOS", getScriptDirUri())
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.revealLogs",
            () => vscode.commands.executeCommand("revealFileInOS", getLogDirUri())
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

    context.subscriptions.push(
        vscode.commands.registerCommand(
            "serialTerminal.clearTerminal",
            clearTerminal,
        )
    );

    vscode.commands.registerCommand("doSomething", async (context) => {
    });
}

async function openSerialPort(context?: any) {
    let portPath, cfg;
    if (!context) {
        portPath = await pickSerialPort();
    } else {
        portPath = context.label;
    }

    let existTerminal = serialPortTerminalManager.getFromPortPath(portPath);
    if (existTerminal?.serialport.isOpen) {
        existTerminal.terminal.show();
        return;
    }
    cfg = await pickConfiguration();

    if (portPath && cfg) {
        await serialPortTerminalManager.showSerialPortTerminal(portPath, cfg);
    }
}

async function startSaveLog() {
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
        return;
    }

    const serialPortTerminal = serialPortTerminalManager.getFromTerminal(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(await serialPortTerminal.startLogging());
}

function stopSaveLog() {
    const terminal = vscode.window.activeTerminal;

    if (!terminal) {
        return;
    }

    const serialPortTerminal = serialPortTerminalManager.getFromTerminal(terminal);
    if (!serialPortTerminal) {
        return;
    }

    setSerialPortTernimalRecordingLog(serialPortTerminal.stopLogging());
}

function openTreeItemResource(context: vscode.TreeItem) {
    vscode.commands.executeCommand("vscode.open", context.resourceUri);
}

function revealInExplorer(context: vscode.TreeItem) {
    vscode.commands.executeCommand("revealFileInOS", context.resourceUri);
}

async function createScriptNotebook() {
    const fileName = await vscode.window.showInputBox({
        title: l10n.t("Please enter the script notebook file name"),
        prompt: l10n.t("Only letters, numbers, `_` and `-` are allowed"),
        validateInput: (value: string) => {
            const result = value.match(/^[0-9a-zA-Z_-]*$/g)?.toString();
            return result ? undefined : l10n.t("Only letters, numbers, `_` and `-` are allowed");
        }
    });
    if (!fileName) {
        return false;
    }
    const scriptNotebookFile = vscode.Uri.joinPath(getScriptDirUri(), fileName + ".scrnb");
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

function clearTerminal() {
    vscode.commands.executeCommand(
        "workbench.action.terminal.clear"
    );
}

export { registerCommands };