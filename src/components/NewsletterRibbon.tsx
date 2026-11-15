import React, { useState } from 'react';

export default function NewsletterRibbon(): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      alert('Thank you! You are subscribed to FieldShift seasonal agro-climatic advisories.');
      setEmail('');
    }
  };

  return (
    <section className="newsletter-ribbon-section">
      <div className="site-container newsletter-inner">
        <div className="newsletter-left">
          <div className="newsletter-leaf-icon">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
            </svg>
          </div>
          <div>
            <h3>Stay Updated with Seasonal Agro-Climatic Advisories</h3>
            <p>Subscribe to receive NASA POWER seasonal rainfall forecasts, sowing window alerts, and local extension tips.</p>
          </div>
        </div>
        <form className="newsletter-form" id="newsletterForm" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address…"
            required
            className="newsletter-input"
            aria-label="Email address for agro alerts"
          />
          <button type="submit" className="newsletter-btn">
            <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
