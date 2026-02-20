import Link from "next/link";

const PROJECT_NAME = process.env.NEXT_PUBLIC_PROJECT_NAME || "PaidLink";

export default function LandingPage() {
  return (
    <div className="container landing" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <section className="hero card">
        <p className="eyebrow">{PROJECT_NAME}</p>
        <h1>We are currently under maintenance.</h1>
        <p className="muted">
          Our platform is undergoing scheduled improvements. Please check back later.
        </p>
        
        {/* Hidden/Subtle Admin Login for Owner */}
        <div style={{ marginTop: 40, opacity: 0.5 }}>
          <a href="https://admin.example.com/login" className="btn btn-ghost btn-sm">
            Admin Login
          </a>
        </div>
      </section>
    </div>
  );
}
