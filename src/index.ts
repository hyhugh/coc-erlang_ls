import {
  LanguageClient,
  WorkspaceConfiguration,
  workspace,
  ExtensionContext,
  LanguageClientOptions,
  StreamInfo,
  OutputChannel,
  services
} from 'coc.nvim'

import {waitForSocket} from 'socket-retry-connect';

import {execFile} from 'child_process'

let client: LanguageClient

const logger = workspace.createOutputChannel("coc-erlang")

function startServer(serverPath: string, serverPort: number) {
  return function () {
    execFile(serverPath, [serverPort.toString()]);

    logger.appendLine('waiting for erlang_ls to accept connection..');

    return new Promise<StreamInfo>((resolve, reject) => {
      waitForSocket({port: serverPort}, function (err, socket) {
        if (err) {
          reject(err);
        }
        else {
          logger.appendLine('socket accepted, continuing.');
          workspace.showMessage('socket accepted, continuing.');
          resolve({reader: socket, writer: socket});
        }
      });
    });
  };
};

export function activate(context: ExtensionContext): void {
  const config: WorkspaceConfiguration = workspace.getConfiguration("erlang_ls")
  const server_path: string = config.get<string>("erlang_ls_path")
  const server_port: number = Number(config.get<number>("port"))

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{scheme: 'file', language: 'erlang'}],
    initializationOptions: ""
  };

  client = new LanguageClient(
    "erlang_ls",
    startServer(server_path, server_port),
    clientOptions
  )

  context.subscriptions.push(client.start())
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
