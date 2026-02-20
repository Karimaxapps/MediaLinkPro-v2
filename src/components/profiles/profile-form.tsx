'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updateProfileSchema, UpdateProfile } from "@/features/profiles/schema"
import { updateProfile, checkUsernameAvailability } from "@/features/profiles/server/actions"
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
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Loader2 } from "lucide-react"

interface ProfileFormProps {
    profile: any;
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable' | 'invalid'>('idle');
    const [usernameMessage, setUsernameMessage] = useState('');

    // Define form using the schema
    const form = useForm<UpdateProfile>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            full_name: profile?.full_name || "",
            username: profile?.username || "",
            website: profile?.website || "",
            bio: profile?.bio || "",
            avatar_url: profile?.avatar_url || "",
        },
        mode: "onChange",
    })

    // Watch username for changes
    const username = form.watch("username");

    // Debounce username check
    useEffect(() => {
        const checkUsername = async () => {
            if (!username || username === profile?.username) {
                setUsernameStatus('idle');
                setUsernameMessage('');
                return;
            }

            if (username.length < 3) {
                setUsernameStatus('invalid');
                setUsernameMessage('Username must be at least 3 characters');
                return;
            }

            if (username.length > 30) {
                setUsernameStatus('invalid');
                setUsernameMessage('Username must be less than 30 characters');
                return;
            }

            if (!/^[a-z0-9_-]+$/.test(username)) {
                setUsernameStatus('invalid');
                setUsernameMessage('Only lowercase letters, numbers, underscores, and dashes allowed');
                return;
            }

            setUsernameStatus('checking');
            const isAvailable = await checkUsernameAvailability(username);

            if (isAvailable) {
                setUsernameStatus('available');
                setUsernameMessage('Username is available');
            } else {
                setUsernameStatus('unavailable');
                setUsernameMessage('Username is already taken');
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [username, profile?.username]);

    async function onSubmit(data: UpdateProfile) {
        setIsLoading(true);
        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const result = await updateProfile({}, formData);

            if (result.success) {
                toast.success("Profile updated successfully");
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
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        placeholder="shadcn"
                                        {...field}
                                        className={`bg-white/5 border-white/10 text-white pr-10 ${usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' :
                                            usernameStatus === 'unavailable' || usernameStatus === 'invalid' ? 'border-red-500 focus-visible:ring-red-500' : ''
                                            }`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                        {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                                        {(usernameStatus === 'unavailable' || usernameStatus === 'invalid') && <X className="h-4 w-4 text-red-500" />}
                                    </div>
                                </div>
                            </FormControl>
                            {usernameMessage && (
                                <p className={`text-xs mt-1 ${usernameStatus === 'available' ? 'text-green-500' :
                                    usernameStatus === 'unavailable' || usernameStatus === 'invalid' ? 'text-red-500' : 'text-gray-400'
                                    }`}>
                                    {usernameMessage}
                                </p>
                            )}
                            <FormDescription>
                                This is your public display name. It can be your real name or a pseudonym.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 text-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                    {isLoading ? "Saving..." : "Update profile"}
                </Button>
            </form>
        </Form>
    )
}
