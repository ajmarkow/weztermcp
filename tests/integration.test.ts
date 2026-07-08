import { execFile } from "child_process";

jest.mock("child_process");
jest.mock("../src/wezterm_check", () => ({
  assertWeztermInstalled: jest.fn().mockResolvedValue(null),
  notInstalledResult: jest.fn(),
}));
const mockedExecFile = jest.mocked(execFile);

import WeztermExecutor from "../src/wezterm_executor";
import WeztermOutputReader from "../src/wezterm_output_reader";
import SendControlCharacter from "../src/send_control_character";

describe("Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Overall workflow", () => {
    it("the flow of command execution -> output reading -> control character sending works", async () => {
      const executor = new WeztermExecutor();
      const outputReader = new WeztermOutputReader();
      const controlCharSender = new SendControlCharacter();

      // 1. Mock command execution (writeToTerminal calls execFile twice: list and send-text)
      let callCount = 0;
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callCount++;
        if (args.includes("list-clients")) {
          callback(null, { stdout: "[]", stderr: "" });
        } else if (args.includes("list")) {
          callback(null, {
            stdout: JSON.stringify([{ window_id: 1, tab_id: 1, pane_id: 1, title: "Terminal" }]),
            stderr: "",
          });
        } else if (args.includes("send-text")) {
          callback(null, { stdout: "", stderr: "" });
        } else if (args.includes("get-text")) {
          // For output reading
          callback(null, { stdout: "hello\n", stderr: "" });
        } else {
          // Other commands
          callback(null, { stdout: "", stderr: "" });
        }
        return {} as any;
      });

      const writeResult = await executor.writeToTerminal('echo "hello"', 1);
      expect(writeResult.content[0].text).toContain("Command sent to pane 1");

      // 2. Read output
      const readResult = await outputReader.readOutput(1, 10);
      expect(readResult.content[0].text).toBe("hello\n");

      // 3. Send control character
      const controlResult = await controlCharSender.send("c");
      expect(controlResult.content[0].text).toBe(
        "Sent control character: Ctrl+C"
      );
    }, 15000);

    it("error handling is consistent across each class", async () => {
      const executor = new WeztermExecutor();
      const outputReader = new WeztermOutputReader();

      // When an error occurs in every class
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(new Error("WezTerm not available"), null);
        return {} as any;
      });

      // WeztermExecutor error
      const writeResult = await executor.writeToTerminal("test", 1);
      expect(writeResult.content[0].text).toContain(
        "Failed to write to terminal"
      );
      expect(writeResult.content[0].text).toContain("WezTerm not available");

      // WeztermOutputReader error
      const readResult = await outputReader.readOutput(1, 10);
      expect(readResult.content[0].text).toContain(
        "Failed to read terminal output"
      );
      expect(readResult.content[0].text).toContain("WezTerm not available");

      // SendControlCharacter error
      const controlCharSender = new SendControlCharacter();
      await expect(controlCharSender.send("c")).rejects.toThrow(
        "Failed to send control character: WezTerm not available"
      );
    });

    it("operations across multiple panes work correctly", async () => {
      const executor = new WeztermExecutor();

      // Get pane list
      mockedExecFile.mockImplementationOnce((file: string, args: any, callback: any) => {
        const paneList = JSON.stringify([
          { window_id: 1, tab_id: 1, pane_id: 1, title: "Terminal" },
          { window_id: 1, tab_id: 1, pane_id: 2, title: "Editor" },
        ]);
        callback(null, { stdout: paneList, stderr: "" });
        return {} as any;
      });
      mockedExecFile.mockImplementationOnce((file: string, args: any, callback: any) => {
        // no window_id/tab_id given, so listPanes then queries list-clients
        callback(null, { stdout: "[]", stderr: "" });
        return {} as any;
      });

      const listResult = await executor.listPanes();
      expect(listResult.content[0].text).toContain("pane_id=1");
      expect(listResult.content[0].text).toContain("pane_id=2");

      // Switch pane
      mockedExecFile.mockImplementationOnce((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "activate-pane", "--pane-id", "2"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const switchResult = await executor.switchPane(2);
      expect(switchResult.content[0].text).toBe("Switched to pane 2");

      // write to a specific pane using wezterm_pane_write
      mockedExecFile.mockImplementationOnce((file: string, args: any, callback: any) => {
        expect(args).toContain("--pane-id");
        expect(args).toContain("2");
        expect(args).toContain("ls\n");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const writeResult = await executor.writeToTerminal("ls", 2);
      expect(writeResult.content[0].text).toBe("Command sent to pane 2: ls");
    });
  });

  describe("Performance tests", () => {
    it("a large number of command executions are handled properly", async () => {
      const executor = new WeztermExecutor();

      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        // Invoke callback immediately (no delay)
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const promises: Promise<{ content: any[] }>[] = [];
      for (let i = 0; i < 5; i++) {
        promises.push(executor.writeToTerminal(`echo "test ${i}"`, i));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach((result, index) => {
        expect(result.content[0].text).toContain(`echo "test ${index}"`);
      });
    }, 10000); // 10 second timeout
  });
});
