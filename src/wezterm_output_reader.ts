import { execFileAsync } from "./exec_async.js";
import { assertWeztermInstalled, notInstalledResult } from "./wezterm_check.js";

export default class WeztermOutputReader {
  async readOutput(lines: number = 50, paneId?: number): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      const args = ["cli", "get-text", "--escapes"];
      if (lines > 0) {
        args.push("--start-line", String(-lines));
      }
      if (paneId !== undefined) {
        args.push("--pane-id", String(paneId));
      }

      const { stdout } = await execFileAsync("wezterm", args);

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
}
