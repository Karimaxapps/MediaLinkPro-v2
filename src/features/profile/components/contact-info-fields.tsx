'use client';

import { FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ContactInfoFieldsProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
}

export function ContactInfoFields({ register, errors, watch, setValue }: ContactInfoFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="website" className="text-gray-300">Website / Portfolio URL</Label>
                <Input
                    id="website"
                    placeholder="https://example.com"
                    {...register('website')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.website && (
                    <p className="text-sm text-red-500">{errors.website.message as string}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="linkedin_url" className="text-gray-300">LinkedIn URL</Label>
                <Input
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/..."
                    {...register('linkedin_url')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.linkedin_url && (
                    <p className="text-sm text-red-500">{errors.linkedin_url.message as string}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="x_url" className="text-gray-300">X (Twitter) URL</Label>
                <Input
                    id="x_url"
                    placeholder="https://x.com/..."
                    {...register('x_url')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.x_url && (
                    <p className="text-sm text-red-500">{errors.x_url.message as string}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="instagram_url" className="text-gray-300">Instagram URL</Label>
                <Input
                    id="instagram_url"
                    placeholder="https://instagram.com/..."
                    {...register('instagram_url')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.instagram_url && (
                    <p className="text-sm text-red-500">{errors.instagram_url.message as string}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="facebook_url" className="text-gray-300">Facebook URL</Label>
                <Input
                    id="facebook_url"
                    placeholder="https://facebook.com/..."
                    {...register('facebook_url')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.facebook_url && (
                    <p className="text-sm text-red-500">{errors.facebook_url.message as string}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="tiktok_url" className="text-gray-300">TikTok URL</Label>
                <Input
                    id="tiktok_url"
                    placeholder="https://tiktok.com/@..."
                    {...register('tiktok_url')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                />
                {errors.tiktok_url && (
                    <p className="text-sm text-red-500">{errors.tiktok_url.message as string}</p>
                )}
            </div>

            <Separator className="bg-white/10 my-6" />
            <h4 className="text-sm font-medium text-white mb-4">Direct Contact</h4>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="contact_email_public" className="text-gray-300">Contact Email</Label>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="contact_email_public_enabled"
                                checked={watch('contact_email_public_enabled')}
                                onCheckedChange={(checked) => setValue('contact_email_public_enabled', checked, { shouldDirty: true })}
                                className="data-[state=checked]:bg-[#C6A85E] data-[state=unchecked]:bg-slate-700"
                            />
                            <Label htmlFor="contact_email_public_enabled" className="text-xs text-gray-400">
                                {watch('contact_email_public_enabled') ? 'Public' : 'Private'}
                            </Label>
                        </div>
                    </div>
                    <Input
                        id="contact_email_public"
                        placeholder="contact@example.com"
                        {...register('contact_email_public')}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                    />
                    <p className="text-xs text-gray-500">Public email for business inquiries.</p>
                    {errors.contact_email_public && (
                        <p className="text-sm text-red-500">{errors.contact_email_public.message as string}</p>
                    )}
                </div>

                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="contact_phone_public" className="text-gray-300">Contact Phone</Label>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="contact_phone_public_enabled"
                                checked={watch('contact_phone_public_enabled')}
                                onCheckedChange={(checked) => setValue('contact_phone_public_enabled', checked, { shouldDirty: true })}
                                className="data-[state=checked]:bg-[#C6A85E] data-[state=unchecked]:bg-slate-700"
                            />
                            <Label htmlFor="contact_phone_public_enabled" className="text-xs text-gray-400">
                                {watch('contact_phone_public_enabled') ? 'Public' : 'Private'}
                            </Label>
                        </div>
                    </div>
                    <Input
                        id="contact_phone_public"
                        placeholder="+1 (555) 000-0000"
                        {...register('contact_phone_public')}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                    />
                    <p className="text-xs text-gray-500">Public phone number for business inquiries.</p>
                    {errors.contact_phone_public && (
                        <p className="text-sm text-red-500">{errors.contact_phone_public.message as string}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
