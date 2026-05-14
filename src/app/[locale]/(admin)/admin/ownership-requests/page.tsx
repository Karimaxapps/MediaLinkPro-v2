import { listAdminOwnershipRequests } from "@/features/admin/server/actions";
import { OwnershipRequestsClient } from "./ownership-requests-client";

export default async function AdminOwnershipRequestsPage() {
    const requests = await listAdminOwnershipRequests();

    const pending = requests.filter((r) => r.status === "pending");
    const resolved = requests.filter((r) => r.status !== "pending");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Ownership Claims</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Companies requesting to take control of platform-seeded content
                </p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-400 mb-3">
                        Pending ({pending.length})
                    </h2>
                    <OwnershipRequestsClient requests={pending} />
                </section>

                {resolved.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                            Resolved ({resolved.length})
                        </h2>
                        <OwnershipRequestsClient requests={resolved} readOnly />
                    </section>
                )}
            </div>
        </div>
    );
}
