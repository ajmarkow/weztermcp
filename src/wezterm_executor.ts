import { exec } from "child_process";
import { promisify } from "util";
import { assertWeztermInstalled, notInstalledResult } from "./wezterm_check.js";

const execAsync = promisify(exec);

interface WeztermPane {
  window_id: number;
  tab_id: number;
  pane_id: number;
  title: string;
}

export default class WeztermExecutor {
  private weztermCli: string;

  constructor() {
    this.weztermCli = "wezterm cli";
  }

  private async listAllPanes(): Promise<WeztermPane[]> {
    const { stdout } = await execAsync(`${this.weztermCli} list --format json`);
    return JSON.parse(stdout);
  }

  private async getFocusedPaneId(): Promise<number | undefined> {
    const { stdout } = await execAsync(`${this.weztermCli} list-clients --format json`);
    const clients = JSON.parse(stdout);
    return clients[0]?.focused_pane_id;
  }

  private async resolveTargetPaneId(
    windowId?: number,
    tabId?: number
  ): Promise<number | undefined> {
    const focusedPaneId = await this.getFocusedPaneId();
    if (windowId === undefined && tabId === undefined) {
      return focusedPaneId;
    }

    const panes = await this.listAllPanes();
    const focusedPane = panes.find((p) => p.pane_id === focusedPaneId);
    const inScope = (p: WeztermPane) =>
      (windowId === undefined || p.window_id === windowId) &&
      (tabId === undefined || p.tab_id === tabId);

    if (focusedPane && inScope(focusedPane)) {
      return focusedPaneId;
    }
    return panes.find(inScope)?.pane_id;
  }

  async writeToTerminal(
    command: string,
    paneId: number
  ): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
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

  async listPanes(windowId?: number, tabId?: number): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      const panes = await this.listAllPanes();

      let scopedWindowId = windowId;
      let scopedTabId = tabId;
      if (scopedWindowId === undefined && scopedTabId === undefined) {
        const focusedPaneId = await this.getFocusedPaneId();
        const focusedPane = panes.find((p) => p.pane_id === focusedPaneId);
        if (focusedPane) {
          scopedWindowId = focusedPane.window_id;
          scopedTabId = focusedPane.tab_id;
        }
      }

      const filtered = panes.filter(
        (p) =>
          (scopedWindowId === undefined || p.window_id === scopedWindowId) &&
          (scopedTabId === undefined || p.tab_id === scopedTabId)
      );

      const text = filtered.length
        ? filtered
            .map(
              (p) =>
                `pane_id=${p.pane_id} window_id=${p.window_id} tab_id=${p.tab_id} title="${p.title}"`
            )
            .join("\n")
        : "(no panes found)";

      return { content: [{ type: "text", text }] };
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
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
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
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
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
    paneId: number | undefined,
    direction: "Right" | "Left" | "Top" | "Bottom",
    windowId?: number,
    tabId?: number
  ): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    const dirFlag = `--${direction.toLowerCase()}`;
    try {
      const targetPaneId =
        paneId !== undefined ? paneId : await this.resolveTargetPaneId(windowId, tabId);

      if (targetPaneId === undefined) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to split pane: could not resolve a target pane. Specify pane_id explicitly, or ensure a WezTerm window/tab is focused.",
            },
          ],
        };
      }

      const { stdout } = await execAsync(
        `${this.weztermCli} split-pane --pane-id ${targetPaneId} ${dirFlag}`
      );
      return {
        content: [
          {
            type: "text",
            text: `Split pane ${targetPaneId} ${direction}. New pane id: ${stdout.trim()}`,
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
