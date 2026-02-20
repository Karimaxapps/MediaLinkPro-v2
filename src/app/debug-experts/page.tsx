
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function DebugExpertsPage() {
    const [experts, setExperts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Check auth
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Fetch experts
            const { data, error } = await supabase
                .from('product_experts')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        full_name,
                        avatar_url,
                        headline
                    )
                `);

            if (error) {
                setError(error.message);
            } else {
                setExperts(data || []);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="p-8 bg-black text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Product Experts</h1>

            <div className="mb-8 p-4 bg-gray-900 rounded">
                <h2 className="text-xl font-bold mb-2">Auth Status</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Experts ({experts.length})</h2>
                    <div className="grid gap-4">
                        {experts.map((expert) => (
                            <div key={expert.id} className="p-4 border border-gray-700 rounded">
                                <pre>{JSON.stringify(expert, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
