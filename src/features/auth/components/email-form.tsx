'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updateEmailSchema, UpdateEmailSchema } from "@/features/auth/schema"
import { updateEmail } from "@/features/auth/server/actions"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Info } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export function EmailForm({ currentEmail }: { currentEmail?: string }) {
    const t = useTranslations("settings");
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const form = useForm<UpdateEmailSchema>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: {
            newEmail: "",
        },
    })

    // Opening the confirmation dialog validates the new email first.
    async function handleUpdateClick() {
        const valid = await form.trigger("newEmail");
        if (valid) setConfirmOpen(true);
    }

    async function onConfirm() {
        const data = form.getValues();
        setConfirmOpen(false);
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('newEmail', data.newEmail);

            const result = await updateEmail({}, formData);

            if (result.success) {
                toast.success(result.message ?? t("emailChangeRequested"));
                router.push("/login");
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error(t("emailChangeError"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <FormItem>
                    <Label className="text-white">{t("currentEmail")}</Label>
                    <Input
                        value={currentEmail ?? ""}
                        readOnly
                        disabled
                        className="bg-white/5 border-white/10 text-gray-400"
                    />
                </FormItem>

                <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">{t("newEmail")}</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} className="bg-white/5 border-white/10 text-white" />
                            </FormControl>
                            <FormDescription>
                                {t("newEmailDesc")}
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-start gap-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-gray-400">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--brand)]" />
                    <p>{t("emailChangeNote")}</p>
                </div>

                <Button
                    type="button"
                    onClick={handleUpdateClick}
                    disabled={isLoading}
                    className="bg-[var(--brand)] text-black hover:bg-[#B5964A]"
                >
                    {isLoading ? t("updating") : t("updateEmail")}
                </Button>
            </form>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("emailChangeConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("emailChangeConfirmDesc", { email: form.getValues("newEmail") })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirm}>
                            {t("emailChangeConfirmAction")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Form>
    )
}
