import { exec } from "child_process";
import WeztermOutputReader from "../src/wezterm_output_reader";

// child_processモジュールをモック化
jest.mock("child_process");
const mockedExec = jest.mocked(exec);

describe("WeztermOutputReader", () => {
  let outputReader: WeztermOutputReader;

  beforeEach(() => {
    outputReader = new WeztermOutputReader();
    jest.clearAllMocks();
  });

  describe("readOutput", () => {
    it("指定された行数の出力を正常に読み取れること", async () => {
      const mockOutput = "line1\nline2\nline3\n";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes --start-line -50");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(50);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("デフォルトで50行を読み取ること", async () => {
      const mockOutput = "default output";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("--start-line -50");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("0以下の行数が指定された場合は全ての内容を取得すること", async () => {
      const mockOutput = "full screen content";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(0);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("負の行数が指定された場合は全ての内容を取得すること", async () => {
      const mockOutput = "full screen content";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(-10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it('空の出力の場合は"(empty output)"を返すこと', async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("(empty output)");
    });

    it("エラーが発生した場合にエラーメッセージを返すこと", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("WezTerm connection failed"), null);
        return {} as any;
      });

      const result = await outputReader.readOutput(20);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain(
        "Failed to read terminal output"
      );
      expect(result.content[0].text).toContain("WezTerm connection failed");
      expect(result.content[0].text).toContain("wezterm cli list");
    });

    it("should read output from specific pane when pane_id is provided", async () => {
      const mockOutput = "pane specific output";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes --start-line -30 --pane-id 123");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(30, 123);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("should not include --pane-id option when pane_id is not provided", async () => {
      const mockOutput = "default pane output";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes --start-line -25");
        expect(command).not.toContain("--pane-id");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(25);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("should include --pane-id option and exclude --start-line when pane_id is provided with 0 or negative lines", async () => {
      const mockOutput = "full screen from specific pane";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes --pane-id 456");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(0, 456);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });
  });

  describe("readCurrentScreen", () => {
    it("現在の画面内容を正常に読み取れること", async () => {
      const mockScreenContent = "current screen content\nline 2\nline 3";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockScreenContent, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockScreenContent);
    });

    it('空の画面内容の場合は"(empty output)"を返すこと', async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("(empty output)");
    });

    it("エラーが発生した場合にエラーメッセージを返すこと", async () => {
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("Screen read failed"), null);
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Failed to read current screen");
      expect(result.content[0].text).toContain("Screen read failed");
    });

    it("should read current screen from specific pane when pane_id is provided", async () => {
      const mockScreenContent = "specific pane screen content";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes --pane-id 789");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockScreenContent, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen(789);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockScreenContent);
    });

    it("should not include --pane-id option in readCurrentScreen when pane_id is not provided", async () => {
      const mockScreenContent = "default pane screen content";
      mockedExec.mockImplementation((command: string, callback: any) => {
        expect(command).toContain("get-text --escapes");
        expect(command).not.toContain("--pane-id");
        expect(command).not.toContain("--start-line");
        callback(null, { stdout: mockScreenContent, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockScreenContent);
    });
  });
});
