import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default class WeztermExecutor {
  private weztermCli: string;

  constructor() {
    this.weztermCli = "wezterm cli";
  }

  async writeToTerminal(command: string): Promise<{ content: any[] }> {
    try {
      // 現在のアクティブペインを確認
      const { stdout: paneInfo } = await execAsync(`${this.weztermCli} list`);

      // WezTerm CLIを使用してアクティブなペインにテキストを送信
      // コマンドと改行を一緒に送信して確実に実行
      const escapedCommand = command.replace(/'/g, "'\"'\"'");
      await execAsync(
        `${this.weztermCli} send-text --no-paste '${escapedCommand}\n'`
      );

      return {
        content: [
          {
            type: "text",
            text: `Command sent to WezTerm: ${command}\n\nCurrent panes:\n${paneInfo}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to write to terminal: ${error.message}\nMake sure WezTerm is running and the mux server is enabled.`,
          },
        ],
      };
    }
  }

  async writeToSpecificPane(
    command: string,
    paneId: number
  ): Promise<{ content: any[] }> {
    try {
      // 指定されたペインにコマンドを送信
      const escapedCommand = command.replace(/'/g, "'\"'\"'");
      await execAsync(
        `${this.weztermCli} send-text --pane-id ${paneId} --no-paste '${escapedCommand}\n'`
      );

      return {
        content: [
          {
            type: "text",
            text: `Command sent to pane ${paneId}: ${command}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to write to pane ${paneId}: ${error.message}`,
          },
        ],
      };
    }
  }

  async listPanes(): Promise<{ content: any[] }> {
    try {
      // 正しいコマンドは 'list' です
      const { stdout } = await execAsync(`${this.weztermCli} list`);
      return {
        content: [
          {
            type: "text",
            text: stdout,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to list panes: ${error.message}\nMake sure WezTerm is running and the mux server is enabled.`,
          },
        ],
      };
    }
  }

  async switchPane(paneId: number): Promise<{ content: any[] }> {
    try {
      await execAsync(`${this.weztermCli} activate-pane --pane-id ${paneId}`);
      return {
        content: [
          {
            type: "text",
            text: `Switched to pane ${paneId}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to switch pane: ${error.message}\nMake sure the pane ID ${paneId} exists.`,
          },
        ],
      };
    }
  }

  async splitPane(
    windowId: number,
    tabId: number,
    direction: "Right" | "Left" | "Top" | "Bottom"
  ): Promise<{ content: any[] }> {
    const dirFlag = `--${direction.toLowerCase()}`;
    try {
      const { stdout: listJson } = await execAsync(
        `${this.weztermCli} list --format json`
      );
      const panes: { window_id: number; tab_id: number; pane_id: number }[] =
        JSON.parse(listJson);
      const target = panes.find(
        (p) => p.window_id === windowId && p.tab_id === tabId
      );
      if (!target) {
        return {
          content: [
            {
              type: "text",
              text: `No pane found for window ${windowId}, tab ${tabId}.`,
            },
          ],
        };
      }
      const { stdout } = await execAsync(
        `${this.weztermCli} split-pane --pane-id ${target.pane_id} ${dirFlag}`
      );
      return {
        content: [
          {
            type: "text",
            text: `Split pane ${target.pane_id} ${direction}. New pane id: ${stdout.trim()}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to split pane: ${error.message}`,
          },
        ],
      };
    }
  }
}
