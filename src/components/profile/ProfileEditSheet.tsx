import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { updateMyProfile } from '@/features/profile/server/actions';
import { Database } from '@/types/supabase';
import { profileSchema, ProfileFormValues } from '@/features/profile/schemas';
import { GeneralInfoFields } from '@/features/profile/components/basic-info-fields';
import { ProfessionalInfoFields } from '@/features/profile/components/professional-info-fields';
import { ContactInfoFields } from '@/features/profile/components/contact-info-fields';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileEditSheetProps {
    profile: Profile;
    children: React.ReactNode;
}

export function ProfileEditSheet({ profile, children }: ProfileEditSheetProps) {
    const [open, setOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: profile.full_name || '',
            username: profile.username || '',
            avatar_url: profile.avatar_url || '',
            city: profile.city || '',
            country: profile.country || '',
            birth_date: profile.birth_date || '',

            job_title: profile.job_title || '',
            company: profile.company || '',
            job_function: profile.job_function || '',
            skills: profile.skills || [],
            about: profile.about || '',

            website: profile.website || '',
            linkedin_url: profile.linkedin_url || '',
            x_url: profile.x_url || '',
            instagram_url: profile.instagram_url || '',
            facebook_url: profile.facebook_url || '',
            tiktok_url: profile.tiktok_url || '',
            contact_email_public: profile.contact_email_public || '',
            contact_phone_public: profile.contact_phone_public || '',
            contact_email_public_enabled: profile.contact_email_public_enabled ?? true,
            contact_phone_public_enabled: profile.contact_phone_public_enabled ?? true,
        }
    });

    async function onSubmit(data: ProfileFormValues) {
        setIsSaving(true);
        try {
            // Data is already in correct format from schema including skills array
            const result = await updateMyProfile(data);

            if (result.success) {
                toast.success('Profile updated successfully');
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl flex flex-col h-full bg-[#0B0F14] border-l border-white/10 p-0 shadow-xl">
                <div className="p-6 pb-2">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-xl font-bold text-white">Edit Profile</SheetTitle>
                        <SheetDescription className="text-gray-400">
                            Make changes to your public profile here. Click save when you're done.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <Tabs defaultValue="general" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1">
                                <TabsTrigger
                                    value="general"
                                    className="data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black text-gray-400 hover:text-white transition-colors"
                                >
                                    General
                                </TabsTrigger>
                                <TabsTrigger
                                    value="professional"
                                    className="data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black text-gray-400 hover:text-white transition-colors"
                                >
                                    Professional
                                </TabsTrigger>
                                <TabsTrigger
                                    value="social"
                                    className="data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black text-gray-400 hover:text-white transition-colors"
                                >
                                    Contact
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6 space-y-4 px-1">
                                <TabsContent value="general" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 focus-visible:outline-none">
                                    <GeneralInfoFields
                                        register={form.register}
                                        errors={form.formState.errors}
                                        watch={form.watch}
                                        setValue={form.setValue}
                                        initialUsername={profile.username || undefined}
                                        currentUserId={profile.id}
                                        initialAvatarUrl={profile.avatar_url}
                                    />
                                </TabsContent>

                                <TabsContent value="professional" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 focus-visible:outline-none">
                                    <ProfessionalInfoFields
                                        register={form.register}
                                        errors={form.formState.errors}
                                        watch={form.watch}
                                        setValue={form.setValue}
                                    />
                                </TabsContent>

                                <TabsContent value="social" className="space-y-4 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95 focus-visible:outline-none">
                                    <ContactInfoFields
                                        register={form.register}
                                        errors={form.formState.errors}
                                        watch={form.watch}
                                        setValue={form.setValue}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    <SheetFooter className="bg-[#0B0F14] border-t border-white/10 p-6 sm:justify-between sm:space-x-4">
                        <SheetClose asChild>
                            <Button variant="outline" type="button" className="border-white/10 text-white hover:bg-white/5 hover:text-white bg-transparent">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isSaving} className="bg-[#C6A85E] text-black hover:bg-[#b5964a]">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

