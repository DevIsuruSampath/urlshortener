import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/LoginForm";
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
        <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
          <LoginForm 
            onSuccess={() => {
              window.location.href = '/';
            }}
          />
        </div>
      </main>
    );
  }
}
