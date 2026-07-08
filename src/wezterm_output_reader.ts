import { execAsync } from "./exec_async.js";
import { assertWeztermInstalled, notInstalledResult } from "./wezterm_check.js";

export default class WeztermOutputReader {
  private weztermCli: string;

  constructor() {
    this.weztermCli = "wezterm cli";
  }

  async readOutput(lines: number = 50, paneId?: number): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      let command: string;
      const paneOption = paneId !== undefined ? ` --pane-id ${paneId}` : '';

      if (lines <= 0) {
        command = `${this.weztermCli} get-text --escapes${paneOption}`;
      } else {
        const startLine = -lines;
        command = `${this.weztermCli} get-text --escapes --start-line ${startLine}${paneOption}`;
      }

      const { stdout } = await execAsync(command);

      return {
        content: [
          {
            type: "text",
            text: stdout || "(empty output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to read terminal output: ${error.message}\nMake sure WezTerm is running and the mux server is enabled.\nTry running: wezterm cli list`,
          },
        ],
      };
    }
  }

  async readCurrentScreen(paneId?: number): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      const paneOption = paneId !== undefined ? ` --pane-id ${paneId}` : '';
      const { stdout } = await execAsync(
        `${this.weztermCli} get-text --escapes${paneOption}`
      );

      return {
        content: [
          {
            type: "text",
            text: stdout || "(empty output)",
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to read current screen: ${error.message}`,
          },
        ],
      };
    }
  }
}
