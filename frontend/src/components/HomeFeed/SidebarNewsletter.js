import React from 'react';
import '../../html/css/sidebar.css'; // Import the centralized styles

export default function SidebarNewsletter() {
    return (
        <div className="news-briefing">
            <div className="greeting">
                👋 Good afternoon.
            </div>
            <div className="news">
                Elon Musk adds <u>nearly $34 billion</u> to his net worth as Tesla shares surge. Chinese President Xi Jinping's boldest economic stimulus since the pandemic <u>fails to impress</u> global luminaries gathered in Washington. And London firms are <u>reporting a surge</u> in bullying and harassment.
            </div>
            <div className="cta-box">
                <div className="cta-title">Want to see more here?</div>
                <div className="cta-description">Get customized recommendations and briefings at the right times for you.</div>
                <div className="button-container">
                    <button className="button create-account">Create account</button>
                    <button className="button sign-in">Sign in</button>
                </div>
            </div>
        </div>
    );
}
