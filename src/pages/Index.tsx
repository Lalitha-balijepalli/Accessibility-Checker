import { motion } from 'framer-motion';
import { 
  Accessibility, 
  CheckCircle2, 
  Zap, 
  FileText, 
  Shield, 
  Code,
  ArrowRight,
  Globe,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'WCAG Compliance',
    description: 'Comprehensive checks against WCAG 2.1 guidelines covering levels A, AA, and AAA.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Fixes',
    description: 'Get intelligent suggestions and code snippets to resolve accessibility issues quickly.',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Scan any website in seconds and receive detailed reports on accessibility barriers.',
  },
  {
    icon: FileText,
    title: 'Exportable Reports',
    description: 'Download comprehensive PDF reports to share with your team or stakeholders.',
  },
  {
    icon: Code,
    title: 'Developer Friendly',
    description: 'Code-level suggestions with before/after snippets for easy implementation.',
  },
  {
    icon: Globe,
    title: 'Universal Design',
    description: 'Build websites that work for everyone, regardless of ability or device.',
  },
];

const stats = [
  { value: '15%', label: 'of users have disabilities' },
  { value: '98%', label: 'of websites have issues' },
  { value: '100%', label: 'should be accessible' },
];

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-accent/50 to-background py-20 lg:py-32">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          </div>
          
          <div className="container relative">
            <motion.div 
              className="max-w-3xl mx-auto text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Accessibility className="h-4 w-4" />
                AI-Powered Accessibility Checker
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Build an{' '}
                <span className="bg-clip-text text-transparent gradient-hero">
                  Inclusive Web
                </span>{' '}
                for Everyone
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Automatically detect accessibility barriers and get AI-powered recommendations 
                to make your websites WCAG compliant and usable by all.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="h-12 px-8 text-base font-semibold gradient-hero hover:opacity-90">
                  <Link to="/dashboard">
                    Start Free Scan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
                  <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer">
                    Learn About WCAG
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-28">
          <div className="container">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need for Accessible Websites
              </h2>
              <p className="text-lg text-muted-foreground">
                Comprehensive tools to identify, understand, and fix accessibility issues
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full card-shadow hover:shadow-card-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6 space-y-4">
                      <div className="h-12 w-12 rounded-xl gradient-hero flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 lg:py-28 bg-muted/50">
          <div className="container">
            <motion.div 
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Three simple steps to a more accessible website
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: 1, title: 'Enter URL', desc: 'Paste your website URL or upload HTML/CSS files' },
                { step: 2, title: 'AI Analysis', desc: 'Our AI scans for WCAG violations and accessibility barriers' },
                { step: 3, title: 'Get Fixes', desc: 'Receive prioritized issues with code-level fix suggestions' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-hero text-primary-foreground text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%]">
                      <div className="border-t-2 border-dashed border-border" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <div className="container">
            <motion.div 
              className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              
              <div className="relative space-y-6 max-w-2xl mx-auto">
                <CheckCircle2 className="h-16 w-16 mx-auto text-primary-foreground/80" />
                <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
                  Ready to Make Your Website Accessible?
                </h2>
                <p className="text-lg text-primary-foreground/80">
                  Join thousands of developers building inclusive digital experiences
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="h-12 px-8 text-base font-semibold bg-background text-primary hover:bg-background/90"
                >
                  <Link to="/dashboard">
                    Start Your Free Scan
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
