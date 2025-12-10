import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, Users, MapPin, TreePine } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Landing() {
  const { user, userRole } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Urban Farm Share</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to={userRole === "landowner" ? "/dashboard/landowner" : "/dashboard/gardener"}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-float">
            <Sprout className="h-4 w-4" />
            <span>แพลตฟอร์มแบ่งปันพื้นที่ปลูกผักในเมือง</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Share Spaces,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Connect unused urban spaces with people who want to grow fresh, pesticide-free vegetables.
            Building a greener city, one garden at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/auth?role=landowner">
                Share Your Space
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link to="/auth?role=gardener">
                Find a Garden
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Simple steps to start your urban farming journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Landowners */}
            <Card className="p-8 border-2 hover:border-primary/50 transition-colors">
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Landowners</h3>
                <p className="text-muted-foreground mb-6">
                  Have unused space? Share it with your community and help create a greener city.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">List your space</p>
                    <p className="text-sm text-muted-foreground">Share details about your unused area</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Review requests</p>
                    <p className="text-sm text-muted-foreground">Approve gardeners you'd like to work with</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Connect & collaborate</p>
                    <p className="text-sm text-muted-foreground">Chat and manage access with QR codes</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* For Gardeners */}
            <Card className="p-8 border-2 hover:border-accent/50 transition-colors">
              <div className="mb-6">
                <div className="inline-flex p-3 rounded-xl bg-accent/10 mb-4">
                  <Sprout className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">For Gardeners</h3>
                <p className="text-muted-foreground mb-6">
                  Want to grow vegetables but lack space? Find the perfect spot in your neighborhood.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Browse spaces</p>
                    <p className="text-sm text-muted-foreground">Find available urban farming locations</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Send request</p>
                    <p className="text-sm text-muted-foreground">Introduce yourself and your gardening plans</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Start growing</p>
                    <p className="text-sm text-muted-foreground">Get approved and begin your urban farm</p>
                  </div>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Urban Farm Share?</h2>
            <p className="text-muted-foreground text-lg">
              Creating sustainable communities together
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
                <TreePine className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2">Green City</h3>
              <p className="text-muted-foreground">
                Transform unused spaces into thriving green areas, improving air quality and urban biodiversity
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-muted-foreground">
                Build connections with neighbors and create a supportive urban farming community
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex p-4 rounded-full bg-accent/10 mb-4">
                <Sprout className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Healthy Food</h3>
              <p className="text-muted-foreground">
                Grow fresh, pesticide-free vegetables and promote sustainable food production
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and start making a difference today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg">
              <Link to="/auth">
                Join Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2">
            Urban Farm Share - A vocational college research project
          </p>
          <p className="text-sm">
            วิทยาลัยเทคนิคธัญบุรี | สำนักงานคณะกรรมการอาชีวศึกษา
          </p>
        </div>
      </footer>
    </div>
  );
}
