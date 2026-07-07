import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default class WeztermExecutor {
  private weztermCli: string;

  constructor() {
    this.weztermCli = "wezterm cli";
  }

  async writeToTerminal(
    command: string,
    paneId: number
  ): Promise<{ content: any[] }> {
    try {
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

  async closePane(paneId: number): Promise<{ content: any[] }> {
    try {
      await execAsync(`${this.weztermCli} kill-pane --pane-id ${paneId}`);
      return {
        content: [{ type: "text", text: `Closed pane ${paneId}` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Failed to close pane ${paneId}: ${error.message}` }],
      };
    }
  }

  async splitPane(
    paneId: number,
    direction: "Right" | "Left" | "Top" | "Bottom"
  ): Promise<{ content: any[] }> {
    const dirFlag = `--${direction.toLowerCase()}`;
    try {
      const { stdout } = await execAsync(
        `${this.weztermCli} split-pane --pane-id ${paneId} ${dirFlag}`
      );
      return {
        content: [
          {
            type: "text",
            text: `Split pane ${paneId} ${direction}. New pane id: ${stdout.trim()}`,
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
