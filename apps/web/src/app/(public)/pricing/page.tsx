const tiers = [
  { key: "standard_pro", name: "Standard (Pro)", webSteps: 5, appSteps: 5, game: "No", threshold: "$0" },
  { key: "standard", name: "Standard", webSteps: 3, appSteps: 5, game: "No", threshold: "$0" },
  { key: "professional", name: "Professional", webSteps: 2, appSteps: 3, game: "No", threshold: "$0" },
  { key: "advanced", name: "Advanced", webSteps: 1, appSteps: 2, game: "No", threshold: "$0" },
];

export default function PricingPage() {
  return (
    <div className="container">
      <section className="card section">
        <h1>Pricing / Tier Rules</h1>
        <p className="muted">Choose the behavior profile that fits your traffic strategy.</p>

        <div className="table-wrap">
          <table className="tier-table">
            <thead>
              <tr>
                <th>Tier</th>
                <th>Web Steps</th>
                <th>App Steps</th>
                <th>Game Enabled</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier) => (
                <tr key={tier.key}>
                  <td>{tier.name}</td>
                  <td>{tier.webSteps}</td>
                  <td>{tier.appSteps}</td>
                  <td>{tier.game}</td>
                  <td>{tier.threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
