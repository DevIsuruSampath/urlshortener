const faqs = [
  {
    q: "How do you prevent bypass and bot farming?",
    a: "Flow steps are validated server-side: signed tokens, step order checks, minimum wait rules, and duplicate suppression using code + IP hash + user-agent hash.",
  },
  {
    q: "Can users skip from step 1 to step 3?",
    a: "No. The API enforces strict progression. If step order is invalid, the request is rejected.",
  },
  {
    q: "How long are session tokens valid?",
    a: "Session tokens expire automatically (default 15 minutes) to reduce replay abuse.",
  },
  {
    q: "Do you block risky destination URLs?",
    a: "Yes. Only http/https destinations are allowed. localhost/private/internal targets are blocked.",
  },
];

export default function FaqPage() {
  return (
    <div className="container">
      <section className="card section">
        <h1>FAQ</h1>
        <div className="faq-list">
          {faqs.map((item) => (
            <article key={item.q}>
              <h3>{item.q}</h3>
              <p className="muted">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
