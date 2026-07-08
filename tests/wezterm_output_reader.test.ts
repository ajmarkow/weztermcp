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
        expect(args).toEqual([
          "cli",
          "get-text",
          "--escapes",
          "--pane-id",
          "1",
          "--start-line",
          "-50",
        ]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(1, 50);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("reads 50 lines by default", async () => {
      const mockOutput = "default output";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual([
          "cli",
          "get-text",
          "--escapes",
          "--pane-id",
          "1",
          "--start-line",
          "-50",
        ]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(1);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("fetches all content when 0 or fewer lines are specified", async () => {
      const mockOutput = "full screen content";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--pane-id", "1"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(1, 0);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("fetches all content when a negative number of lines is specified", async () => {
      const mockOutput = "full screen content";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--pane-id", "1"]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(1, -10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });

    it('returns "(empty output)" for empty output', async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(1, 10);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("(empty output)");
    });

    it("returns an error message when an error occurs", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(new Error("WezTerm connection failed"), null);
        return {} as any;
      });

      const result = await outputReader.readOutput(1, 20);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain(
        "Failed to read terminal output"
      );
      expect(result.content[0].text).toContain("WezTerm connection failed");
      expect(result.content[0].text).toContain("wezterm cli list");
    });

    it("reads output from the specified pane", async () => {
      const mockOutput = "pane specific output";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual([
          "cli",
          "get-text",
          "--escapes",
          "--pane-id",
          "123",
          "--start-line",
          "-30",
        ]);
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(123, 30);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(mockOutput);
    });

    it("includes --pane-id and excludes --start-line when 0 or negative lines are given", async () => {
      const mockOutput = "full screen from specific pane";
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "get-text", "--escapes", "--pane-id", "456"]);
        expect(args).not.toContain("--start-line");
        callback(null, { stdout: mockOutput, stderr: "" });
        return {} as any;
      });

      const result = await outputReader.readOutput(456, 0);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe(mockOutput);
    });
  });
});
