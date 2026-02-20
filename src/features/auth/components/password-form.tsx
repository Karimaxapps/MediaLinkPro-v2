'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { updatePasswordSchema, UpdatePasswordSchema } from "@/features/auth/schema"
import { updatePassword } from "@/features/auth/server/actions"
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

export function PasswordForm() {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdatePasswordSchema>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: UpdatePasswordSchema) {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('password', data.password);
            formData.append('confirmPassword', data.confirmPassword);

            const result = await updatePassword({}, formData);

            if (result.success) {
                toast.success("Password updated successfully");
                form.reset();
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
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">New Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} className="bg-white/5 border-white/10 text-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-white">Confirm Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" {...field} className="bg-white/5 border-white/10 text-white" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} className="bg-[#C6A85E] text-black hover:bg-[#B5964A]">
                    {isLoading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </Form>
    )
}
