import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CompaniesIcon } from "@/components/ui/icons";

/** Rendered with a real 404 when the ticker isn't a company we know. */
export default function CompanyNotFound() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          icon={CompaniesIcon}
          title="No company with that ticker"
          description="Check the symbol, or search for the company by name."
          action={
            <Link href="/company">
              <Button variant="outline">Search companies</Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
