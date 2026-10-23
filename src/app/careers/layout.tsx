import Link from "next/link";
import { UsersIcon } from "lucide-react";

export default function CareersLayout({ children }: LayoutProps<"/careers">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/careers" className="flex items-center gap-2 font-semibold">
            <UsersIcon className="size-5" /> Careers
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 p-4 py-8">{children}</main>
    </div>
  );
}
