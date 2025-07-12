import { useState } from "react";
import { useLocation } from "wouter";
import { Brain, Mic, Eye, Shield, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { PricingCard } from "@/components/ui/pricing-card";
import { useToast } from "@/hooks/use-toast";
import { login, signup, setToken } from "@/lib/auth";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    jobRole: "",
    company: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(loginData);
      setToken(response.token);
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      setShowLogin(false);
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await signup(signupData);
      setToken(response.token);
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      setShowSignup(false);
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Signup failed",
        variant: "destructive",
      });
    }
  };

  const handlePlanSelect = (plan: string) => {
    if (isAuthenticated()) {
      setLocation(`/subscribe?plan=${plan}`);
    } else {
      setShowSignup(true);
    }
  };

  const scrollToDemo = () => {
    // Placeholder for demo functionality
    toast({
      title: "Demo",
      description: "Demo video coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
      />

      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real-time AI that helps you
              <span className="text-yellow-300"> think better</span>, not cheat
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
              Your intelligent overlay for high-stress situations — interviews, sales pitches, and meetings. 
              Get contextual suggestions and answers without disrupting your flow.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-50"
                onClick={() => setShowSignup(true)}
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary"
                onClick={scrollToDemo}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Silent Assistant for Every Conversation
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enhance decision-making during live sessions with AI that listens, reads, and assists in real time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center bg-gray-50 border-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Listening</h3>
                <p className="text-gray-600">AI analyzes conversations in real-time, providing contextual insights and suggestions.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gray-50 border-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Screen Analysis</h3>
                <p className="text-gray-600">Reads and understands what's on your screen to provide relevant information.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-gray-50 border-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Invisible Operation</h3>
                <p className="text-gray-600">Works behind the scenes without disrupting your natural flow or conversation.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free and scale as your needs grow. All plans include core AI assistance features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              plan="Free"
              price="0"
              description="Perfect for trying out Cognitive Copilot"
              features={[
                "5 AI sessions per month",
                "Basic screen analysis",
                "30-minute session limit",
                "Community support"
              ]}
              onSelect={() => handlePlanSelect("free")}
              buttonText="Start Free Trial"
            />
            
            <PricingCard
              plan="Pro"
              price="29"
              description="For professionals who need reliable AI assistance"
              features={[
                "Unlimited AI sessions",
                "Advanced screen analysis",
                "Unlimited session time",
                "Priority support",
                "Custom AI training",
                "Session recordings"
              ]}
              isPopular={true}
              onSelect={() => handlePlanSelect("pro")}
              buttonText="Choose Pro"
            />
            
            <PricingCard
              plan="Enterprise"
              price="99"
              description="For teams and organizations"
              features={[
                "Everything in Pro",
                "Team management",
                "Advanced analytics",
                "SSO integration",
                "24/7 dedicated support",
                "Custom integrations"
              ]}
              onSelect={() => handlePlanSelect("enterprise")}
              buttonText="Choose Enterprise"
            />
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={showSignup} onOpenChange={setShowSignup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your full name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="signup-role">Job Role</Label>
              <Select value={signupData.jobRole} onValueChange={(value) => setSignupData({ ...signupData, jobRole: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-engineer">Software Engineer</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                  <SelectItem value="sales-representative">Sales Representative</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="signup-company">Company</Label>
              <Input
                id="signup-company"
                type="text"
                placeholder="Enter your company"
                value={signupData.company}
                onChange={(e) => setSignupData({ ...signupData, company: e.target.value })}
              />
            </div>
            
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
