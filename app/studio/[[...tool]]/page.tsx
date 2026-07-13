"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";
import { isSanityConfigured } from "@/sanity/env";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="studio-config-state">
        <div>
          <span>DTP Studio</span>
          <h1>Connect a Sanity project to open the publishing desk.</h1>
          <p>
            Add the public Sanity project ID, dataset and API version to
            <code>.env.local</code>, then restart the development server.
          </p>
        </div>
      </main>
    );
  }

  return <NextStudio config={config} />;
}
