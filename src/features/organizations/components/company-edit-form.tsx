'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { companyWizardSchema, CompanyWizardValues, ORG_TYPES, BROADCASTER_TYPES, BROADCASTER_GENRES } from "@/features/organizations/schema"
import { updateOrganization } from "@/features/organizations/server/actions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { useTranslations } from "next-intl"
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    org: Record<string, any>;
    currentUserId: string;
}

export function CompanyEditForm({ org, currentUserId }: CompanyEditFormProps) {
    const t = useTranslations("companies");
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
            broadcaster_type: org.broadcaster_type || undefined,
            broadcaster_genre: org.broadcaster_genre || undefined,
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
                toast.success(t("form.profileUpdated"));
                setOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || t("form.failedUpdate"));
            }
        } catch {
            toast.error(t("errorOccurred"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white">
                    <Edit className="h-4 w-4" />
                    {t("form.editCompany")}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-xl bg-black/95 border-white/10 text-white p-6">
                <SheetHeader>
                    <SheetTitle className="text-white">{t("form.editCompanyProfile")}</SheetTitle>
                    <SheetDescription className="text-gray-400">
                        {t("form.editCompanyDesc")}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">

                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-[var(--brand)]" />
                                {t("form.companyLogo")}
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
                                    {t("form.editLogoHint")}
                                </p>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">{t("form.basicInfo")}</h3>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">{t("form.companyName")}</FormLabel>
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
                                            <FormLabel className="text-gray-300">{t("form.type")}</FormLabel>
                                            <Select
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    if (val !== "Broadcaster") {
                                                        form.setValue("broadcaster_type", undefined);
                                                        form.setValue("broadcaster_genre", undefined);
                                                    }
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder={t("form.selectType")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-black border-white/10 text-white">
                                                    {ORG_TYPES.map((type) => (
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
                                            <FormLabel className="text-gray-300">{t("form.urlSlug")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} className="bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Broadcaster sub-type — shown only when type = Broadcaster */}
                            {form.watch("type") === "Broadcaster" && (
                                <FormField
                                    control={form.control}
                                    name="broadcaster_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">
                                                {t("form.broadcasterType")} <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder={t("form.televisionOrRadio")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-black border-white/10 text-white">
                                                    {BROADCASTER_TYPES.map((bt) => (
                                                        <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Broadcaster genre — shown only when type = Broadcaster */}
                            {form.watch("type") === "Broadcaster" && (
                                <FormField
                                    control={form.control}
                                    name="broadcaster_genre"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">{t("form.genre")}</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder={t("form.genrePlaceholder")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-black border-white/10 text-white">
                                                    {BROADCASTER_GENRES.map((g) => (
                                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="tagline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">{t("form.tagline")}</FormLabel>
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
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">{t("form.details")}</h3>
                            <FormField
                                control={form.control}
                                name="main_activity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">{t("form.mainActivity")}</FormLabel>
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
                                        <FormLabel className="text-gray-300">{t("form.aboutUs")}</FormLabel>
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
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">{t("form.contactSection")}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-300">{t("form.website")}</FormLabel>
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
                                            <FormLabel className="text-gray-300">{t("form.publicEmail")}</FormLabel>
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
                                            <FormLabel className="text-gray-300">{t("form.phone")}</FormLabel>
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
                                            <FormLabel className="text-gray-300">{t("form.country")}</FormLabel>
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
                                        <FormLabel className="text-gray-300">{t("form.address")}</FormLabel>
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
                            <h3 className="text-sm font-medium text-gray-200 border-b border-white/10 pb-2">{t("form.socials")}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">{t("form.linkedin")}</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="x_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">{t("form.xTwitter")}</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="facebook_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">{t("form.facebook")}</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="instagram_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">{t("form.instagram")}</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="youtube_url" render={({ field }) => (
                                    <FormItem><FormLabel className="text-gray-300">{t("form.youtube")}</FormLabel><FormControl><Input {...field} className="bg-white/5 border-white/10 text-white" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-white text-black hover:bg-gray-200 border-transparent">
                                {t("form.cancel")}
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-[var(--brand)] text-black hover:bg-[#B5964A]">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t("form.saveChanges")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
