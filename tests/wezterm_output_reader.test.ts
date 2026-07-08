import { execFile } from "child_process";
import WeztermOutputReader from "../src/wezterm_output_reader";

jest.mock("child_process");
jest.mock("../src/wezterm_check", () => ({
  assertWeztermInstalled: jest.fn().mockResolvedValue(null),
  notInstalledResult: jest.fn(),
}));
const mockedExecFile = jest.mocked(execFile);

describe("WeztermOutputReader", () => {
  let outputReader: WeztermOutputReader;

  beforeEach(() => {
    outputReader = new WeztermOutputReader();
    jest.clearAllMocks();
  });

  describe("readOutput", () => {
    it("reads the specified number of lines of output successfully", async () => {
      const mockOutput = "line1\nline2\nline3\n";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(file).toBe("wezterm");
        expect(args).toEqual(["cli", "get-text", "--escapes", "--start-line", "-50"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(50);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("reads 50 lines by default", async () => {
      const mockOutput = "default output";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--start-line", "-50"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("fetches all content when 0 or fewer lines are specified", async () => {
      const mockOutput = "full screen content";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(0);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("fetches all content when a negative number of lines is specified", async () => {
      const mockOutput = "full screen content";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(-10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it('returns "(empty output)" for empty output', async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("(empty output)");
    });

    it("returns an error message when an error occurs", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
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
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual([
          "cli",
          "get-text",
          "--escapes",
          "--start-line",
          "-30",
          "--pane-id",
          "123",
        ]);
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
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--start-line", "-25"]);
        expect(args).not.toContain("--pane-id");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(25);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("should include --pane-id option and exclude --start-line when pane_id is provided with 0 or negative lines", async () => {
      const mockOutput = "full screen from specific pane";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--pane-id", "456"]);
        expect(args).not.toContain("--start-line");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(0, 456);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });
  });

  describe("readCurrentScreen", () => {
    it("reads the current screen content successfully", async () => {
      const mockScreenContent = "current screen content\nline 2\nline 3";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes"]);
        callback(null, { stdout: mockScreenContent, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockScreenContent);
    });

    it('returns "(empty output)" for empty screen content', async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("(empty output)");
    });

    it("returns an error message when an error occurs", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
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
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--pane-id", "789"]);
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
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes"]);
        callback(null, { stdout: mockScreenContent, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readCurrentScreen();

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockScreenContent);
    });
  });
});
