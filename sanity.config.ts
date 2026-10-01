import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { sanityDataset, sanityProjectId } from "./sanity/env";
import { ArticleImportTool } from "./sanity/tools/ArticleImportTool";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "default",
  title: "DayTradingPost CMS",
  basePath: "/studio",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
  tools: [
    {
      name: "article-import",
      title: "Article import",
      component: ArticleImportTool,
    },
  ],
});
