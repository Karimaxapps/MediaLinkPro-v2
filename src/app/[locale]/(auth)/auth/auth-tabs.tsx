"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export function AuthTabs() {
    const [tab, setTab] = useState<"signup" | "login">("signup");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Sign up state
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const switchTab = (next: "signup" | "login") => {
        setTab(next);
        setError(null);
        setMessage(null);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });
            if (authError) { setError(authError.message); return; }
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error: signUpError, data } = await supabase.auth.signUp({
                email: signupEmail,
                password: signupPassword,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                    data: { full_name: fullName },
                },
            });
            if (signUpError) { setError(signUpError.message); return; }
            if (data.user && data.session) {
                router.push("/onboarding");
                router.refresh();
            } else if (data.user && !data.session) {
                setMessage("Account created! Check your email to confirm your account.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${location.origin}/auth/callback` },
        });
    };

    const handleLinkedInAuth = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "linkedin_oidc",
            options: { redirectTo: `${location.origin}/auth/callback` },
        });
    };

    return (
        <div className="space-y-8">
            {/* Tab Toggle */}
            <div className="flex items-center justify-center">
                <div className="flex p-1 rounded-full bg-white/5 border border-white/8 gap-1">
                    <button
                        onClick={() => switchTab("signup")}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            tab === "signup"
                                ? "bg-[#C6A85E] text-black shadow-md"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Sign Up
                    </button>
                    <button
                        onClick={() => switchTab("login")}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                            tab === "login"
                                ? "bg-[#C6A85E] text-black shadow-md"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Log In
                    </button>
                </div>
            </div>

            {/* Heading */}
            <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {tab === "signup" ? "Create An Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-500 text-sm">
                    {tab === "signup"
                        ? "Join the media professional network"
                        : "Sign in to your MediaLinkPro account"}
                </p>
            </div>

            {/* Feedback */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm">
                    {message}
                </div>
            )}

            {/* Sign Up Form */}
            {tab === "signup" && (
                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Full Name */}
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="email"
                            placeholder="Enter Your Email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                            className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-bold text-sm rounded-xl mt-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create an Account"}
                    </Button>
                </form>
            )}

            {/* Log In Form */}
            {tab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="email"
                            placeholder="Enter Your Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            className="pl-10 pr-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>

                    <div className="text-right">
                        <span className="text-xs text-[#C6A85E] cursor-pointer hover:underline">
                            Forgot password?
                        </span>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-bold text-sm rounded-xl transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                </form>
            )}

            {/* Social Divider */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/8" />
                <span className="text-gray-600 text-xs">Or</span>
                <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Social Buttons */}
            <div className="flex items-center justify-center gap-4">
                {/* Google */}
                <button
                    onClick={handleGoogleAuth}
                    type="button"
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
                    aria-label="Continue with Google"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </button>

                {/* LinkedIn */}
                <button
                    onClick={handleLinkedInAuth}
                    type="button"
                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
                    aria-label="Continue with LinkedIn"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </button>

            </div>

            {/* Switch tab hint */}
            <p className="text-center text-sm text-gray-600">
                {tab === "signup" ? (
                    <>Already have an account?{" "}
                        <button onClick={() => switchTab("login")} className="text-[#C6A85E] hover:underline font-medium">
                            Log In
                        </button>
                    </>
                ) : (
                    <>Don&apos;t have an account?{" "}
                        <button onClick={() => switchTab("signup")} className="text-[#C6A85E] hover:underline font-medium">
                            Sign Up
                        </button>
                    </>
                )}
            </p>
        </div>
    );
}
