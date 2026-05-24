"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
    request_type: z.enum(["demo", "quote"]),
    contact_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    contact_email: z.string().email({ message: "Please enter a valid email address." }),
    contact_phone: z.string().optional(),
    company_name: z.string().optional(),
    message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type RequestType = "demo" | "quote";

function defaultMessage(type: RequestType, productName: string): string {
    return type === "quote"
        ? `Hi, I'd like to request a quote for ${productName}. Please send pricing and availability details.`
        : `Hi, I'm interested in a demo of ${productName}. Please contact me to schedule a time.`;
}

interface RequestDemoDialogProps {
    productId: string;
    productName: string;
    organizationId: string;
    defaultRequestType?: RequestType;
    user?: {
        email?: string | null;
    } | null;
    userProfile?: {
        full_name?: string | null;
        company?: string | null;
    } | null;
    trigger?: ReactNode;
}

export function RequestDemoDialog({ productId, productName, organizationId, defaultRequestType = "demo", user, userProfile, trigger }: RequestDemoDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            request_type: defaultRequestType,
            contact_name: userProfile?.full_name || "",
            contact_email: user?.email || "",
            contact_phone: "",
            company_name: userProfile?.company || "",
            message: defaultMessage(defaultRequestType, productName),
        },
    });

    // Tracks the last auto-generated message so switching type only overwrites
    // the message when the user hasn't customized it themselves.
    const lastTemplate = useRef(defaultMessage(defaultRequestType, productName));

    function handleTypeChange(value: RequestType) {
        form.setValue("request_type", value);
        if (form.getValues("message") === lastTemplate.current) {
            const next = defaultMessage(value, productName);
            form.setValue("message", next);
            lastTemplate.current = next;
        }
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("product_id", productId);
            formData.append("organization_id", organizationId);
            formData.append("request_type", values.request_type);
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
                    style: {
                        background: 'var(--brand)',
                        color: 'black',
                        border: 'none',
                    },
                });
                setOpen(false);
                lastTemplate.current = defaultMessage(defaultRequestType, productName);
                form.reset();
            } else {
                toast.error("Error", {
                    description: result.error || "Failed to send request.",
                });
            }
        } catch {
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

    const selectedType = form.watch("request_type");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold">
                        Request Demo or Quote
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="bg-[#1F1F1F] border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request {selectedType === "quote" ? "a Quote" : "a Demo"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Fill out the form below to send your request for <span className="text-white font-medium">{productName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="request_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Request type <span className="text-red-500">*</span></FormLabel>
                                    <Select value={field.value} onValueChange={(v) => handleTypeChange(v as RequestType)}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[var(--brand)]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-[#1F1F1F] border-white/10 text-white">
                                            <SelectItem value="demo">Demo request</SelectItem>
                                            <SelectItem value="quote">Quote request</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contact_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} className="bg-white/5 border-white/10 text-white focus:border-[var(--brand)]" />
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
                                            <Input type="email" placeholder="john@example.com" {...field} className="bg-white/5 border-white/10 text-white focus:border-[var(--brand)]" />
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
                                            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} className="bg-white/5 border-white/10 text-white focus:border-[var(--brand)]" />
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
                                        <Input placeholder="Acme Inc." {...field} className="bg-white/5 border-white/10 text-white focus:border-[var(--brand)]" />
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
                                            className="resize-none bg-white/5 border-white/10 text-white focus:border-[var(--brand)] min-h-[100px]"
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
                            <Button type="submit" disabled={isSubmitting} className="bg-[var(--brand)] hover:bg-[#B5964A] text-black font-semibold">
                                {isSubmitting ? "Sending..." : "Send Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
