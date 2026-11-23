type AssetPointer = { url: string };

const pointers = import.meta.glob<AssetPointer>("../assets/species/*.jpg.asset.json", {
  eager: true,
  import: "default",
});

const bySlug: Record<string, string> = {};
for (const [path, pointer] of Object.entries(pointers)) {
  const slug = path.split("/").pop()?.replace(".jpg.asset.json", "");
  if (slug) bySlug[slug] = pointer.url;
}

export function speciesImage(slug: string): string | undefined {
  return bySlug[slug];
}
