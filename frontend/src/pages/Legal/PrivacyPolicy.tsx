import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </button>

                <header className="mb-12 space-y-4 border-b pb-8">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Shield className="w-8 h-8" />
                        <span className="font-semibold tracking-wide uppercase text-sm">Legal Documentation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </header>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-12">

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <FileText className="w-5 h-5 text-primary" />
                            <h2>1. Introduction</h2>
                        </div>
                        <p>
                            Welcome to <strong>Tea Hack</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>https://tea-hack.onrender.com</strong> or use our services.
                        </p>
                        <p>
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <Eye className="w-5 h-5 text-primary" />
                            <h2>2. Information We Collect</h2>
                        </div>

                        <h3 className="text-lg font-medium mt-4">Personal Data</h3>
                        <p>
                            Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.
                        </p>

                        <h3 className="text-lg font-medium mt-4">Derivative Data</h3>
                        <p>
                            Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <Lock className="w-5 h-5 text-primary" />
                            <h2>3. Use of Your Information</h2>
                        </div>
                        <p>
                            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                            <li>Create and manage your account.</li>
                            <li>Compile anonymous statistical data and analysis for use internally or with third parties.</li>
                            <li>Email you regarding your account or order.</li>
                            <li>Enable user-to-user communications.</li>
                            <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                            <li>Increase the efficiency and operation of the Site.</li>
                            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">4. Disclosure of Your Information</h2>
                        <p>
                            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-card p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2">By Law or to Protect Rights</h3>
                                <p className="text-sm text-muted-foreground">If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</p>
                            </div>
                            <div className="bg-card p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2">Third-Party Service Providers</h3>
                                <p className="text-sm text-muted-foreground">We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">5. Security of Your Information</h2>
                        <p>
                            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground">6. Policy for Children</h2>
                        <p>
                            We do not knowingly solicit information from or market to children under the age of 13. If you become aware that any data we have collected is from children under age 13, please contact us using the contact information provided below.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <Mail className="w-5 h-5 text-primary" />
                            <h2>7. Contact Us</h2>
                        </div>
                        <p>
                            If you have questions or comments about this Privacy Policy, please contact us at:
                        </p>
                        <div className="bg-muted p-6 rounded-lg">
                            <p className="font-medium">Tea Hack Support</p>
                            <p>Email: support@tea-hack.onrender.com</p>
                        </div>
                    </section>
                </div>

                <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Tea Hack. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
