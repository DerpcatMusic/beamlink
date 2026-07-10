export type AnalyticsSection = "core" | "audience" | "attribution" | "meta";
export type SectionResult<T> = { ok: true; value: T } | { ok: false; message: string };

export async function sectionResult<T>(section: AnalyticsSection, load: () => Promise<T>): Promise<SectionResult<T>> {
  try {
    return { ok: true, value: await load() };
  } catch (error) {
    console.error(JSON.stringify({
      operation: "analytics-section",
      section,
      error: error instanceof Error ? error.message : "unknown"
    }));
    return { ok: false, message: section === "meta" ? "Meta data is temporarily unavailable." : "Analytics data is temporarily unavailable." };
  }
}
