"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/lib/role-context";

export function TabletFlagReader() {
  const params = useSearchParams();
  const { setTablet } = useRole();

  useEffect(() => {
    if (params.get("tablet") === "1") setTablet(true);
  }, [params, setTablet]);

  return null;
}
