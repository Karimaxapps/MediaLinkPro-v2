"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type RecommendedProfile = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    city: string | null;
    country: string | null;
    skills: string[] | null;
    score: number;
    reasons: string[];
};

/**
 * Recommend profiles based on:
 * - Shared skills
 * - Same city / country
 * - Mutual connections (2nd-degree)
 * Excludes self, existing connections (any status), and deduplicates.
 */
export async function getRecommendedConnections(limit: number = 6): Promise<RecommendedProfile[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Load current user profile
    const { data: me } = await supabase
        .from("profiles")
        .select("id, city, country, skills")
        .eq("id", user.id)
        .single();
    if (!me) return [];

    // Load existing connection edges to exclude
    const { data: connections } = await supabase
        .from("connections")
        .select("requester_id, recipient_id, status")
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    const excluded = new Set<string>([user.id]);
    const acceptedPeers = new Set<string>();
    (connections ?? []).forEach((c) => {
        const other = c.requester_id === user.id ? c.recipient_id : c.requester_id;
        excluded.add(other);
        if (c.status === "accepted") acceptedPeers.add(other);
    });

    // Fetch 2nd-degree (connections of accepted peers) for mutual-connection signal
    let secondDegree: Map<string, number> = new Map();
    if (acceptedPeers.size > 0) {
        const peerIds = [...acceptedPeers];
        const { data: peerConns } = await supabase
            .from("connections")
            .select("requester_id, recipient_id")
            .eq("status", "accepted")
            .or(`requester_id.in.(${peerIds.join(",")}),recipient_id.in.(${peerIds.join(",")})`);
        (peerConns ?? []).forEach((c) => {
            [c.requester_id, c.recipient_id].forEach((id) => {
                if (!excluded.has(id)) {
                    secondDegree.set(id, (secondDegree.get(id) ?? 0) + 1);
                }
            });
        });
    }

    // Candidate pool: profiles with overlapping skills OR same city
    const mySkills = (me.skills ?? []) as string[];
    let candidatesQuery = supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, headline, city, country, skills")
        .neq("id", user.id)
        .limit(50);

    if (mySkills.length > 0) {
        candidatesQuery = candidatesQuery.overlaps("skills", mySkills);
    } else if (me.city) {
        candidatesQuery = candidatesQuery.eq("city", me.city);
    }

    const { data: candidates } = await candidatesQuery;

    // Also pull 2nd-degree profiles not already in candidate set
    let augmented = candidates ?? [];
    const haveIds = new Set(augmented.map((c) => c.id));
    const extraIds = [...secondDegree.keys()].filter((id) => !haveIds.has(id));
    if (extraIds.length > 0) {
        const { data: extras } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, headline, city, country, skills")
            .in("id", extraIds);
        augmented = [...augmented, ...(extras ?? [])];
    }

    // Score each candidate
    const scored: RecommendedProfile[] = augmented
        .filter((p) => !excluded.has(p.id))
        .map((p) => {
            let score = 0;
            const reasons: string[] = [];

            const sharedSkills = (p.skills ?? []).filter((s: string) => mySkills.includes(s));
            if (sharedSkills.length > 0) {
                score += sharedSkills.length * 3;
                reasons.push(
                    `${sharedSkills.length} shared skill${sharedSkills.length > 1 ? "s" : ""}`
                );
            }

            if (me.city && p.city === me.city) {
                score += 2;
                reasons.push(`Same city: ${p.city}`);
            } else if (me.country && p.country === me.country) {
                score += 1;
                reasons.push(`Same country`);
            }

            const mutuals = secondDegree.get(p.id) ?? 0;
            if (mutuals > 0) {
                score += mutuals * 2;
                reasons.push(`${mutuals} mutual connection${mutuals > 1 ? "s" : ""}`);
            }

            return {
                id: p.id,
                username: p.username,
                full_name: p.full_name,
                avatar_url: p.avatar_url,
                headline: p.headline,
                city: p.city,
                country: p.country,
                skills: p.skills,
                score,
                reasons,
            };
        })
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    return scored;
}
