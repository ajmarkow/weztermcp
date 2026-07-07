import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const NOT_INSTALLED_MSG =
  "WezTerm is not installed or not on PATH. Install it from https://wezfurlong.org/wezterm/ and ensure 'wezterm' is accessible.";

export async function assertWeztermInstalled(): Promise<string | null> {
  try {
    const { stdout } = await execAsync("wezterm --version");
    if (!stdout.trim()) {
      return NOT_INSTALLED_MSG;
    }
    return null;
  } catch {
    return NOT_INSTALLED_MSG;
  }
}

export function notInstalledResult(): { content: any[] } {
  return { content: [{ type: "text", text: NOT_INSTALLED_MSG }] };
}
