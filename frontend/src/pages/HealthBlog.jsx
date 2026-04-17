import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Heart, Activity, Coffee, Moon, Sun, Apple } from 'lucide-react';
import './HealthBlog.css';

const HealthBlog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const articles = [
    {
      id: 1,
      title: "10 Essential Habits for a Healthy Heart",
      category: "Cardiology",
      icon: Heart,
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1505506874110-6a7a4c9897bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "Your heart works tirelessly every second of your life. Discover the top 10 daily habits that cardiologists recommend to keep it beating strong for decades to come."
    },
    {
      id: 2,
      title: "The Science of Sleep: Optimizing Your Rest",
      category: "Wellness",
      icon: Moon,
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "A good night's sleep is the foundation of physical and mental health. Learn how to optimize your circadian rhythm and bedroom environment for perfect rest."
    },
    {
      id: 3,
      title: "Superfoods: What Actually Works?",
      category: "Nutrition",
      icon: Apple,
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "Cut through the marketing noise and discover which nutrient-dense foods actually live up to the 'superfood' title according to clinical dietitians."
    },
    {
      id: 4,
      title: "Managing Stress in a High-Speed World",
      category: "Mental Health",
      icon: Activity,
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "Chronic stress is the silent killer of the modern age. Explore science-backed mindfulness techniques and lifestyle changes to lower cortisol levels naturally."
    },
    {
      id: 5,
      title: "Morning Routines of Healthy Individuals",
      category: "Lifestyle",
      icon: Sun,
      readTime: "3 min read",
      image: "https://images.unsplash.com/photo-1506126279646-a697353d3166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "How you start your morning dictates the rest of your day. See how combining hydration, light exercise, and meditation can transform your daily energy."
    },
    {
      id: 6,
      title: "The Truth About Caffeine Intake",
      category: "Nutrition",
      icon: Coffee,
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      excerpt: "Is coffee a health tonic or a harmful addiction? We break down the latest clinical studies on caffeine metabolism and its long-term effects on the brain."
    }
  ];

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="blog-root">
      {/* Navbar */}
      <nav className="blog-nav">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="landing-nav-logo">
            <div className="nav-logo-icon"><Heart size={20} /></div>
            <span className="nav-logo-text">MediCare <span>Blog</span></span>
          </div>
        </div>
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search health tips..." 
            className="blog-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </nav>

      {/* Header */}
      <header className="blog-header">
        <h1>Health Tips & Tricks</h1>
        <p>Discover the latest insights, clinical advice, and wellness strategies from top medical professionals.</p>
      </header>

      {/* Blog Grid */}
      <main className="blog-main">
        {filteredArticles.length === 0 ? (
          <div className="no-results">
            <h2>No articles found</h2>
            <p>Try searching for something else like "Sleep" or "Heart".</p>
          </div>
        ) : (
          <div className="blog-grid">
            {filteredArticles.map(article => {
              const Icon = article.icon;
              return (
                <article key={article.id} className="blog-card animate-fade-in">
                  <div className="blog-card-image">
                    <img src={article.image} alt={article.title} />
                    <span className="blog-category">
                      <Icon size={14} /> {article.category}
                    </span>
                  </div>
                  <div className="blog-card-content">
                    <span className="blog-read-time">{article.readTime}</span>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <button className="read-more-btn">Read Article</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="blog-footer">
        <p>© 2026 MediCare Pro. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HealthBlog;
