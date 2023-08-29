import * as vscode from 'vscode';
import * as fs from 'fs';

import { pickBoudRate, getSerialPort, pickSerialPort, updateSerialPortProvider } from './serialPortView';
import { SerialPortTerminalManager } from './serialPortTerminalManager';
import { setSerialPortTernimalRecordingLog } from './contextManager';
import { updateLogProvider } from './logView';
import { updateScriptProvider } from './scriptView';
import { l10n } from 'vscode';
import { getScriptUri } from './settingManager';
import { extensionContext } from './extension';
import * as os from 'os';

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

        const logPath: string = vscode.workspace.getConfiguration().get('SerialTerminal.log.savepath') as string;
        // console.log({ logPath });
        if (logPath === '' || !fs.existsSync(logPath)) {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                title: "选择一个保存log的文件夹"
            });

            if (folderUri && folderUri.length === 1) {
                vscode.workspace.getConfiguration().update(
                    'SerialTerminal.log.savepath',
                    folderUri[0].fsPath,
                    vscode.ConfigurationTarget.Global
                );
            }
        }

        const pickUri = await vscode.window.showQuickPick([
            {
                label: vscode.Uri.parse(os.homedir() + "/log").fsPath,
                description: "description",
                detail: "detail",
                picked: true,
                alwaysShow: true,
                buttons: [
                    {
                        iconPath: vscode.Uri.parse("C:\\MYFILE\\project\\vscode\\playground\\serialTerminal\\assets\\logo.svg"),
                        tooltip: "tooltip"
                    },
                    {
                        iconPath: vscode.Uri.parse("C:\\MYFILE\\project\\vscode\\playground\\serialTerminal\\assets\\logo.svg"),
                        tooltip: "tooltip"
                    }
                ]
            },
            {
                label: vscode.Uri.parse(os.homedir() + "/log").fsPath,

            },
            {
                label: vscode.Uri.parse(os.homedir() + "/log").fsPath,

            },

        ]);


        // vscode.workspace.getConfiguration().update(
        //     'SerialTerminal.log.savepath',
        //     '',
        //     vscode.ConfigurationTarget.Global
        // );

        // let uri = await vscode.window.showOpenDialog({
        //     // canSelectFiles: false, // 禁止选择文件
        //     canSelectFolders: true, // 允许选择文件夹
        //     // canSelectMany: false, // 只能选择一个文件夹
        //     // openLabel: 'Select Folder'
        //     title: 'select a folder to save log'
        // });

        // console.log({ uri });
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
    console.log(context.resourceUri);
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
