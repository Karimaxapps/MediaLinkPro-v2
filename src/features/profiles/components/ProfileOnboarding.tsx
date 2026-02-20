'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfile } from '../schema';
import { updateProfile } from '../server/actions';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProfileOnboarding({ initialData }: { initialData?: Partial<UpdateProfile> }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<UpdateProfile>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            full_name: initialData?.full_name || '',
            username: initialData?.username || '',
            bio: initialData?.bio || '',
            website: initialData?.website || '',
            avatar_url: initialData?.avatar_url || '',
        },
    });

    async function onSubmit(data: UpdateProfile) {
        setIsSubmitting(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        try {
            const result = await updateProfile({ success: false }, formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Profile setup complete!');
                router.refresh();
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-white/5 border-white/10 text-white backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Complete Your Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Please set your name and username to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="full_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/15 transition-all"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="johndoe"
                                                {...field}
                                                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:bg-white/15 transition-all"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-2 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Continue to Dashboard'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
