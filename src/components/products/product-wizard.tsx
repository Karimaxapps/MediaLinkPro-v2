'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { insertProductSchema, InsertProduct } from '@/features/products/schema';
import { createProduct } from '@/features/products/server/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PRODUCT_TYPES, MAIN_CATEGORIES, SUB_CATEGORIES } from '@/features/products/constants';
import { ChevronRight, ChevronLeft, Box, FileText, Image, Loader2, Video as VideoIcon, GraduationCap, Tag, CheckCircle, Check, X, Plus, Trash2, Save } from 'lucide-react';
import { cn } from "@/lib/utils";
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ProductMediaUpload } from './product-media-upload';
import { updateProduct } from '@/features/products/server/actions';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ProductWizardProps {
    organizations: { id: string; name: string; slug: string }[];
    userId: string; // Needed for image upload
    initialData?: any; // Existing product data
}

const steps = [
    {
        id: "basic",
        title: "Basic Info",
        description: "Product identity & classification",
        icon: Box
    },
    {
        id: "details",
        title: "Details",
        description: "Features & Specifications",
        icon: FileText
    },
    {
        id: "media",
        title: "Media",
        description: "Images & Screenshots",
        icon: Image
    },
    {
        id: "training",
        title: "Training",
        description: "Support & Resources",
        icon: GraduationCap
    },
    {
        id: "commercial",
        title: "Commercial",
        description: "Pricing & Availability",
        icon: Tag
    },
    {
        id: "review",
        title: "Review",
        description: "Recap & Publish",
        icon: CheckCircle
    }
];

export function ProductWizard({ organizations, userId, initialData }: ProductWizardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const router = useRouter();

    const defaultOrgId = organizations.length === 1 ? organizations[0].id : '';

    const form = useForm<InsertProduct>({
        resolver: zodResolver(insertProductSchema) as any,
        mode: "onChange",
        defaultValues: initialData ? {
            ...initialData,
            // Ensure array fields are handled
            gallery_urls: initialData.gallery_urls || [],
            training_video_urls: initialData.training_video_urls || [],
        } : {
            organization_id: defaultOrgId,
            name: '',
            slug: '',
            description: '',
            logo_url: '',
            is_public: true,
            // @ts-ignore
            product_type: undefined,
            // @ts-ignore
            main_category: undefined,
            sub_category: '',
            short_description: '',
            external_url: '',
            documentation_url: '',
            certification_url: '',
            gallery_urls: [],
            promo_video_url: '',
        },
    });

    const { trigger, watch, setValue, getValues, formState: { errors } } = form;
    const watchMainCategory = watch('main_category');
    const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

    useEffect(() => {
        if (watchMainCategory && SUB_CATEGORIES[watchMainCategory]) {
            setAvailableSubCategories(SUB_CATEGORIES[watchMainCategory]);
            // Only clear if the main category changed and it's not the initial load
            const currentSub = getValues('sub_category');
            if (currentSub && !SUB_CATEGORIES[watchMainCategory].includes(currentSub)) {
                setValue('sub_category', '');
            }
        } else {
            setAvailableSubCategories([]);
        }
    }, [watchMainCategory, setValue, getValues]);

    const [productId, setProductId] = useState<string | null>(initialData?.id || null);

    const nextStep = async () => {
        let fieldsToValidate: (keyof InsertProduct)[] = [];

        // Determine fields to validate based on current step
        if (currentStep === 0) {
            fieldsToValidate = ['name', 'slug', 'product_type', 'main_category', 'sub_category', 'short_description'];
        } else if (currentStep === 1) {
            fieldsToValidate = ['description', 'external_url', 'certification_url']; // documentation_url moved
        } else if (currentStep === 2) {
            fieldsToValidate = ['logo_url', 'gallery_urls', 'promo_video_url'];
        } else if (currentStep === 3) { // Training
            fieldsToValidate = ['support_url', 'documentation_url', 'course_url', 'training_video_urls'];
        } else if (currentStep === 4) { // Commercial
            fieldsToValidate = ['availability_status', 'price', 'pricing_model'];
        }

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            // Save on Next Logic
            setIsLoading(true);
            try {
                const formData = new FormData();
                const values = getValues();

                // Helper to append data
                Object.entries(values).forEach(([key, value]) => {
                    if (key === 'gallery_urls' || key === 'training_video_urls') {
                        if (Array.isArray(value)) {
                            value.forEach(v => formData.append(key, v));
                        }
                    } else if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                });

                let result;
                if (currentStep === 0 && !productId) {
                    // First step creation
                    result = await createProduct({}, formData);
                    if (result.success && result.data) {
                        setProductId(result.data.id);
                        toast.success("Draft created");
                        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                    } else {
                        toast.error(result.error || "Failed to save draft");
                    }
                } else {
                    // Subsequent steps update
                    if (!productId) {
                        toast.error("Error: No product ID found. Please restart.");
                        return;
                    }
                    result = await updateProduct(productId, formData);
                    if (result.success) {
                        // toast.success("Saved"); // Optional: minimize noise
                        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
                    } else {
                        toast.error(result.error || "Failed to save progress");
                    }
                }
            } catch (error) {
                console.error("Wizard Error:", error);
                toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    // Submit handler for the final step (Publish or Save Draft)
    const onFinalSubmit = async (status: 'draft' | 'published') => {
        if (!productId) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('status', status);

            const result = await updateProduct(productId, formData);

            if (result.success) {
                toast.success(status === 'published' ? "Product published successfully!" : "Draft saved successfully!");
                router.push(`/products/${getValues('slug')}`);
            } else {
                toast.error(result.error || "Failed to save product");
            }
        } catch (error) {
            console.error("Wizard Submit Error:", error);
            toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelClick = () => {
        setShowCancelDialog(true);
    };

    const handleSaveDraft = async () => {
        if (!productId) {
            // Logic to create draft if it doesn't exist? 
            // Step 0 creates it on Next. If we are on step 0 and want to save draft, we need to validate min fields (name, slug etc)
            // For now, let's assume we can only save draft if we have a productId or we trigger Step 0 creation.
            if (currentStep === 0) {
                // Trigger nextStep logic which creates the product
                // But we want to stay or exit? User said "save... and show status in listing", implying exit.
                // Let's try to reuse nextStep logic but with a flag? 
                // Or just validate step 0 fields manually.
                const isStepValid = await trigger(['name', 'slug', 'product_type', 'main_category']);
                if (!isStepValid) return; // Show errors
            }
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            const values = getValues();

            // Helper to append data (same as nextStep)
            Object.entries(values).forEach(([key, value]) => {
                if (key === 'gallery_urls' || key === 'training_video_urls') {
                    if (Array.isArray(value)) {
                        value.forEach(v => formData.append(key, v));
                    }
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });
            formData.append('status', 'draft');

            let result;
            if (!productId) {
                result = await createProduct({}, formData);
                if (result.success && result.data) {
                    setProductId(result.data.id);
                    toast.success("Draft saved successfully!");
                    // Redirect
                    router.push(`/companies/${organizations.find(o => o.id === values.organization_id)?.slug || 'dashboard'}/dashboard`);
                } else {
                    toast.error(result.error || "Failed to save draft");
                }
            } else {
                result = await updateProduct(productId, formData);
                if (result.success) {
                    toast.success("Draft saved successfully!");
                    // Redirect
                    const orgId = values.organization_id;
                    const org = organizations.find(o => o.id === orgId);
                    router.push(`/companies/${org?.slug || 'dashboard'}/dashboard`);
                } else {
                    toast.error(result.error || "Failed to save draft");
                }
            }
        } catch (error) {
            console.error("Save Draft Error:", error);
            toast.error("Failed to save draft");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmCancel = () => {
        const orgId = getValues('organization_id');
        const org = organizations.find(o => o.id === orgId);
        if (org) {
            router.push(`/companies/${org.slug}/dashboard`);
        } else {
            // Fallback if no org selected or found (shouldn't happen given the check at start)
            router.push('/dashboard');
        }
    };

    if (organizations.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500 text-white">
                <div className="flex justify-center">
                    <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Box className="h-12 w-12 text-red-500" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold">No Organizations Found</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        You need to be part of an organization to create a product.
                    </p>
                </div>
            </div>
        );
    }

    const CurrentStepIcon = steps[currentStep].icon;

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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold text-white">Add New Product</CardTitle>
                        <CardDescription className="text-gray-400">
                            Detailed information about your product
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        onClick={handleSaveDraft}
                        disabled={isLoading}
                        className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save as Draft
                    </Button>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Step 1: Basic Info */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                {/* Organization Selection (if multiple) */}
                                {organizations.length > 1 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="organization_id" className="text-gray-300">Organization</Label>
                                        <Select
                                            onValueChange={(value) => setValue("organization_id", value, { shouldValidate: true })}
                                            defaultValue={getValues("organization_id")}
                                        >
                                            <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                <SelectValue placeholder="Select Organization" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                                                {organizations.map((org) => (
                                                    <SelectItem key={org.id} value={org.id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                        {org.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.organization_id && (
                                            <p className="text-sm text-destructive">{errors.organization_id.message}</p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Product Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-gray-300">Product Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="name"
                                            {...form.register("name")}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                                            placeholder="e.g. MediaFlow Pro"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>

                                    {/* URL Slug */}
                                    <div className="space-y-2">
                                        <Label htmlFor="slug" className="text-gray-300">URL Slug <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/</span>
                                            <Input
                                                id="slug"
                                                {...form.register("slug")}
                                                className="pl-6 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                                                placeholder="e.g. mediaflow-pro"
                                                onChange={(e) => {
                                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                                    setValue("slug", val, { shouldValidate: true });
                                                }}
                                            />
                                        </div>
                                        {errors.slug && (
                                            <p className="text-sm text-red-500">{errors.slug.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Product Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="product_type" className="text-gray-300">Product Type <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(value: any) => setValue("product_type", value, { shouldValidate: true })}
                                        defaultValue={getValues("product_type")}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                            <SelectValue placeholder="Select Product Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                                            {PRODUCT_TYPES.map((type) => (
                                                <SelectItem key={type} value={type} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_type && (
                                        <p className="text-sm text-red-500">{errors.product_type.message}</p>
                                    )}
                                </div>

                                {/* Main Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="main_category" className="text-gray-300">Main Category <span className="text-red-500">*</span></Label>
                                    <Select
                                        onValueChange={(value: any) => setValue("main_category", value, { shouldValidate: true })}
                                        defaultValue={getValues("main_category")}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                            <SelectValue placeholder="Select Main Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1F26] border-white/10 text-white max-h-[300px]">
                                            {MAIN_CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.main_category && (
                                        <p className="text-sm text-red-500">{errors.main_category.message}</p>
                                    )}
                                </div>

                                {/* Sub Category */}
                                {watchMainCategory && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Label htmlFor="sub_category" className="text-gray-300">Sub Category</Label>
                                        {availableSubCategories.length > 0 ? (
                                            <Select
                                                onValueChange={(value) => setValue("sub_category", value, { shouldValidate: true })}
                                                value={watch("sub_category")}
                                            >
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                                    <SelectValue placeholder="Select Sub Category" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1A1F26] border-white/10 text-white max-h-[300px]">
                                                    {availableSubCategories.map((sub) => (
                                                        <SelectItem key={sub} value={sub} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                                            {sub}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Input
                                                id="sub_category"
                                                {...form.register("sub_category")}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                                                placeholder="Enter sub-category..."
                                            />
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Specific functional grouping inside the Main Category.
                                        </p>
                                        {errors.sub_category && (
                                            <p className="text-sm text-red-500">{errors.sub_category.message}</p>
                                        )}
                                    </div>
                                )}

                                {/* Short Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="short_description" className="text-gray-300">Short Description (max 150 chars)</Label>
                                    <Textarea
                                        id="short_description"
                                        {...form.register("short_description")}
                                        placeholder="Briefly describe your solution..."
                                        maxLength={150}
                                        className="h-24 resize-none bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#C6A85E] focus-visible:border-[#C6A85E]"
                                    />
                                    <div className="flex justify-end">
                                        <span className="text-xs text-muted-foreground">
                                            {watch("short_description")?.length || 0}/150
                                        </span>
                                    </div>
                                    {errors.short_description && (
                                        <p className="text-sm text-red-500">{errors.short_description.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="external_url" className="text-gray-300">Product External URL</Label>
                                    <Input
                                        id="external_url"
                                        {...form.register("external_url")}
                                        placeholder="https://your-product-site.com"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                    {errors.external_url && (
                                        <p className="text-sm text-red-500">{errors.external_url.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="documentation_url" className="text-gray-300">Documentation URL</Label>
                                    <Input
                                        id="documentation_url"
                                        {...form.register("documentation_url")}
                                        placeholder="https://docs.your-product.com"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                    {errors.external_url && (
                                        <p className="text-sm text-red-500">{errors.external_url.message}</p>
                                    )}
                                </div>

                                {/* Documentation URL removed from here */}

                                <div className="space-y-2">
                                    <Label htmlFor="certification_url" className="text-gray-300">Certification URL</Label>
                                    <Input
                                        id="certification_url"
                                        {...form.register("certification_url")}
                                        placeholder="https://certifications.com/your-product"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                    {errors.certification_url && (
                                        <p className="text-sm text-red-500">{errors.certification_url.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-gray-300">Full Description</Label>
                                    <RichTextEditor
                                        value={watch('description') || ''}
                                        onChange={(val) => setValue('description', val, { shouldValidate: true })}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">{errors.description.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Media */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <ProductMediaUpload
                                    userId={userId}
                                    organizationId={getValues('organization_id')}
                                    mainImageUrl={watch('logo_url')}
                                    galleryUrls={watch('gallery_urls')}
                                    onMainImageChange={(url) => setValue('logo_url', url, { shouldValidate: true })}
                                    onGalleryChange={(urls) => setValue('gallery_urls', urls, { shouldValidate: true })}
                                    mainImageError={errors.logo_url?.message}
                                    galleryError={errors.gallery_urls?.message}
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="promo_video_url" className="text-gray-300">Promo Video URL (YouTube)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                            <VideoIcon className="w-4 h-4" />
                                        </span>
                                        <Input
                                            id="promo_video_url"
                                            {...form.register("promo_video_url")}
                                            placeholder="https://youtube.com/watch?v=..."
                                            className="pl-10 bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                        />
                                    </div>
                                    {errors.promo_video_url && (
                                        <p className="text-sm text-red-500">{errors.promo_video_url.message}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Training & Support */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="support_url" className="text-gray-300">Support Portal URL</Label>
                                    <Input
                                        id="support_url"
                                        {...form.register("support_url")}
                                        placeholder="https://support.your-product.com"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="documentation_url" className="text-gray-300">Documentation URL</Label>
                                    <Input
                                        id="documentation_url"
                                        {...form.register("documentation_url")}
                                        placeholder="https://docs.your-product.com"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                    {errors.documentation_url && (
                                        <p className="text-sm text-red-500">{errors.documentation_url.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="course_url" className="text-gray-300">Training Course URL</Label>
                                    <Input
                                        id="course_url"
                                        {...form.register("course_url")}
                                        placeholder="https://academy.your-product.com"
                                        className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-300">Training Videos (Max 5)</Label>
                                    <div className="space-y-3">
                                        {(watch('training_video_urls') || []).map((url, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => {
                                                        const newUrls = [...(watch('training_video_urls') || [])];
                                                        newUrls[index] = e.target.value;
                                                        setValue('training_video_urls', newUrls, { shouldValidate: true });
                                                    }}
                                                    placeholder="https://youtube.com/..."
                                                    className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newUrls = (watch('training_video_urls') || []).filter((_, i) => i !== index);
                                                        setValue('training_video_urls', newUrls, { shouldValidate: true });
                                                    }}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(watch('training_video_urls') || []).length < 5 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const newUrls = [...(watch('training_video_urls') || []), ""];
                                                    setValue('training_video_urls', newUrls);
                                                }}
                                                className="border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/5"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Video URL
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Commercial */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="availability_status" className="text-gray-300">Availability Status</Label>
                                    <Select
                                        value={watch("availability_status")}
                                        onValueChange={(value: any) => setValue("availability_status", value, { shouldValidate: true })}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-[#C6A85E]">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Available', 'Pre-order', 'Discontinued'].map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4 rounded-lg border border-white/10 p-4 bg-white/5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="price_upon_request" className="text-gray-300 cursor-pointer">Price upon request</Label>
                                        <Switch
                                            id="price_upon_request"
                                            checked={watch('price_upon_request')}
                                            onCheckedChange={(checked) => {
                                                setValue('price_upon_request', checked);
                                                if (checked) {
                                                    setValue('price', undefined);
                                                }
                                            }}
                                        />
                                    </div>

                                    {!watch('price_upon_request') && (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="price" className="text-gray-300">Price</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="bg-black/20 border-white/10 text-white focus-visible:ring-[#C6A85E]"
                                                    value={watch('price') || ''}
                                                    onChange={(e) => setValue('price', parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="currency" className="text-gray-300">Currency</Label>
                                                <Select
                                                    value={watch("currency")}
                                                    onValueChange={(value) => setValue("currency", value)}
                                                >
                                                    <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-[#C6A85E]">
                                                        <SelectValue placeholder="USD" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD ($)</SelectItem>
                                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pricing_model" className="text-gray-300">Pricing Model</Label>
                                    <Select
                                        value={watch("pricing_model")}
                                        onValueChange={(value: any) => setValue("pricing_model", value)}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10 text-white focus:ring-[#C6A85E]">
                                            <SelectValue placeholder="Select pricing model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['One-time', 'Subscription', 'Rental', 'Custom Quote'].map(model => (
                                                <SelectItem key={model} value={model}>{model}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Step 6: Review & Publish */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#C6A85E]">Basic Info</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Name</span>
                                                <span className="text-white">{watch('name')}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Category</span>
                                                <span className="text-white">{watch('main_category')} / {watch('sub_category')}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Type</span>
                                                <span className="text-white">{watch('product_type')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#C6A85E]">Commercial</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Availability</span>
                                                <span className="text-white">{watch('availability_status') || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Price</span>
                                                <span className="text-white">
                                                    {watch('price_upon_request')
                                                        ? 'Upon Request'
                                                        : `${watch('price') || 0} ${watch('currency')}`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/10 pb-2">
                                                <span className="text-gray-400">Model</span>
                                                <span className="text-white">{watch('pricing_model') || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-4">
                                        <h3 className="text-lg font-semibold text-[#C6A85E]">Completeness Check</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Basic Info', valid: !!watch('name') && !!watch('main_category') },
                                                { label: 'Description', valid: !!watch('description') },
                                                { label: 'Media', valid: !!watch('logo_url') && (watch('gallery_urls') || []).length > 0 },
                                                { label: 'Support', valid: !!watch('support_url') || !!watch('documentation_url') }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 p-3 rounded bg-white/5 border border-white/10">
                                                    {item.valid ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                                                    )}
                                                    <span className={item.valid ? "text-white" : "text-gray-400"}>{item.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancelClick}
                                disabled={isLoading}
                                className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                                Cancel
                            </Button>


                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 0 || isLoading}
                                    className={cn(
                                        "font-semibold",
                                        currentStep === 0
                                            ? "opacity-50 cursor-not-allowed bg-[#C6A85E]/20 text-gray-500" // Disabled state
                                            : "bg-[#C6A85E] hover:bg-[#B5964A] text-black" // Enabled state
                                    )}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                {currentStep < steps.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={() => onFinalSubmit('published')}
                                            disabled={isLoading}
                                            className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                "Publish"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                title="Cancel Product Creation?"
                description="Are you sure you want to cancel? Any unsaved changes will be lost."
                confirmText="Yes, Cancel"
                cancelText="No, Keep Editing"
                variant="destructive"
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
}
