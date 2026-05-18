"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "An unexpected error occurred";
}

export function AuthTabs() {
    const [tab, setTab] = useState<"signup" | "login" | "forgotPassword">("signup");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    const t = useTranslations("auth");

    // Sign up state
    const [fullName, setFullName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Terms acceptance
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState("");

    const switchTab = (next: "signup" | "login" | "forgotPassword") => {
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
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signupPassword !== confirmPassword) {
            setError(t("passwordsMismatch"));
            return;
        }
        if (!termsAccepted) {
            setError(t("termsRequired"));
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
                setMessage(t("emailConfirm"));
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${location.origin}/auth/callback?next=/settings/security`,
            });
            if (resetError) { setError(resetError.message); return; }
            setMessage(t("resetEmailSent"));
            setForgotEmail("");
        } catch (err) {
            setError(getErrorMessage(err));
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

    return (
        <div className="space-y-8">
            {/* Tab Toggle */}
            {tab !== "forgotPassword" && (
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
                            {t("signUp")}
                        </button>
                        <button
                            onClick={() => switchTab("login")}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                                tab === "login"
                                    ? "bg-[#C6A85E] text-black shadow-md"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            {t("logIn")}
                        </button>
                    </div>
                </div>
            )}

            {/* Heading */}
            <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {tab === "signup" ? t("createAccount") : tab === "login" ? t("welcomeBack") : t("forgotPasswordTitle")}
                </h2>
                <p className="text-gray-500 text-sm">
                    {tab === "signup" ? t("joinNetwork") : tab === "login" ? t("signInAccount") : t("forgotPasswordDesc")}
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
                            placeholder={t("fullName")}
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
                            placeholder={t("enterEmail")}
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
                            placeholder={t("password")}
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
                            placeholder={t("confirmPassword")}
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

                    <div className="flex items-start gap-3 pt-1">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(v) => setTermsAccepted(v === true)}
                            className="mt-0.5 border-white/20 data-[state=checked]:bg-[#C6A85E] data-[state=checked]:border-[#C6A85E]"
                        />
                        <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer select-none">
                            {t("termsAcceptPrefix")}{" "}
                            <Link href="/terms" target="_blank" className="text-[#C6A85E] hover:underline">
                                {t("termsLink")}
                            </Link>
                            {" "}{t("termsAcceptAnd")}{" "}
                            <Link href="/privacy" target="_blank" className="text-[#C6A85E] hover:underline">
                                {t("privacyLink")}
                            </Link>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-bold text-sm rounded-xl mt-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("createBtn")}
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
                            placeholder={t("enterEmail")}
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
                            placeholder={t("password")}
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
                        <button
                            type="button"
                            onClick={() => switchTab("forgotPassword")}
                            className="text-xs text-[#C6A85E] hover:underline"
                        >
                            {t("forgotPassword")}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-bold text-sm rounded-xl transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("signInBtn")}
                    </Button>
                </form>
            )}

            {/* Forgot Password Form */}
            {tab === "forgotPassword" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            type="email"
                            placeholder={t("enterEmail")}
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-[#C6A85E]/50 focus:ring-0"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#C6A85E] hover:bg-[#B5964A] text-black font-bold text-sm rounded-xl transition-colors"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sendResetLink")}
                    </Button>
                </form>
            )}

            {/* Social Divider — hidden on forgot password view */}
            {tab !== "forgotPassword" && (
                <>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/8" />
                        <span className="text-gray-600 text-xs">{t("or")}</span>
                        <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {/* Social Buttons */}
                    <div className="flex items-center justify-center gap-4">
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
                    </div>
                </>
            )}

            {/* Switch tab hint */}
            <p className="text-center text-sm text-gray-600">
                {tab === "signup" ? (
                    <>{t("alreadyHaveAccount")}{" "}
                        <button onClick={() => switchTab("login")} className="text-[#C6A85E] hover:underline font-medium">
                            {t("logIn")}
                        </button>
                    </>
                ) : tab === "login" ? (
                    <>{t("dontHaveAccount")}{" "}
                        <button onClick={() => switchTab("signup")} className="text-[#C6A85E] hover:underline font-medium">
                            {t("signUp")}
                        </button>
                    </>
                ) : (
                    <button onClick={() => switchTab("login")} className="text-[#C6A85E] hover:underline font-medium">
                        {t("backToLogin")}
                    </button>
                )}
            </p>
        </div>
    );
}
