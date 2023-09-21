import * as vscode from "vscode";
import * as colors from 'colors';
import { getBoundRates } from "./settingManager";
import { SerialPort } from "serialport";
import { Event, ProviderResult, TreeDataProvider, TreeItem, l10n } from "vscode";

function registerSerialPortView(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider("serialport.serialportView", serialPortProvider)
    );
}

const serialPortProvider = new (class implements TreeDataProvider<TreeItem> {
    updateEmitter = new vscode.EventEmitter<void>();
    onDidChangeTreeData: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined = this.updateEmitter.event;
    update() {
        this.updateEmitter.fire();
    }

    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
        return new Promise((resolve, reject) => {
            // 使用 serialport 模块获取可用的串口设备
            SerialPort.list()
                .then((ports) => {
                    const treeItem = ports.map((port) => {
                        return {
                            label: port.path,
                            description: port.manufacturer,
                            tooltip: `PID: ${port.productId} VID: ${port.vendorId}`,
                            // iconPath: vscode.Uri.joinPath(extensionContext.extensionUri, 'assets/icon/plug.svg')
                        };
                    });
                    resolve(treeItem);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
})();

function updateSerialPortProvider() {
    serialPortProvider.update();
}

async function pickSerialPort(): Promise<string | undefined> {
    const serialPortItems: Thenable<vscode.QuickPickItem[]> = new Promise((resolve, reject) => {
        SerialPort.list().then((ports) => {
            const portItems: vscode.QuickPickItem[] = ports.map((port) => {
                return { label: port.path, description: port.manufacturer };
            });
            resolve(portItems);
        }).catch((error) => {
            reject(error);
        });
    });

    let port = await vscode.window.showQuickPick(serialPortItems, { placeHolder: l10n.t("please select a serial port") });
    return port ? port.label : undefined;
}

async function pickBoudRate(): Promise<number | undefined> {
    let boudRate = await vscode.window.showQuickPick(boudRates(), { placeHolder: l10n.t("please select a boud rate") });
    return boudRate ? parseInt(boudRate.label) : undefined;
}

function boudRates(): Thenable<vscode.QuickPickItem[]> {
    return new Promise((resolve, reject) => {
        const boundRateItems: vscode.QuickPickItem[] = getBoundRates().map((value) => { return { label: value.toString() }; });
        resolve(boundRateItems);
    });
}

function getSerialPort(path: string, boudRate: number): SerialPort | undefined {
    var getPortSuccess = true;
    const port = new SerialPort({ path: path, baudRate: boudRate }, (err) => {
        if (err) {
            getPortSuccess = false;
            vscode.window.showErrorMessage(err.message);
        }
    });
    return getPortSuccess ? port : undefined;
}

export {
    registerSerialPortView,
    updateSerialPortProvider,
    pickSerialPort,
    pickBoudRate,
    // getSerialPort
};