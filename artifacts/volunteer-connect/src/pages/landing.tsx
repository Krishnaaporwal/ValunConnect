import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HeartHandshake, Globe, Users, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between glass-panel sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-8 h-8 text-primary" />
          <span className="text-2xl font-display font-bold text-primary">VolunConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="font-semibold text-foreground hover:text-primary">Login</Button>
          </Link>
          <Link href="/auth">
            <Button className="rounded-full shadow-md shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Join 10,000+ changemakers
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
                Empowering communities, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">one volunteer at a time.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Connect with local events, build your portfolio, and make a real impact. Whether you're looking to help out or organize a cause, we make it effortless.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/auth?role=volunteer">
                  <Button size="lg" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:-translate-y-1 transition-all">
                    Join as Volunteer
                  </Button>
                </Link>
                <Link href="/auth?role=organizer">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full text-lg h-14 px-8 border-2 hover:-translate-y-1 transition-all">
                    Join as Organizer
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[3rem] transform rotate-3 scale-105 -z-10 blur-xl"></div>
              <img 
                src={`${import.meta.env.BASE_URL}images/hero.png`}
                alt="Volunteers working together" 
                className="rounded-[2rem] shadow-2xl object-cover w-full h-[500px] border border-white/50"
              />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">Why VolunteerConnect?</h2>
              <p className="text-muted-foreground">We bridge the gap between passionate individuals and organizations that need them.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Globe, title: "Smart Matching", desc: "Our algorithm matches your skills and location with the perfect opportunities." },
                { icon: Users, title: "Verified NGOs", desc: "Work with trusted, verified organizations making genuine impact." },
                { icon: TrendingUp, title: "Track Impact", desc: "Build a beautiful portfolio of your volunteer hours and certificates." },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl bg-secondary/30 border border-secondary hover:bg-secondary/50 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
