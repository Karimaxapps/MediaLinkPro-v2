import { getThemeSettings } from "@/features/admin/server/theme-settings";
import { ThemeClient } from "./theme-client";

export const metadata = { title: "Theme | Admin" };

export default async function ThemePage() {
  const theme = await getThemeSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure the brand palette used across the entire webapp. The primary brand color
          drives buttons, icons, links, and highlights. Changes apply immediately after saving.
        </p>
      </div>
      <ThemeClient initial={theme} />
    </div>
  );
}
