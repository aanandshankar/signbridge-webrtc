"use client";

import { useActionState, useEffect, useState } from "react";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
// Using `window.location.search` inside a client `useEffect` avoids
// the CSR-bailout warnings with `useSearchParams` during prerender.

export default function Page() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [registered, setRegistered] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRegistered(params.get("registered"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[480px] bg-white border border-gray-200 rounded-lg p-10 md:p-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Login
          </h2>
          <p className="text-gray-600 mt-3 text-base">
            Welcome back. Enter your credentials to access the platform.
          </p>
        </div>

        {registered && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm">
            Registration successful! Please log in.
          </div>
        )}

        <form className="space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-gray-900 text-xs font-bold uppercase tracking-widest"
            >
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              className="h-12 bg-white border-gray-200 rounded-lg px-4 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label
                htmlFor="password"
                className="text-gray-900 text-xs font-bold uppercase tracking-widest"
              >
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-gray-600 hover:text-gray-900 transition-colors text-xs font-medium underline underline-offset-4"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white border-gray-200 rounded-lg px-4 text-base"
              required
            />
          </div>

          <div className="flex items-center gap-3 py-1">
            <Checkbox id="remember" className="rounded-sm" />
            <Label
              htmlFor="remember"
              className="text-gray-600 text-sm font-medium cursor-pointer select-none"
            >
              Keep me signed in
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-70"
          >
            {isPending ? "Signing In..." : "Sign In"}
          </Button>

          <div className="pt-8 mt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 font-medium text-sm">
              Don't have an account?
              <Link
                href="/register"
                className="text-gray-900 font-bold hover:underline ml-1"
              >
                Join now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
