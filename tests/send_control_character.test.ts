import { execFile } from "child_process";
import SendControlCharacter from "../src/send_control_character";

jest.mock("child_process");
jest.mock("../src/wezterm_check", () => ({
  assertWeztermInstalled: jest.fn().mockResolvedValue(null),
  notInstalledResult: jest.fn(),
}));
const mockedExecFile = jest.mocked(execFile);

describe("SendControlCharacter", () => {
  let controlCharSender: SendControlCharacter;

  beforeEach(() => {
    controlCharSender = new SendControlCharacter();
    jest.clearAllMocks();
  });

  describe("send", () => {
    it("sends Ctrl+C successfully", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(file).toBe("wezterm");
        expect(args).toEqual(["cli", "send-text", "\x03"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("c");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Sent control character: Ctrl+C");
    });

    it("adds the --pane-id flag when pane_id is specified", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "send-text", "--pane-id", "42", "\x03"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("c", 42);

      expect(result.content[0].text).toBe("Sent control character: Ctrl+C");
    });

    it("sends Ctrl+D successfully", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "send-text", "\x04"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("d");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Sent control character: Ctrl+D");
    });

    it("sends Ctrl+Z successfully", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "send-text", "\x1a"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("z");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Sent control character: Ctrl+Z");
    });

    it("sends Ctrl+L successfully", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "send-text", "\x0c"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("l");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Sent control character: Ctrl+L");
    });

    it("works correctly with uppercase characters", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        expect(args).toEqual(["cli", "send-text", "\x03"]);
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const result = await controlCharSender.send("C");

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("Sent control character: Ctrl+C");
    });

    it("throws an error for an unsupported control character", async () => {
      await expect(controlCharSender.send("x")).rejects.toThrow(
        "Unknown control character: x"
      );
    });

    it("throws an error for an empty string", async () => {
      await expect(controlCharSender.send("")).rejects.toThrow(
        "Unknown control character: "
      );
    });

    it("throws an error when the WezTerm command execution fails", async () => {
      mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
        callback(new Error("WezTerm not available"), null);
        return {} as any;
      });

      await expect(controlCharSender.send("c")).rejects.toThrow(
        "Failed to send control character: WezTerm not available"
      );
    });

    // Test all control character mappings
    const controlCharTests = [
      { char: "a", sequence: "\x01", name: "Ctrl+A" },
      { char: "e", sequence: "\x05", name: "Ctrl+E" },
      { char: "k", sequence: "\x0b", name: "Ctrl+K" },
      { char: "u", sequence: "\x15", name: "Ctrl+U" },
      { char: "w", sequence: "\x17", name: "Ctrl+W" },
    ];

    controlCharTests.forEach(({ char, sequence, name }) => {
      it(`sends ${name} successfully`, async () => {
        mockedExecFile.mockImplementation((file: string, args: any, callback: any) => {
          expect(args).toEqual(["cli", "send-text", sequence]);
          callback(null, { stdout: "", stderr: "" });
          return {} as any;
        });

        const result = await controlCharSender.send(char);

        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toBe(`Sent control character: ${name}`);
      });
    });
  });
});
