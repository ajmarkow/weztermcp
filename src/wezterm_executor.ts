import { execFileAsync } from "./exec_async.js";
import { assertWeztermInstalled, notInstalledResult } from "./wezterm_check.js";

interface WeztermPane {
  window_id: number;
  tab_id: number;
  pane_id: number;
  title: string;
}

export default class WeztermExecutor {
  private async listAllPanes(): Promise<WeztermPane[]> {
    const { stdout } = await execFileAsync("wezterm", ["cli", "list", "--format", "json"]);
    return JSON.parse(stdout);
  }

  private async getFocusedPaneId(): Promise<number | undefined> {
    const { stdout } = await execFileAsync("wezterm", [
      "cli",
      "list-clients",
      "--format",
      "json",
    ]);
    const clients = JSON.parse(stdout);
    return clients[0]?.focused_pane_id;
  }

  private async getFocusedPane(panes: WeztermPane[]): Promise<WeztermPane | undefined> {
    const focusedPaneId = await this.getFocusedPaneId();
    return panes.find((p) => p.pane_id === focusedPaneId);
  }

  private async resolveTargetPaneId(
    windowId?: number,
    tabId?: number
  ): Promise<number | undefined> {
    if (windowId === undefined && tabId === undefined) {
      return this.getFocusedPaneId();
    }

    const panes = await this.listAllPanes();
    const focusedPane = await this.getFocusedPane(panes);
    const inScope = (p: WeztermPane) =>
      (windowId === undefined || p.window_id === windowId) &&
      (tabId === undefined || p.tab_id === tabId);

    if (focusedPane && inScope(focusedPane)) {
      return focusedPane.pane_id;
    }
    return panes.find(inScope)?.pane_id;
  }

  private async performSplit(
    paneId: number | undefined,
    direction: "Right" | "Left" | "Top" | "Bottom",
    windowId?: number,
    tabId?: number
  ): Promise<{ targetPaneId: number; newPaneId: number }> {
    const targetPaneId =
      paneId !== undefined ? paneId : await this.resolveTargetPaneId(windowId, tabId);

    if (targetPaneId === undefined) {
      throw new Error(
        "could not resolve a target pane. Specify pane_id explicitly, or ensure a WezTerm window/tab is focused."
      );
    }

    const dirFlag = `--${direction.toLowerCase()}`;
    const { stdout } = await execFileAsync("wezterm", [
      "cli",
      "split-pane",
      "--pane-id",
      String(targetPaneId),
      dirFlag,
    ]);
    return { targetPaneId, newPaneId: Number(stdout.trim()) };
  }

  async writeToTerminal(
    command: string,
    paneId: number
  ): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      await execFileAsync("wezterm", [
        "cli",
        "send-text",
        "--pane-id",
        String(paneId),
        "--no-paste",
        `${command}\n`,
      ]);
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
        const focusedPane = await this.getFocusedPane(panes);
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
      await execFileAsync("wezterm", ["cli", "activate-pane", "--pane-id", String(paneId)]);
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
      await execFileAsync("wezterm", ["cli", "kill-pane", "--pane-id", String(paneId)]);
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
    try {
      const { targetPaneId, newPaneId } = await this.performSplit(
        paneId,
        direction,
        windowId,
        tabId
      );
      return {
        content: [
          {
            type: "text",
            text: `Split pane ${targetPaneId} ${direction}. New pane id: ${newPaneId}`,
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

  async splitAndWrite(
    command: string,
    direction: "Right" | "Left" | "Top" | "Bottom",
    paneId?: number,
    windowId?: number,
    tabId?: number
  ): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      const { targetPaneId, newPaneId } = await this.performSplit(
        paneId,
        direction,
        windowId,
        tabId
      );
      const writeResult = await this.writeToTerminal(command, newPaneId);
      return {
        content: [
          {
            type: "text",
            text: `Split pane ${targetPaneId} ${direction}, creating pane ${newPaneId}.`,
          },
          ...writeResult.content,
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to split and write: ${error.message}`,
          },
        ],
      };
    }
  }

  async spawnWindow(cwd?: string): Promise<{ content: any[] }> {
    const err = await assertWeztermInstalled();
    if (err) return notInstalledResult();
    try {
      const args = ["cli", "spawn", "--new-window"];
      if (cwd) args.push("--cwd", cwd);
      const { stdout } = await execFileAsync("wezterm", args);
      return {
        content: [
          {
            type: "text",
            text: `Spawned new window. New pane id: ${stdout.trim()}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to spawn window: ${error.message}`,
          },
        ],
      };
    }
  }
}
