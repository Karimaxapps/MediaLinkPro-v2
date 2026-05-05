export type CompletionField = { key: string; label: string; complete: boolean };

export function computeProfileCompletion(
    profile: {
        full_name?: string | null;
        avatar_url?: string | null;
        bio?: string | null;
        city?: string | null;
        skills?: string[] | null;
        linkedin_url?: string | null;
    },
    counts: { experiences: number; education: number; portfolio: number }
): {
    score: number;
    fields: CompletionField[];
} {
    const fields: CompletionField[] = [
        { key: "full_name", label: "Full name", complete: !!profile.full_name },
        { key: "avatar", label: "Profile photo", complete: !!profile.avatar_url },
        { key: "bio", label: "Bio", complete: !!profile.bio && profile.bio.length > 20 },
        { key: "location", label: "Location", complete: !!profile.city },
        { key: "skills", label: "Skills", complete: (profile.skills?.length ?? 0) > 0 },
        { key: "linkedin", label: "LinkedIn", complete: !!profile.linkedin_url },
        { key: "experience", label: "Work experience", complete: counts.experiences > 0 },
        { key: "education", label: "Education", complete: counts.education > 0 },
        { key: "portfolio", label: "Portfolio item", complete: counts.portfolio > 0 },
    ];
    const complete = fields.filter((f) => f.complete).length;
    return { score: Math.round((complete / fields.length) * 100), fields };
}
