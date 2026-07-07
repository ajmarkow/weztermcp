import { exec } from "child_process";
import { assertWeztermInstalled, notInstalledResult, NOT_INSTALLED_MSG } from "../src/wezterm_check";

jest.mock("child_process");
const mockedExec = jest.mocked(exec);

describe("assertWeztermInstalled", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns null when wezterm --version succeeds", async () => {
    mockedExec.mockImplementation((command: string, callback: any) => {
      callback(null, { stdout: "WezTerm 20240203-110809-5046fc22", stderr: "" });
      return {} as any;
    });

    const result = await assertWeztermInstalled();
    expect(result).toBeNull();
  });

  it("returns error message when wezterm is not found", async () => {
    mockedExec.mockImplementation((command: string, callback: any) => {
      callback(new Error("command not found: wezterm"), null);
      return {} as any;
    });

    const result = await assertWeztermInstalled();
    expect(result).toBe(NOT_INSTALLED_MSG);
  });

  it("returns error message when version output is empty", async () => {
    mockedExec.mockImplementation((command: string, callback: any) => {
      callback(null, { stdout: "", stderr: "" });
      return {} as any;
    });

    const result = await assertWeztermInstalled();
    expect(result).toBe(NOT_INSTALLED_MSG);
  });
});

describe("notInstalledResult", () => {
  it("returns a content array with the not-installed message", () => {
    const result = notInstalledResult();
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(NOT_INSTALLED_MSG);
  });
});
