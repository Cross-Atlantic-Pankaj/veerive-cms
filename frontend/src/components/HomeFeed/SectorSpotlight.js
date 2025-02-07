import React from 'react';
import '../../html/css/SectorSpotlight.css';

export default function SectorSpotlight () {
    return (
        <div>
            <header className="header">Bloomberg Businessweek</header>

            <main>
                <div className="main-article">
                    <img src="/placeholder.svg?height=400&width=600" alt="Train on viaduct in mountainous landscape" className="main-image" />
                    <div className="main-content">
                        <h1 className="main-title">Who Thinks China's Not an Economic Powerhouse? China</h1>
                        <p className="main-subtitle">One of the hottest topics at the upcoming global climate conference is whether China should still be considered "developing."</p>
                        <p className="author">By Dan Murtaugh, John Ainger and Alfred Cang</p>
                    </div>
                </div>

                <aside className="sidebar">
                    <img src="/placeholder.svg?height=200&width=150" alt="Bloomberg Businessweek magazine cover" className="sidebar-image" />
                    <h2 className="sidebar-title">More from this issue:</h2>
                    <ul>
                        <li>BYD Is Winning the Global Race to Make Cheaper EVs</li>
                        <li>How Starbucks Became a Sugary Teen Emporium</li>
                        <li>A Fentanyl Vaccine Is a Long Shot That Just Might Work</li>
                    </ul>
                </aside>

                <div className="secondary-article">
                    <img src="/placeholder.svg?height=150&width=150" alt="Glowing cube" className="secondary-image" />
                    <div className="secondary-content">
                        <h2 className="secondary-title">Sam Altman's Energy 'New Deal' Is Good for AI. What About Americans?</h2>
                        <p>OpenAI's founder is asking Washington to spend hundreds of billions of dollars on new power plants. Society needs to see the benefit, too.</p>
                    </div>
                </div>

                <div className="additional-articles">
                    <div className="article-snippet">
                        <h3 className="snippet-title">Not Picking Sides Is Paying Off for These Countries</h3>
                        <p>More than 100 nations are embracing a new kind of geopolitical neutrality. For many, it's working.</p>
                    </div>
                    <div className="article-snippet">
                        <h3 className="snippet-title">Elon Musk Is the Democrats' New Supervillain</h3>
                        <p>The MAGA-friendly CEO is now a central target for the opposition to Trump.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

