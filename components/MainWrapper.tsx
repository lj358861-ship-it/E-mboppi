"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pleinEcran = pathname === "/videos";

  return (
    <main className={pleinEcran ? "" : "pb-20 md:pb-0"}>
      {children}
    </main>
  );
}
