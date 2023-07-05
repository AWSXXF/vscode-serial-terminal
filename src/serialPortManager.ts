import * as vscode from "vscode";
import * as colors from 'colors';
import { getBoundRates } from "./settingManager";
import { SerialPort } from "serialport";
import { Event, ProviderResult, TreeDataProvider, TreeItem, l10n } from "vscode";

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

const ports = new Map<string, SerialPort>();

const serialPortProvider = new (class implements TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined;
    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
        return new Promise((resolve, reject) => {
            // 使用 serialport 模块获取可用的串口设备
            SerialPort.list()
                .then((ports) => {
                    let treeItem = ports.map((port) => {
                        return {
                            label: port.path,
                            description: port.manufacturer,
                            tooltip: `PID: ${port.productId} VID: ${port.vendorId}`,
                            iconPath: '${plug}'
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

export function getSerialPortProvider(): TreeDataProvider<TreeItem> {
    return serialPortProvider;
}

export async function pickSerialPort(): Promise<string | undefined> {
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

export async function pickBoudRate(): Promise<number | undefined> {
    let boudRate = await vscode.window.showQuickPick(boudRates(), { placeHolder: l10n.t("please select a boud rate") });
    return boudRate ? parseInt(boudRate.label) : undefined;
}

function boudRates(): Thenable<vscode.QuickPickItem[]> {
    return new Promise((resolve, reject) => {
        const boundRateItems: vscode.QuickPickItem[] = getBoundRates().map((value) => { return { label: value.toString() }; });
        resolve(boundRateItems);
    });
}

export function getSerialPort(path: string, boudRate: number): SerialPort | undefined {
    var getPortSuccess = true;
    const port = new SerialPort({ path: path, baudRate: boudRate }, (err) => {
        if (err) {
            getPortSuccess = false;
            vscode.window.showErrorMessage(err.message);
        }
    });
    return getPortSuccess ? port : undefined;
}