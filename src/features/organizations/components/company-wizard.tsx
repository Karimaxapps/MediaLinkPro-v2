"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
// Replaced framer-motion with simple conditional rendering and CSS transitions
import {
    Loader2, ChevronRight, ChevronLeft, Building2,
    FileText, Phone, Share2, CheckCircle2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CountrySelect } from "@/components/ui/country-select"
import { CompanyLogoUpload } from "./company-logo-upload"
import { companyWizardSchema, type CompanyWizardValues } from "../schema"
import { createCompanyWizardAction } from "../server/actions"
import { cn } from "@/lib/utils"

const steps = [
    {
        id: "identity",
        title: "Company Identity",
        description: "Basic information about your company",
        icon: Building2
    },
    {
        id: "activity",
        title: "Activity & Description",
        description: "What does your company do?",
        icon: FileText
    },
    {
        id: "contact",
        title: "Contact Details",
        description: "How can people reach you?",
        icon: Phone
    },
    {
        id: "social",
        title: "Social accounts",
        description: "Connect your social accounts",
        icon: Share2
    }
]

export function CompanyWizard({ userId }: { userId: string }) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [completed, setCompleted] = React.useState(false) // Success state
    const router = useRouter()

    const form = useForm<CompanyWizardValues>({
        resolver: zodResolver(companyWizardSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            slug: "",
            logo_url: "",
            tagline: "",
            // @ts-ignore zod enum issue
            type: undefined,
            main_activity: "",
            description: "",
            website: "",
            contact_email: "",
            phone: "",
            country: "",
            address: "",
            linkedin_url: "",
            x_url: "",
            facebook_url: "",
            instagram_url: "",
            tiktok_url: "",
            youtube_url: ""
        }
    })

    const { register, handleSubmit, formState: { errors, isValid }, trigger, setValue, watch, getValues } = form

    // Watch values for preview or conditional logic if needed
    const companyName = watch("name");

    const nextStep = async () => {
        let fieldsToValidate: (keyof CompanyWizardValues)[] = []

        switch (currentStep) {
            case 0:
                fieldsToValidate = ["name", "slug", "type"]
                break
            case 1:
                fieldsToValidate = ["main_activity"]
                break
            case 2:
                fieldsToValidate = ["website", "country", "contact_email"]
                break
            // Step 3 (social) validation handled on submit
        }

        const isStepValid = await trigger(fieldsToValidate)
        if (isStepValid) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    const onSubmit = async (data: CompanyWizardValues) => {
        setIsSubmitting(true)
        try {
            const result = await createCompanyWizardAction(data)

            if (result.success) {
                setCompleted(true)
                toast.success(result.message)
            } else {
                toast.error(result.error || "Failed to create company")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (completed) {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500 text-white">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold">Welcome, {companyName}!</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Your company profile has been created successfully. You can now start adding products,
                        receiving requests, and sharing your company services with the world.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                        onClick={() => router.push(`/companies/${watch("slug")}`)}
                    >
                        Go to Company Profile
                    </Button>
                    <Button
                        size="lg"
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => router.push(`/companies/${watch("slug")}/products/new`)}
                    >
                        Add your first product
                    </Button>
                </div>
            </div>
        )
    }

    const CurrentStepIcon = steps[currentStep].icon

    return (
        <div className="max-w-3xl mx-auto">
            {/* Steps Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10" />
                    <div
                        className="absolute left-0 top-1/2 h-0.5 bg-[#C6A85E] -z-10 transition-all duration-300"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep

                        return (
                            <div key={step.id} className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isActive || isCompleted
                                            ? "border-[#C6A85E] bg-[#C6A85E]/10 text-[#C6A85E]"
                                            : "border-white/10 bg-[#0B0F14] text-gray-500"
                                    )}
                                    // Make previously completed steps clickable
                                    onClick={() => isCompleted && !isSubmitting ? setCurrentStep(index) : null}
                                    style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-xs mt-2 font-medium transition-colors duration-300",
                                    isActive ? "text-[#C6A85E]" : "text-gray-500"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="bg-white/5 border-white/10 text-white overflow-hidden backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-[#C6A85E]/10">
                            <CurrentStepIcon className="w-6 h-6 text-[#C6A85E]" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
                            <CardDescription className="text-gray-400">
                                {steps[currentStep].description}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
                        {/* Step 1: Identity */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div className="flex justify-center mb-6">
                                    <CompanyLogoUpload
                                        userId={userId}
                                        currentLogoUrl={watch("logo_url")}
                                        onUploadSuccess={(url) => setValue("logo_url", url)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            placeholder="Acme Inc."
                                            className="bg-black/20"
                                            {...register("name")}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Company Slug <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/</span>
                                            <Input
                                                id="slug"
                                                placeholder="acme-inc"
                                                className="pl-6 bg-black/20"
                                                {...register("slug")}
                                                onChange={(e) => {
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                                    setValue("slug", val);
                                                }}
                                            />
                                        </div>
                                        {errors.slug && <p className="text-red-500 text-xs">{errors.slug.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tagline">Tagline</Label>
                                    <Input
                                        id="tagline"
                                        placeholder="Innovation for the future"
                                        className="bg-black/20"
                                        {...register("tagline")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Company Type <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(val: any) => setValue("type", val, { shouldValidate: true })}
                                        defaultValue={watch("type")}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                                            {[
                                                "Broadcaster",
                                                "Production / Post-prod",
                                                "Solution Provider",
                                                "Media Association",
                                                "Training Center"
                                            ].map(type => (
                                                <SelectItem key={type} value={type} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Activity */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="main_activity">Main Activity <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="main_activity"
                                        placeholder="e.g. Video Production, Broadcast Technology, etc."
                                        className="bg-black/20"
                                        {...register("main_activity")}
                                    />
                                    {errors.main_activity && <p className="text-red-500 text-xs">{errors.main_activity.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Company Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell us about your company..."
                                        className="bg-black/20 min-h-[150px]"
                                        {...register("description")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="website"
                                            placeholder="https://example.com"
                                            className="bg-black/20"
                                            {...register("website")}
                                        />
                                        {errors.website && <p className="text-red-500 text-xs">{errors.website.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contact_email">Contact Email</Label>
                                        <Input
                                            id="contact_email"
                                            type="email"
                                            placeholder="contact@example.com"
                                            className="bg-black/20"
                                            {...register("contact_email")}
                                        />
                                        {errors.contact_email && <p className="text-red-500 text-xs">{errors.contact_email.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            placeholder="+1 234 567 890"
                                            className="bg-black/20"
                                            {...register("phone")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">HQ Country <span className="text-red-500">*</span></Label>
                                        <CountrySelect
                                            value={watch("country")}
                                            onChange={(val) => setValue("country", val, { shouldValidate: true })}
                                        />
                                        {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Headquarters address..."
                                        className="bg-black/20"
                                        {...register("address")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 4: Social */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin_url">LinkedIn</Label>
                                        <Input
                                            id="linkedin_url"
                                            placeholder="https://linkedin.com/company/..."
                                            className="bg-black/20"
                                            {...register("linkedin_url")}
                                        />
                                        {errors.linkedin_url && <p className="text-red-500 text-xs">{errors.linkedin_url.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="x_url">X (Twitter)</Label>
                                        <Input
                                            id="x_url"
                                            placeholder="https://x.com/..."
                                            className="bg-black/20"
                                            {...register("x_url")}
                                        />
                                        {errors.x_url && <p className="text-red-500 text-xs">{errors.x_url.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="facebook_url">Facebook</Label>
                                        <Input
                                            id="facebook_url"
                                            placeholder="https://facebook.com/..."
                                            className="bg-black/20"
                                            {...register("facebook_url")}
                                        />
                                        {errors.facebook_url && <p className="text-red-500 text-xs">{errors.facebook_url.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instagram_url">Instagram</Label>
                                        <Input
                                            id="instagram_url"
                                            placeholder="https://instagram.com/..."
                                            className="bg-black/20"
                                            {...register("instagram_url")}
                                        />
                                        {errors.instagram_url && <p className="text-red-500 text-xs">{errors.instagram_url.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tiktok_url">TikTok</Label>
                                        <Input
                                            id="tiktok_url"
                                            placeholder="https://tiktok.com/@..."
                                            className="bg-black/20"
                                            {...register("tiktok_url")}
                                        />
                                        {errors.tiktok_url && <p className="text-red-500 text-xs">{errors.tiktok_url.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="youtube_url">YouTube</Label>
                                        <Input
                                            id="youtube_url"
                                            placeholder="https://youtube.com/@..."
                                            className="bg-black/20"
                                            {...register("youtube_url")}
                                        />
                                        {errors.youtube_url && <p className="text-red-500 text-xs">{errors.youtube_url.message}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0 || isSubmitting}
                            className="text-gray-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                            >
                                Next Step
                                <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                                className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold min-w-[120px]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    "Save & Finish"
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
