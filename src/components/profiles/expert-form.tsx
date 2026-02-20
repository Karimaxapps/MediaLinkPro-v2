'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { expertProfileSchema, ExpertProfile } from "@/features/profiles/schema"
import { upsertExpertProfile } from "@/features/profiles/server/actions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ExpertFormProps {
    expertProfile: any;
}

export function ExpertForm({ expertProfile }: ExpertFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const defaultValues: Partial<ExpertProfile> = {

        about: expertProfile?.about || "",

        skills: expertProfile?.skills || [],
        social_links: {
            linkedin: expertProfile?.social_links?.linkedin || "",
            twitter: expertProfile?.social_links?.twitter || "",
            portfolio: expertProfile?.social_links?.portfolio || "",
            github: expertProfile?.social_links?.github || "",
        }
    };

    const form = useForm<ExpertProfile>({
        resolver: zodResolver(expertProfileSchema),
        defaultValues,
        mode: "onChange",
    })

    async function onSubmit(data: ExpertProfile) {
        setIsLoading(true);
        try {
            const result = await upsertExpertProfile({}, data); // server action handles parsing if we pass obj

            if (result.success) {
                toast.success("Expert profile saved successfully");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


                <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">About</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your professional background and services..."
                                    className="resize-none h-32 bg-white/5 border-white/10 text-white"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Skills would ideally be a tag input, simple text for now or comma separated? Schema says array. 
                Let's use a simple text input and split by comma for simplicity in this iteration 
                OR just a single text instructions for the user if we don't build a complex tag input.
                Updating schema to string for simplicity? No, schema is array. 
                Let's make a custom input or just text helper.
            */}
                    <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-white">Skills (Comma separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Consulting, Strategy, Media Buying"
                                        value={field.value?.join(', ') || ''}
                                        onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                        className="bg-white/5 border-white/10 text-white"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-white">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="social_links.linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="LinkedIn URL" {...field} className="bg-white/5 border-white/10 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_links.twitter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Twitter URL" {...field} className="bg-white/5 border-white/10 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_links.portfolio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Portfolio URL" {...field} className="bg-white/5 border-white/10 text-white" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                    {isLoading ? "Saving..." : "Save Expert Profile"}
                </Button>
            </form>
        </Form>
    )
}
