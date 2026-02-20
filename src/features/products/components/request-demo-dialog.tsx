"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createDemoRequest } from "@/features/requests/server/actions";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    contact_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    contact_email: z.string().email({ message: "Please enter a valid email address." }),
    contact_phone: z.string().optional(),
    company_name: z.string().optional(),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

interface RequestDemoDialogProps {
    productId: string;
    productName: string;
    organizationId: string;
    user?: any;
    userProfile?: any;
    trigger?: React.ReactNode;
}

export function RequestDemoDialog({ productId, productName, organizationId, user, userProfile, trigger }: RequestDemoDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            contact_name: userProfile?.full_name || "",
            contact_email: user?.email || "",
            contact_phone: "",
            company_name: userProfile?.company || "",
            message: `Hi, I'm interested in a demo of ${productName}. Please contact me to schedule a time.`,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("product_id", productId);
            formData.append("organization_id", organizationId);
            formData.append("contact_name", values.contact_name);
            formData.append("contact_email", values.contact_email);
            if (values.contact_phone) formData.append("contact_phone", values.contact_phone);
            if (values.company_name) formData.append("company_name", values.company_name);
            formData.append("message", values.message);

            // Pass initial state manually as first argument since we aren't using useActionState directly here
            // or we adapt our server action to be callable directly
            const result = await createDemoRequest({ message: '', error: '', success: false }, formData);

            if (result.success) {
                toast.success("Request Sent", {
                    description: result.message,
                });
                setOpen(false);
                form.reset();
            } else {
                toast.error("Error", {
                    description: result.error || "Failed to send request.",
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return trigger ? <>{trigger}</> : null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold">
                        Request Demo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request a Demo</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Fill out the form below to request a demo for <span className="text-white font-medium">{productName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="contact_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 text-white focus:border-[#C6A85E]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contact_email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Email <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 text-white focus:border-[#C6A85E]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact_phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Phone</FormLabel>
                                        <FormControl>
                                            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} className="bg-white/5 border-white/10 text-white focus:border-[#C6A85E]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." {...field} className="bg-white/5 border-white/10 text-white focus:border-[#C6A85E]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Message <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about your needs..."
                                            className="resize-none bg-white/5 border-white/10 text-white focus:border-[#C6A85E] min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold">
                                {isSubmitting ? "Sending..." : "Send Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
