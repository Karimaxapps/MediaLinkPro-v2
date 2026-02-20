'use client';

import { Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/ui/country-select";
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { debounce } from '@/lib/utils';

import { AvatarUpload } from './avatar-upload';

// Need to define a type that is compatible with the form values
// We can use any here to avoid strict coupling with the parent form's exact type, 
// as long as the field names match the schema.
interface GeneralInfoFieldsProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    initialUsername?: string;
    currentUserId: string; // Required for upload
    initialAvatarUrl?: string | null;
}

export function GeneralInfoFields({ register, errors, watch, setValue, initialUsername, currentUserId }: GeneralInfoFieldsProps) {
    const supabase = createClient();
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const currentUsername = watch('username');
    const currentAvatarUrl = watch('avatar_url');

    // ... (rest of checkUsername logic)

    // Debounced username check
    const checkUsername = useCallback(
        debounce(async (username: string) => {
            if (!username || username === initialUsername || username.length < 3) {
                setUsernameAvailable(null);
                return;
            }

            setIsCheckingUsername(true);
            try {
                const { count, error } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('username', username);

                if (error) {
                    console.error('Error checking username:', error);
                    setUsernameAvailable(null);
                } else {
                    setUsernameAvailable(count === 0);
                }
            } catch (err) {
                console.error('Error checking username:', err);
                setUsernameAvailable(null);
            } finally {
                setIsCheckingUsername(false);
            }
        }, 500),
        [initialUsername]
    );

    useEffect(() => {
        if (currentUsername) {
            checkUsername(currentUsername);
        } else {
            setUsernameAvailable(null);
        }
        return () => {
            checkUsername.cancel();
        };
    }, [currentUsername, checkUsername]);


    return (
        <div className="space-y-4">
            <div className="flex justify-center mb-6">
                <AvatarUpload
                    currentUserId={currentUserId}
                    currentAvatarUrl={currentAvatarUrl}
                    onUploadSuccess={(url) => {
                        setValue('avatar_url', url, { shouldDirty: true });
                    }}
                />
                {/* Hidden input to register avatar_url with the form */}
                <input type="hidden" {...register('avatar_url')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
                <Input
                    id="full_name"
                    {...register('full_name')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                    placeholder="John Doe"
                />
                {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                    <Input
                        id="username"
                        {...register('username')}
                        className={`bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E] pr-10 ${usernameAvailable === true ? 'border-green-500/50' :
                            usernameAvailable === false ? 'border-red-500/50' : ''
                            }`}
                        placeholder="johndoe"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : usernameAvailable === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : usernameAvailable === false ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                    </div>
                </div>
                {usernameAvailable === false && (
                    <p className="text-xs text-red-500">Username is already taken</p>
                )}
                {usernameAvailable === true && (
                    <p className="text-xs text-green-500">Username is available!</p>
                )}
                {errors.username && (
                    <p className="text-sm text-red-500">{errors.username.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="country" className="text-gray-300">Country</Label>
                <CountrySelect
                    value={watch('country') || ''}
                    onChange={(value) => setValue('country', value, { shouldDirty: true })}
                />
                {/* Hidden input to ensure validation works if using simple register for required check, 
                    though CountrySelect usually handles its own visual state. 
                    If using Zod schema, ensure the value is set in form state. */}
                <input type="hidden" {...register('country')} />
                {errors.country && (
                    <p className="text-sm text-red-500">{errors.country.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="city" className="text-gray-300">City</Label>
                <Input
                    id="city"
                    {...register('city')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                    placeholder="New York"
                />
                {errors.city && (
                    <p className="text-sm text-red-500">{errors.city.message as string}</p>
                )}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="birth_date" className="text-gray-300">Date of Birth</Label>
                <Input
                    id="birth_date"
                    type="date"
                    {...register('birth_date')}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E] block"
                />
                {errors.birth_date && (
                    <p className="text-sm text-red-500">{errors.birth_date.message as string}</p>
                )}
            </div>
        </div>
    );
}
