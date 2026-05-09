"use client";

import { useEffect, useRef } from "react";
import { incrementPostView } from "@/features/blog/server/actions";

export function ViewTracker({ postId }: { postId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementPostView(postId).catch(() => {});
  }, [postId]);

  return null;
}
