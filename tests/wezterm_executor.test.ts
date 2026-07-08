import { exec } from "child_process";
import { promisify } from "util";
import WeztermExecutor from "../src/wezterm_executor";

jest.mock("child_process");
jest.mock("../src/wezterm_check", () => ({
  assertWeztermInstalled: jest.fn().mockResolvedValue(null),
  notInstalledResult: jest.fn(),
}));
const mockedExec = jest.mocked(exec);

describe("WeztermExecutor", () => {
  let executor: WeztermExecutor;

  beforeEach(() => {
    executor = new WeztermExecutor();
    jest.clearAllMocks();
  });

  describe("writeToTerminal", () => {
    it("sends command to specified pane", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("--pane-id 1");
        expect(command).toContain("send-text");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await executor.writeToTerminal('echo "hello"', 1);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe('Command sent to pane 1: echo "hello"');
    });

    it("escapes single quotes in command", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("'\"'\"'");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      await executor.writeToTerminal("echo 'hello world'", 1);
    });

    it("returns error message on failure", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("WezTerm not running"), null);
        return {} as any;
      });

      const result = await executor.writeToTerminal('echo "hello"', 1);

      expect(result.content[0].text).toContain("Failed to write to terminal");
      expect(result.content[0].text).toContain("WezTerm not running");
    });
  });

  describe("listPanes", () => {
    const allPanes = JSON.stringify([
      { window_id: 1, tab_id: 1, pane_id: 1, workspace: "default", size: { rows: 24, cols: 80 }, title: "Terminal" },
      { window_id: 1, tab_id: 2, pane_id: 2, workspace: "default", size: { rows: 24, cols: 80 }, title: "Editor" },
      { window_id: 2, tab_id: 3, pane_id: 3, workspace: "default", size: { rows: 24, cols: 80 }, title: "Logs" },
    ]);

    it("lists all panes in a given window_id/tab_id without querying the focused client", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("wezterm cli list --format json");
        expect(command).not.toContain("list-clients");
        callback(null, { stdout: allPanes, stderr: "" });
        return {} as any;
      });

      const result = await executor.listPanes(1, 2);

      expect(mockedExec).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain("pane_id=2");
      expect(result.content[0].text).not.toContain("pane_id=1 ");
      expect(result.content[0].text).not.toContain("pane_id=3");
    });

    it("scopes by window_id only when tab_id is omitted", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: allPanes, stderr: "" });
        return {} as any;
      });

      const result = await executor.listPanes(1);

      expect(result.content[0].text).toContain("pane_id=1");
      expect(result.content[0].text).toContain("pane_id=2");
      expect(result.content[0].text).not.toContain("pane_id=3");
    });

    it("falls back to the active focused window/tab when no ids are given", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        if (command.includes("list-clients")) {
          callback(null, {
            stdout: JSON.stringify([{ focused_pane_id: 2 }]),
            stderr: "",
          });
        } else {
          expect(command).toContain("wezterm cli list --format json");
          callback(null, { stdout: allPanes, stderr: "" });
        }
        return {} as any;
      });

      const result = await executor.listPanes();

      expect(mockedExec).toHaveBeenCalledTimes(2);
      expect(result.content[0].text).toContain("pane_id=2");
      expect(result.content[0].text).not.toContain("pane_id=1 ");
      expect(result.content[0].text).not.toContain("pane_id=3");
    });

    it("returns all panes if no client is focused and no ids are given", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        if (command.includes("list-clients")) {
          callback(null, { stdout: "[]", stderr: "" });
        } else {
          callback(null, { stdout: allPanes, stderr: "" });
        }
        return {} as any;
      });

      const result = await executor.listPanes();

      expect(result.content[0].text).toContain("pane_id=1");
      expect(result.content[0].text).toContain("pane_id=2");
      expect(result.content[0].text).toContain("pane_id=3");
    });

    it("returns a friendly message when the scope matches no panes", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: allPanes, stderr: "" });
        return {} as any;
      });

      const result = await executor.listPanes(999);

      expect(result.content[0].text).toBe("(no panes found)");
    });

    it("ペイン一覧取得でエラーが発生した場合にエラーメッセージを返すこと", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("Connection failed"), null);
        return {} as any; // ChildProcessのモック
      });

      const result = await executor.listPanes();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Failed to list panes");
      expect(result.content[0].text).toContain("Connection failed");
    });
  });

  describe("closePane", () => {
    it("closes the specified pane", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("kill-pane --pane-id 7");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await executor.closePane(7);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Closed pane 7");
    });

    it("returns error message on failure", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("Pane not found"), null);
        return {} as any;
      });

      const result = await executor.closePane(999);

      expect(result.content[0].text).toContain("Failed to close pane 999");
      expect(result.content[0].text).toContain("Pane not found");
    });
  });

  describe("splitPane", () => {
    it("splits the pane in the specified direction", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("split-pane --pane-id 5 --right");
        callback(null, { stdout: "6\n", stderr: "" });
        return {} as any;
      });

      const result = await executor.splitPane(5, "Right");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Split pane 5 Right");
      expect(result.content[0].text).toContain("New pane id: 6");
    });

    it("maps direction to lowercase CLI flag", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("--bottom");
        callback(null, { stdout: "8\n", stderr: "" });
        return {} as any;
      });

      await executor.splitPane(3, "Bottom");
    });

    it("returns error message on failure", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("Split failed"), null);
        return {} as any;
      });

      const result = await executor.splitPane(1, "Left");

      expect(result.content[0].text).toContain("Failed to split pane");
      expect(result.content[0].text).toContain("Split failed");
    });

    it("resolves the focused pane when pane_id is omitted", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        if (command.includes("list-clients")) {
          callback(null, {
            stdout: JSON.stringify([{ focused_pane_id: 4 }]),
            stderr: "",
          });
        } else if (command.includes("split-pane")) {
          expect(command).toContain("--pane-id 4");
          callback(null, { stdout: "9\n", stderr: "" });
        }
        return {} as any;
      });

      const result = await executor.splitPane(undefined, "Right");

      expect(result.content[0].text).toContain("Split pane 4 Right");
    });

    it("resolves the focused pane within a given window_id/tab_id scope when pane_id is omitted", async () => {
      const panes = JSON.stringify([
        { window_id: 1, tab_id: 1, pane_id: 1 },
        { window_id: 2, tab_id: 2, pane_id: 2 },
      ]);

      mockedExec.mockImplementation((command: string, callback: any) => {
        if (command.includes("list-clients")) {
          // focused pane (1) is outside the requested scope (window_id 2)
          callback(null, {
            stdout: JSON.stringify([{ focused_pane_id: 1 }]),
            stderr: "",
          });
        } else if (command.includes("split-pane")) {
          expect(command).toContain("--pane-id 2");
          callback(null, { stdout: "10\n", stderr: "" });
        } else {
          callback(null, { stdout: panes, stderr: "" });
        }
        return {} as any;
      });

      const result = await executor.splitPane(undefined, "Bottom", 2, 2);

      expect(result.content[0].text).toContain("Split pane 2 Bottom");
    });

    it("returns a friendly error when no pane can be resolved", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        if (command.includes("list-clients")) {
          callback(null, { stdout: "[]", stderr: "" });
        } else {
          callback(null, { stdout: "[]", stderr: "" });
        }
        return {} as any;
      });

      const result = await executor.splitPane(undefined, "Right", 5, 5);

      expect(result.content[0].text).toContain("Failed to split pane");
      expect(result.content[0].text).toContain("could not resolve a target pane");
    });
  });

  describe("switchPane", () => {
    it("指定されたペインに切り替えできること", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("activate-pane --pane-id 42");
        callback(null, { stdout: "", stderr: "" });
        return {} as any; // ChildProcessのモック
      });

      const result = await executor.switchPane(42);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Switched to pane 42");
    });

    it("存在しないペインに切り替えようとした場合にエラーメッセージを返すこと", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("Pane does not exist"), null);
        return {} as any; // ChildProcessのモック
      });

      const result = await executor.switchPane(999);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Failed to switch pane");
      expect(result.content[0].text).toContain("Pane does not exist");
      expect(result.content[0].text).toContain("pane ID 999");
    });
  });
});
