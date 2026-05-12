import { getAllLanguages, getLanguageUserCounts } from "@/features/languages/server/queries";
import { LanguagesClient } from "./languages-client";

export default async function AdminLanguagesPage() {
  const [languages, userCounts] = await Promise.all([
    getAllLanguages(),
    getLanguageUserCounts(),
  ]);

  return <LanguagesClient languages={languages} userCounts={userCounts} />;
}
