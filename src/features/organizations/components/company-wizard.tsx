"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
// Replaced framer-motion with simple conditional rendering and CSS transitions
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Building2,
  FileText,
  Phone,
  Share2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import Image from "@/components/ui/safe-image";
import type { ExhibitorEvent } from "@/features/events/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CountrySelect } from "@/components/ui/country-select";
import { CompanyLogoUpload } from "./company-logo-upload";
import { MainActivitySelect } from "./main-activity-select";
import {
  companyWizardSchema,
  type CompanyWizardValues,
  ORG_TYPES,
  BROADCASTER_TYPES,
  BROADCASTER_GENRES,
} from "../schema";
import { createCompanyWizardAction } from "../server/actions";
import { CompanyAutofillBanner } from "./company-autofill-banner";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "identity",
    titleKey: "form.stepIdentityTitle",
    descKey: "form.stepIdentityDesc",
    icon: Building2,
  },
  {
    id: "activity",
    titleKey: "form.stepActivityTitle",
    descKey: "form.stepActivityDesc",
    icon: FileText,
  },
  {
    id: "contact",
    titleKey: "form.stepContactTitle",
    descKey: "form.stepContactDesc",
    icon: Phone,
  },
  {
    id: "social",
    titleKey: "form.stepSocialTitle",
    descKey: "form.stepSocialDesc",
    icon: Share2,
  },
  {
    id: "events",
    titleKey: "form.stepEventsTitle",
    descKey: "form.stepEventsDesc",
    icon: CalendarDays,
  },
] as const;

export function CompanyWizard({
  userId,
  exhibitableEvents = [],
}: {
  userId: string;
  exhibitableEvents?: ExhibitorEvent[];
}) {
  const t = useTranslations("companies");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [completed, setCompleted] = React.useState(false); // Success state
  const [autofillDismissed, setAutofillDismissed] = React.useState(false);
  const router = useRouter();

  const form = useForm<CompanyWizardValues>({
    resolver: zodResolver(companyWizardSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      logo_url: "",
      tagline: "",
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
      youtube_url: "",
      exhibitEventIds: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = form;

  // Watch values for preview or conditional logic if needed
  const companyName = watch("name");

  const nextStep = async () => {
    let fieldsToValidate: (keyof CompanyWizardValues)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["name", "slug", "type"];
        break;
      case 1:
        fieldsToValidate = ["main_activity"];
        break;
      case 2:
        fieldsToValidate = ["website", "country", "contact_email"];
        break;
      // Step 3 (social) validation handled on submit
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAutofillImport = (data: Partial<CompanyWizardValues>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value) setValue(key as keyof CompanyWizardValues, value as string);
    });
    // Auto-derive slug from website domain only if slug is still empty
    if (!watch("slug") && data.website) {
      try {
        const domain = new URL(data.website).hostname.replace(/^www\./, "");
        const autoSlug = domain.split(".")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
        setValue("slug", autoSlug);
      } catch {
        // ignore invalid URL
      }
    }
  };

  const onSubmit = async (data: CompanyWizardValues) => {
    setIsSubmitting(true);
    try {
      const result = await createCompanyWizardAction(data);

      if (result.success) {
        setCompleted(true);
        toast.success(result.message);
      } else {
        toast.error(result.error || t("form.failedCreate"));
      }
    } catch (error) {
      toast.error(t("form.unexpectedError"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500 text-white">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{t("form.welcomeName", { name: companyName })}</h2>
          <p className="text-gray-400 max-w-md mx-auto">{t("form.profileCreatedDesc")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold"
            onClick={() => router.push(`/companies/${watch("slug")}`)}
          >
            {t("form.goToProfile")}
          </Button>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => router.push(`/companies/${watch("slug")}/products/new`)}
          >
            {t("form.addFirstProduct")}
          </Button>
        </div>
      </div>
    );
  }

  const CurrentStepIcon = steps[currentStep].icon;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Auto-fill banner — visible on step 1 until dismissed or after import */}
      {currentStep === 0 && !autofillDismissed && (
        <CompanyAutofillBanner
          onImport={(data) => handleAutofillImport(data)}
          onDismiss={() => setAutofillDismissed(true)}
        />
      )}

      {/* Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10" />
          <div
            className="absolute left-0 top-1/2 h-0.5 bg-[var(--brand)] -z-10 transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive || isCompleted
                      ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                      : "border-white/10 bg-[#0B0F14] text-gray-500"
                  )}
                  // Make previously completed steps clickable
                  onClick={() => (isCompleted && !isSubmitting ? setCurrentStep(index) : null)}
                  style={{ cursor: isCompleted ? "pointer" : "default" }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium transition-colors duration-300",
                    isActive ? "text-[var(--brand)]" : "text-gray-500"
                  )}
                >
                  {t(step.titleKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 text-white overflow-hidden backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[var(--brand)]/10">
              <CurrentStepIcon className="w-6 h-6 text-[var(--brand)]" />
            </div>
            <div>
              <CardTitle className="text-xl">{t(steps[currentStep].titleKey)}</CardTitle>
              <CardDescription className="text-gray-400">
                {t(steps[currentStep].descKey)}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"
            key={currentStep}
          >
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
                    <Label htmlFor="name">
                      {t("form.companyName")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder={t("form.namePlaceholder")}
                      className="bg-black/20"
                      {...register("name")}
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      {t("form.companySlug")} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        /
                      </span>
                      <Input
                        id="slug"
                        placeholder={t("form.slugPlaceholder")}
                        className="pl-6 bg-black/20"
                        {...register("slug")}
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                          setValue("slug", val);
                        }}
                      />
                    </div>
                    {errors.slug && <p className="text-red-500 text-xs">{errors.slug.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">{t("form.tagline")}</Label>
                  <Input
                    id="tagline"
                    placeholder={t("form.taglinePlaceholder")}
                    className="bg-black/20"
                    {...register("tagline")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    {t("form.companyType")} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(val: string) => {
                      setValue("type", val as (typeof ORG_TYPES)[number], { shouldValidate: true });
                      // Clear broadcaster-only fields when switching away
                      if (val !== "Broadcaster") {
                        setValue("broadcaster_type", undefined);
                        setValue("broadcaster_genre", undefined);
                      }
                    }}
                    defaultValue={watch("type")}
                  >
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder={t("form.selectType")} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                      {ORG_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="focus:bg-white/10 focus:text-white cursor-pointer"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type.message}</p>}
                </div>

                {/* Broadcaster sub-type — shown only when type = Broadcaster */}
                {watch("type") === "Broadcaster" && (
                  <div className="space-y-2">
                    <Label htmlFor="broadcaster_type">
                      {t("form.broadcasterType")} <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={(val: string) =>
                        setValue("broadcaster_type", val as (typeof BROADCASTER_TYPES)[number], {
                          shouldValidate: true,
                        })
                      }
                      defaultValue={watch("broadcaster_type")}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder={t("form.televisionOrRadio")} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                        {BROADCASTER_TYPES.map((bt) => (
                          <SelectItem
                            key={bt}
                            value={bt}
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                          >
                            {bt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.broadcaster_type && (
                      <p className="text-red-500 text-xs">{errors.broadcaster_type.message}</p>
                    )}
                  </div>
                )}

                {/* Broadcaster genre — shown only when type = Broadcaster */}
                {watch("type") === "Broadcaster" && (
                  <div className="space-y-2">
                    <Label htmlFor="broadcaster_genre">{t("form.genre")}</Label>
                    <Select
                      onValueChange={(val: string) =>
                        setValue("broadcaster_genre", val as (typeof BROADCASTER_GENRES)[number], {
                          shouldValidate: true,
                        })
                      }
                      defaultValue={watch("broadcaster_genre")}
                    >
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder={t("form.genrePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F26] border-white/10 text-white">
                        {BROADCASTER_GENRES.map((g) => (
                          <SelectItem
                            key={g}
                            value={g}
                            className="focus:bg-white/10 focus:text-white cursor-pointer"
                          >
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.broadcaster_genre && (
                      <p className="text-red-500 text-xs">{errors.broadcaster_genre.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Activity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="main_activity">
                    {t("form.mainActivity")} <span className="text-red-500">*</span>
                  </Label>
                  <MainActivitySelect
                    orgType={watch("type")}
                    value={watch("main_activity")}
                    onChange={(v) => setValue("main_activity", v, { shouldValidate: true })}
                    triggerClassName="bg-black/20 border-white/10"
                    contentClassName="bg-[#1A1F26] border-white/10 text-white"
                    itemClassName="focus:bg-white/10 focus:text-white cursor-pointer"
                    inputClassName="bg-black/20"
                  />
                  {errors.main_activity && (
                    <p className="text-red-500 text-xs">{errors.main_activity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("form.companyDescription")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("form.describeCompanyPlaceholder")}
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
                    <Label htmlFor="website">
                      {t("form.website")} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="website"
                      placeholder={t("form.websitePlaceholderEx")}
                      className="bg-black/20"
                      {...register("website")}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs">{errors.website.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">{t("form.contactEmail")}</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder={t("form.emailPlaceholder")}
                      className="bg-black/20"
                      {...register("contact_email")}
                    />
                    {errors.contact_email && (
                      <p className="text-red-500 text-xs">{errors.contact_email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("form.phone")}</Label>
                    <Input
                      id="phone"
                      placeholder={t("form.phonePlaceholderWizard")}
                      className="bg-black/20"
                      {...register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      {t("form.hqCountry")} <span className="text-red-500">*</span>
                    </Label>
                    <CountrySelect
                      value={watch("country")}
                      onChange={(val) => setValue("country", val, { shouldValidate: true })}
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs">{errors.country.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("form.address")}</Label>
                  <Textarea
                    id="address"
                    placeholder={t("form.addressPlaceholder")}
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
                    <Label htmlFor="linkedin_url">{t("form.linkedin")}</Label>
                    <Input
                      id="linkedin_url"
                      placeholder={t("form.linkedinPlaceholder")}
                      className="bg-black/20"
                      {...register("linkedin_url")}
                    />
                    {errors.linkedin_url && (
                      <p className="text-red-500 text-xs">{errors.linkedin_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="x_url">{t("form.xTwitter")}</Label>
                    <Input
                      id="x_url"
                      placeholder={t("form.xPlaceholder")}
                      className="bg-black/20"
                      {...register("x_url")}
                    />
                    {errors.x_url && <p className="text-red-500 text-xs">{errors.x_url.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook_url">{t("form.facebook")}</Label>
                    <Input
                      id="facebook_url"
                      placeholder={t("form.facebookPlaceholder")}
                      className="bg-black/20"
                      {...register("facebook_url")}
                    />
                    {errors.facebook_url && (
                      <p className="text-red-500 text-xs">{errors.facebook_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">{t("form.instagram")}</Label>
                    <Input
                      id="instagram_url"
                      placeholder={t("form.instagramPlaceholder")}
                      className="bg-black/20"
                      {...register("instagram_url")}
                    />
                    {errors.instagram_url && (
                      <p className="text-red-500 text-xs">{errors.instagram_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktok_url">{t("form.tiktok")}</Label>
                    <Input
                      id="tiktok_url"
                      placeholder={t("form.tiktokPlaceholder")}
                      className="bg-black/20"
                      {...register("tiktok_url")}
                    />
                    {errors.tiktok_url && (
                      <p className="text-red-500 text-xs">{errors.tiktok_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube_url">{t("form.youtube")}</Label>
                    <Input
                      id="youtube_url"
                      placeholder={t("form.youtubePlaceholder")}
                      className="bg-black/20"
                      {...register("youtube_url")}
                    />
                    {errors.youtube_url && (
                      <p className="text-red-500 text-xs">{errors.youtube_url.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Events / Exhibiting */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {exhibitableEvents.length === 0 ? (
                  <p className="text-sm text-gray-400">{t("form.noEventsAvailable")}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">{t("form.eventsHelp")}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {exhibitableEvents.map((ev) => {
                        const selected = (watch("exhibitEventIds") ?? []).includes(ev.id);
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => {
                              const current = watch("exhibitEventIds") ?? [];
                              setValue(
                                "exhibitEventIds",
                                selected
                                  ? current.filter((id) => id !== ev.id)
                                  : [...current, ev.id]
                              );
                            }}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                              selected
                                ? "border-[var(--brand)] bg-[var(--brand)]/10"
                                : "border-white/10 bg-black/20 hover:border-white/30"
                            )}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/5">
                              {ev.logo_url ? (
                                <Image
                                  src={ev.logo_url}
                                  alt={ev.title}
                                  width={40}
                                  height={40}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <CalendarDays className="h-5 w-5 text-gray-500" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                              {ev.title}
                            </span>
                            {selected && (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--brand)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
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
              {t("form.back")}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold"
              >
                {t("form.nextStep")}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("form.saveFinish")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
