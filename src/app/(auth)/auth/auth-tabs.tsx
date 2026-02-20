
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AuthTabs() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Login Form State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register Form State
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            // Successful login -> Middleware will handle profile check or redirect to /dashboard
            // But checking client-side is safer for UX redirect
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Check profile existence/completion (optional client-check)
                // For now, simple redirect to dashboard, dashboard page handles onboarding check
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error: signUpError, data } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (data.user && data.session) {
                // Determine if auto-login happened or email confirmation needed
                router.push("/onboarding"); // Direct to onboarding for new users
                router.refresh();
            } else if (data.user && !data.session) {
                setMessage("Registration successful! Please check your email to confirm your account.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#C6A85E] data-[state=active]:text-black">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN TAB */}
            <TabsContent value="login">
                <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter your credentials to access your dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-black/20 border-white/10 focus:border-[#C6A85E]/50 text-white placeholder:text-gray-600"
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <span className="text-xs text-[#C6A85E] cursor-pointer hover:underline">Forgot password?</span>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-black/20 border-white/10 focus:border-[#C6A85E]/50 text-white"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* REGISTER TAB */}
            <TabsContent value="register">
                <Card className="bg-white/5 border-white/10 backdrop-blur-md text-white">
                    <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription className="text-gray-400">
                            Enter your email below to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded text-sm">
                                {message}
                            </div>
                        )}
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="bg-black/20 border-white/10 focus:border-[#C6A85E]/50 text-white placeholder:text-gray-600"
                                    value={registerEmail}
                                    onChange={(e) => setRegisterEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <Input
                                    id="register-password"
                                    type="password"
                                    className="bg-black/20 border-white/10 focus:border-[#C6A85E]/50 text-white"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#C6A85E] hover:bg-[#B5964A] text-black font-semibold" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
