'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { companyWizardSchema, CompanyWizardValues } from "@/features/organizations/schema"
import { updateOrganization } from "@/features/organizations/server/actions"
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Edit, Image as ImageIcon, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CountrySelect } from "@/components/ui/country-select"
import { AvatarUpload } from "@/features/profile/components/avatar-upload"

interface CompanyEditFormProps {
    org: any; // Using any for simplicity as it matches database row
    currentUserId: string;
}

export function CompanyEditForm({ org, currentUserId }: CompanyEditFormProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CompanyWizardValues>({
        resolver: zodResolver(companyWizardSchema),
        defaultValues: {
            name: org.name,
            slug: org.slug,
            logo_url: org.logo_url || "",
            tagline: org.tagline || "",
            type: org.type,
            main_activity: org.main_activity || "",
            description: org.description || "",
            website: org.website || "",
            contact_email: org.contact_email || "",
            phone: org.phone || "",
            country: org.country || "",
            address: org.address || "",
            linkedin_url: org.linkedin_url || "",
            x_url: org.x_url || "",
            facebook_url: org.facebook_url || "",
            instagram_url: org.instagram_url || "",
            tiktok_url: org.tiktok_url || "",
            youtube_url: org.youtube_url || "",
        },
    });

    async function onSubmit(data: CompanyWizardValues) {
        setIsLoading(true);
        try {
            const result = await updateOrganization(org.id, data);

            if (result.success) {
                toast.success("Company profile updated successfully");
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    <Edit className="h-4 w-4" />
                    Edit Company
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-xl bg-black/95 border-white/10 text-white p-6">
                <SheetHeader>
                    <SheetTitle className="text-white">Edit Company Profile</SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Update your company information and settings.
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">

                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-[#C6A85E]" />
                                Company Logo
                            </h3>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col items-center">
                                <AvatarUpload
                                    currentUserId={currentUserId}
                                    currentAvatarUrl={form.watch('logo_url')}
                                    onUploadSuccess={(url) => {
                                        form.setValue('logo_url', url, { shouldDirty: true });
                                    }}
                                />
                                <input type="hidden" {...form.register('logo_url')} />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Recommended: 300x300px. JPG, PNG.
                                </p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">Basic Info</h3>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Company Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-black border-white/10 text-white">
                                                    {['Broadcaster', 'Production / Post-prod', 'Solution Provider', 'Media Association', 'Training Center'].map((type) => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">URL Slug</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="tagline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Tagline</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">Details</h3>
                            <FormField
                                control={form.control}
                                name="main_activity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Main Activity</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="bg-white/5 border-white/10 text-white h-20 resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">About Us</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className="bg-white/5 border-white/10 text-white h-32 resize-none" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">Contact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Website</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contact_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Public Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">Country</FormLabel>
                                            <CountrySelect value={field.value} onChange={field.onChange} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Socials */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">Socials</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">LinkedIn</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="x_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">X (Twitter)</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="facebook_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">Facebook</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="instagram_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">Instagram</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="youtube_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">YouTube</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-white text-black hover:bg-gray-200 border-transparent">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
