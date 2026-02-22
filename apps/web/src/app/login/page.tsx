import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/LoginForm";
import { SetupForm } from "@/components/forms/SetupForm";
import { adminMe, adminStatus } from "@/lib/api";

export default async function LoginPage() {
  // Parallelize API calls to reduce loading time
  const [authCheck, statusCheck] = await Promise.allSettled([
    adminMe(),
    adminStatus().catch(() => ({ initialized: true })), // Default to initialized if status check fails
  ]);

  // Check if user is already logged in
  if (authCheck.status === 'fulfilled') {
    redirect('/');
  }

  // Not authenticated, determine which form to show
  const status = statusCheck.status === 'fulfilled' ? statusCheck.value : { initialized: true };
  
  if (!status.initialized) {
    // Admin not initialized, show setup form
    return (
      <main className="container auth-shell">
        <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
          <SetupForm />
        </div>
      </main>
    );
  }
  
  // Admin is initialized, show login form
  return (
    <main className="container auth-shell">
      <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-6)" }}>
        <LoginForm />
      </div>
    </main>
  );
}
