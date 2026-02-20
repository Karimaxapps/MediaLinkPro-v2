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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function EmailForm({ currentEmail }: { currentEmail?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateEmailSchema>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: {
            email: currentEmail || "",
        },
    })

    async function onSubmit(data: UpdateEmailSchema) {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('email', data.email);

            const result = await updateEmail({}, formData);

            if (result.success) {
                toast.success("Email updated successfully");
                router.refresh();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="name@example.com" {...field} className="bg-white/5 border-white/10 text-white" />
                            </FormControl>
                            <FormDescription>
                                This is the email associated with your account.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                    {isLoading ? "Updating..." : "Update Email"}
                </Button>
            </form>
        </Form>
    )
}
