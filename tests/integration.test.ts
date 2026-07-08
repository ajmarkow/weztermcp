import { exec } from "child_process";

jest.mock("child_process");
jest.mock("../src/wezterm_check", () => ({
  assertWeztermInstalled: jest.fn().mockResolvedValue(null),
  notInstalledResult: jest.fn(),
}));
const mockedExec = jest.mocked(exec);

import WeztermExecutor from "../src/wezterm_executor";
import WeztermOutputReader from "../src/wezterm_output_reader";
import SendControlCharacter from "../src/send_control_character";

describe("Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("全体的なワークフロー", () => {
    it("コマンド実行 → 出力読み取り → 制御文字送信の一連の流れが動作すること", async () => {
      const executor = new WeztermExecutor();
      const outputReader = new WeztermOutputReader();
      const controlCharSender = new SendControlCharacter();

      // 1. コマンド実行のモック（writeToTerminalは2回execを呼ぶ：listとsend-text）
      let callCount = 0;
      mockedExec.mockImplementation((command: string, callback: any) => {
        callCount++;
        if (command.includes("list-clients")) {
          callback(null, { stdout: "[]", stderr: "" });
        } else if (command.includes("list")) {
          callback(null, {
            stdout: JSON.stringify([{ window_id: 1, tab_id: 1, pane_id: 1, title: "Terminal" }]),
            stderr: "",
          });
        } else if (command.includes("send-text")) {
          callback(null, { stdout: "", stderr: "" });
        } else if (command.includes("get-text")) {
          // 出力読み取り用
          callback(null, { stdout: "hello\n", stderr: "" });
        } else {
          // その他のコマンド
          callback(null, { stdout: "", stderr: "" });
        }
        return {} as any;
      });

      const writeResult = await executor.writeToTerminal('echo "hello"', 1);
      expect(writeResult.content[0].text).toContain("Command sent to pane 1");

      // 2. 出力読み取り
      const readResult = await outputReader.readOutput(10);
      expect(readResult.content[0].text).toBe("hello\n");

      // 3. 制御文字送信
      const controlResult = await controlCharSender.send("c");
      expect(controlResult.content[0].text).toBe(
        "Sent control character: Ctrl+C"
      );
    }, 15000);

    it("エラーハンドリングが各クラスで一貫していること", async () => {
      const executor = new WeztermExecutor();
      const outputReader = new WeztermOutputReader();

      // 全てのクラスでエラーが発生した場合
      mockedExec.mockImplementation((command: string, callback: any) => {
        callback(new Error("WezTerm not available"), null);
        return {} as any;
      });

      // WeztermExecutorのエラー
      const writeResult = await executor.writeToTerminal("test", 1);
      expect(writeResult.content[0].text).toContain(
        "Failed to write to terminal"
      );
      expect(writeResult.content[0].text).toContain("WezTerm not available");

      // WeztermOutputReaderのエラー
      const readResult = await outputReader.readOutput(10);
      expect(readResult.content[0].text).toContain(
        "Failed to read terminal output"
      );
      expect(readResult.content[0].text).toContain("WezTerm not available");

      // SendControlCharacterのエラー
      const controlCharSender = new SendControlCharacter();
      await expect(controlCharSender.send("c")).rejects.toThrow(
        "Failed to send control character: WezTerm not available"
      );
    });

    it("複数のペインでの操作が正常に動作すること", async () => {
      const executor = new WeztermExecutor();

      // ペイン一覧取得
      mockedExec.mockImplementationOnce((command: string, callback: any) => {
        const paneList = JSON.stringify([
          { window_id: 1, tab_id: 1, pane_id: 1, title: "Terminal" },
          { window_id: 1, tab_id: 1, pane_id: 2, title: "Editor" },
        ]);
        callback(null, { stdout: paneList, stderr: "" });
        return {} as any;
      });
      mockedExec.mockImplementationOnce((command: string, callback: any) => {
        // no window_id/tab_id given, so listPanes then queries list-clients
        callback(null, { stdout: "[]", stderr: "" });
        return {} as any;
      });

      const listResult = await executor.listPanes();
      expect(listResult.content[0].text).toContain("pane_id=1");
      expect(listResult.content[0].text).toContain("pane_id=2");

      // ペイン切り替え
      mockedExec.mockImplementationOnce((command: string, callback: any) => {
        expect(command).toContain("activate-pane --pane-id 2");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const switchResult = await executor.switchPane(2);
      expect(switchResult.content[0].text).toBe("Switched to pane 2");

      // write to a specific pane using wezterm_pane_write
      mockedExec.mockImplementationOnce((command: string, callback: any) => {
        expect(command).toContain("--pane-id 2");
        expect(command).toContain("ls");
        callback(null, { stdout: "", stderr: "" });
        return {} as any;
      });

      const writeResult = await executor.writeToTerminal("ls", 2);
      expect(writeResult.content[0].text).toBe("Command sent to pane 2: ls");
    });
  });

  describe("パフォーマンステスト", () => {
    it("大量のコマンド実行が適切に処理されること", async () => {
      const executor = new WeztermExecutor();

      mockedExec.mockImplementation((command: string, callback: any) => {
        // 即座にコールバックを呼び出す（遅延なし）
        if (command.includes("list")) {
          callback(null, { stdout: "pane_id=1 active=true", stderr: "" });
        } else {
          callback(null, { stdout: "", stderr: "" });
        }
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
    }, 10000); // 10秒のタイムアウト
  });
});
