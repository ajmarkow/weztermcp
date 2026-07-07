import { exec } from "child_process";
import { promisify } from "util";
import WeztermExecutor from "../src/wezterm_executor";

// child_processモジュールをモック化
jest.mock("child_process");
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
    it("ペイン一覧を正常に取得できること", async () => {
      const mockPaneList = `pane_id=1 active=true title="Terminal"
pane_id=2 active=false title="Editor"`;

      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("wezterm cli list");
        callback(null, { stdout: mockPaneList, stderr: "" });
        return {} as any; // ChildProcessのモック
      });

      const result = await executor.listPanes();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockPaneList);
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
