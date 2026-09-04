"use client";

import { useEffect } from "react";

export function HomeSectionOrder() {
  useEffect(() => {
    const premium = document.querySelector<HTMLElement>("main > #premium");
    const academy = document.querySelector<HTMLElement>("main > #academy");

    if (!premium || !academy || premium.nextElementSibling === academy) {
      return;
    }

    premium.insertAdjacentElement("afterend", academy);
  }, []);

  return null;
}
