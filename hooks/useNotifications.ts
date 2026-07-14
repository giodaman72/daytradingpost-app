"use client";

import { useState } from "react";
import type { Notification } from "@/types/notification";

export function useNotifications(initialItems: readonly Notification[] = []) {
  const [items, setItems] = useState<Notification[]>([...initialItems]);

  function markAllRead() {
    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt })),
    );
  }

  function markRead(id: string) {
    const readAt = new Date().toISOString();
    setItems((current) =>
      current.map((item) =>
        item.id === id && !item.readAt ? { ...item, readAt } : item,
      ),
    );
  }

  return {
    items,
    markAllRead,
    markRead,
    unreadCount: items.filter((item) => !item.readAt).length,
  };
}
