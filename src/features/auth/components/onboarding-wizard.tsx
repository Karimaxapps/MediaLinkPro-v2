import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import {
    profileSchema,
    ProfileFormValues,
    GeneralInfoValues,
    ProfessionalInfoValues,
    ContactInfoValues
} from '@/features/profile/schemas';
import { GeneralInfoFields } from '@/features/profile/components/basic-info-fields';
import { ProfessionalInfoFields } from '@/features/profile/components/professional-info-fields';
import { ContactInfoFields } from '@/features/profile/components/contact-info-fields';
import { updateMyProfile } from '@/features/profile/server/actions';

const STEPS = [
    { id: 0, title: 'Basic Info', description: 'Let\'s get to know you' },
    { id: 1, title: 'Professional', description: 'Your career details' },
    { id: 2, title: 'Contact', description: 'How can people reach you?' },
    { id: 3, title: 'Welcome', description: 'All set!' }
];

export function OnboardingWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }
        };
        getUser();
    }, []);

    // ... (rest of the component)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: 'onChange',
        defaultValues: {
            full_name: '',
            username: '',
            country: '',
            city: '',
            birth_date: '',
            avatar_url: '',

            job_title: '',
            job_function: '',
            company: '',
            skills: [],
            about: '',

            website: '',
            linkedin_url: '',
            x_url: '',
            instagram_url: '',
            facebook_url: '',
            tiktok_url: '',
            contact_email_public: '',
            contact_phone_public: '',
            contact_email_public_enabled: true,
            contact_phone_public_enabled: true,
        }
    });

    // Helper to validate current step before moving next
    const validateStep = async (step: number) => {
        let fieldsToValidate: (keyof ProfileFormValues)[] = [];

        switch (step) {
            case 0: // General
                fieldsToValidate = ['full_name', 'username', 'country', 'city', 'birth_date'];
                break;
            case 1: // Professional
                fieldsToValidate = ['job_title', 'job_function', 'company', 'about', 'skills'];
                break;
            case 2: // Contact
                fieldsToValidate = ['website', 'linkedin_url', 'x_url', 'instagram_url', 'facebook_url', 'tiktok_url', 'contact_email_public', 'contact_phone_public'];
                break;
            default:
                return true;
        }

        const isValid = await form.trigger(fieldsToValidate);
        return isValid;
    };

    const handleNext = async () => {
        if (currentStep < 3) {
            const isValid = await validateStep(currentStep);
            if (isValid) {
                if (currentStep === 0) {
                    // Save name for welcome screen
                    setUserName(form.getValues('full_name'));
                }
                setCurrentStep((prev) => prev + 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            const data = form.getValues();
            // Ensure skills is array if updated via text input inside component
            // (The component handles update via setValue, so data.skills should be correct if handled properly there)
            // But let's double check if we need any transformation here?
            // The ProfessionalFields component uses setValue('skills', array). So it should be fine.

            const result = await updateMyProfile(data);

            if (result.success) {
                toast.success('Profile created successfully!');
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                toast.error(result.error || 'Failed to update profile');
                // If error, maybe go back to step 0? Or stay on welcome screen (which is weird)?
                // Actually, we should probably submit BEFORE the welcome screen? 
                // Creating the profile IS the action. 
                // Maybe submit at step 2 -> 3 transition?
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    // We submit when entering step 3 (Welcome) or when clicking "Done" on step 3?
    // Let's submit when user clicks "Complete Setup" on Step 2?
    // "Next" on Step 2 -> Submit -> If success -> Show Step 3 (Welcome).

    const handleComplete = async () => {
        const isValid = await validateStep(2);
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const data = form.getValues();
            const result = await updateMyProfile(data);

            if (result.success) {
                toast.success('Profile setup complete!');
                setUserName(data.full_name);
                setCurrentStep(3); // Go to Welcome
            } else {
                toast.error(result.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 py-8">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Welcome to MediaLinkPro
                </h1>
                <p className="text-gray-400">Let's set up your profile in just a few steps.</p>
            </div>

            {currentStep < 3 && (
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2 text-gray-400">
                        <span>Step {currentStep + 1} of 3</span>
                        <span>{Math.round(((currentStep + 1) / 3) * 100)}%</span>
                    </div>
                    <Progress value={((currentStep + 1) / 3) * 100} className="h-2 bg-white/5" indicatorClassName="bg-[#C6A85E]" />
                </div>
            )}

            <Card className="bg-[#0B0F14] border-white/10 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        {currentStep === 3 ? (
                            <CheckCircle2 className="h-6 w-6 text-[#C6A85E]" />
                        ) : (
                            <div className="h-6 w-6 rounded-full bg-[#C6A85E]/20 text-[#C6A85E] flex items-center justify-center text-sm font-bold">
                                {currentStep + 1}
                            </div>
                        )}
                        {STEPS[currentStep].title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        {STEPS[currentStep].description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {currentStep === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {userId && (
                                <GeneralInfoFields
                                    register={form.register}
                                    errors={form.formState.errors}
                                    watch={form.watch}
                                    setValue={form.setValue}
                                    currentUserId={userId}
                                />
                            )}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <ProfessionalInfoFields
                                register={form.register}
                                errors={form.formState.errors}
                                watch={form.watch}
                                setValue={form.setValue}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <ContactInfoFields
                                register={form.register}
                                errors={form.formState.errors}
                                watch={form.watch}
                                setValue={form.setValue}
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="text-center py-8 space-y-4 animate-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-[#C6A85E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-[#C6A85E]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Welcome, {userName}!</h2>
                            <p className="text-gray-400 max-w-md mx-auto">
                                Your profile has been successfully created. You can now access your dashboard and verify your account.
                            </p>
                            <div className="pt-4">
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    size="lg"
                                    className="bg-[#C6A85E] text-black hover:bg-[#b5964a] w-full sm:w-auto min-w-[200px]"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>

                {currentStep < 3 && (
                    <CardFooter className="flex justify-between border-t border-white/10 p-6 bg-white/5">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0 || isSubmitting}
                            className="text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>

                        {currentStep === 2 ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isSubmitting}
                                className="bg-[#C6A85E] text-black hover:bg-[#b5964a]"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Setup
                                {!isSubmitting && <CheckCircle2 className="ml-2 h-4 w-4" />}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-white text-black hover:bg-gray-200"
                            >
                                Next Step
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
