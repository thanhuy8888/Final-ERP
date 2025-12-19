import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-col brand-col">
                        <Link to="/" className="footer-logo">CANIFA</Link>
                        <p className="footer-desc">
                            {t('home.footerSlogan') || 'Fashion for everyone. Discover the latest trends with high-quality materials.'}
                        </p>
                        <div className="social-icons">
                            <a href="#" aria-label="Facebook">📘</a>
                            <a href="#" aria-label="Instagram">📸</a>
                            <a href="#" aria-label="Youtube">🎥</a>
                            <a href="#" aria-label="Tiktok">🎵</a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h3>{t('footer.company') || 'Company'}</h3>
                        <ul>
                            <li><Link to="/">{t('footer.about') || 'About Us'}</Link></li>
                            <li><Link to="/">{t('footer.careers') || 'Careers'}</Link></li>
                            <li><Link to="/">{t('footer.stores') || 'Store Locator'}</Link></li>
                            <li><Link to="/">{t('footer.blog') || 'Fashion Blog'}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-col">
                        <h3>{t('footer.support') || 'Support'}</h3>
                        <ul>
                            <li><Link to="/">{t('footer.help') || 'Help Center'}</Link></li>
                            <li><Link to="/">{t('footer.returns') || 'Returns & Exchanges'}</Link></li>
                            <li><Link to="/">{t('footer.shipping') || 'Shipping Policy'}</Link></li>
                            <li><Link to="/orders">{t('home.myOrders')}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="footer-col newsletter-col">
                        <h3>{t('footer.newsletter') || 'Newsletter'}</h3>
                        <p>{t('footer.newsletterDesc') || 'Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.'}</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder={t('footer.emailPlaceholder') || 'Enter your email'} />
                            <button type="submit">Subscribe</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2024 CANIFA. All rights reserved.</p>
                    <div className="payment-icons">
                        <span>💳</span>
                        <span>💵</span>
                        <span>🏦</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
