import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { CTA } from "../components/CTA";

export function Landing() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/30">
            <Navbar />
            <Hero />
            <Features />
            <CTA />

            <footer className="py-8 text-center text-muted text-sm border-t border-white/5 mt-10">
                <p>&copy; {new Date().getFullYear()} Flourish. All rights reserved.</p>
            </footer>
        </div>
    );
}
