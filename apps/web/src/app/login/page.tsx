import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { adminMe } from "@/lib/api";

export default async function LoginPage() {
  // Check if user is already logged in
  try {
    await adminMe();
    // User is authenticated, redirect to admin dashboard
    redirect('/');
  } catch (error) {
    // Not authenticated, show login form
    return (
      <main className="container auth-shell">
        <AuthForm />
      </main>
    );
  }
}
