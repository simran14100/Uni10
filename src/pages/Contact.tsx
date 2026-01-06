import * as React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InquiryForm } from '@/components/InquiryForm';
import { api } from '@/lib/api';
import { Phone, Mail, MapPin, ArrowRight, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Try public contact endpoint
        const res = await api(`/api/settings/contact?v=${Date.now()}`);
        if (res.ok && res.json && res.json.data) {
          if (!mounted) return;
          setData(res.json.data || {});
          return;
        }

        // Fallback: try full settings document
        const res2 = await api(`/api/settings?v=${Date.now()}`);
        if (res2.ok && res2.json && res2.json.data) {
          const data = res2.json.data.contact || {};
          if (!mounted) return;
          setData(data || {});
          return;
        }

        throw new Error(res.json?.message || 'Failed to load contact settings');
      } catch (e: any) {
        console.warn('Contact fetch error', e?.message || e);
        if (!mounted) return;
        setError(e?.message || 'Failed to load contact information');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchData();
    return () => { mounted = false; };
  }, []);

  const phones: string[] = (data?.phones && Array.isArray(data.phones) ? data.phones : ['+91 99715 41140']);
  const emails: string[] = (data?.emails && Array.isArray(data.emails) ? data.emails : ['supportinfo@gmail.com','uni10@gmail.com']);
  const address = data?.address || null;
  const mapsUrl = data?.mapsUrl || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block">
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                We're here to help
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions? Need assistance? Our team is ready to help you with orders, products, or any inquiries.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Phone Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Phone</CardTitle>
                    <CardDescription className="mt-1 text-xs">Available 24/7</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Call us for immediate assistance</p>
              </CardHeader>
              <CardContent className="relative">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <ul className="space-y-3">
                    {phones.map((p, idx) => (
                      <li key={idx}>
                        <a 
                          href={`tel:${p}`} 
                          className="group/link flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-blue-50 hover:to-blue-50/30 transition-all duration-200 border border-transparent hover:border-blue-200"
                        >
                          <span className="font-semibold text-foreground group-hover/link:text-primary transition-colors">
                            {p}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-1 transition-all" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Email</CardTitle>
                    <CardDescription className="mt-1 text-xs">Response in 24hrs</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Send us your questions anytime</p>
              </CardHeader>
              <CardContent className="relative">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : (
                  <ul className="space-y-3">
                    {emails.map((e, idx) => (
                      <li key={idx}>
                        <a 
                          href={`mailto:${e}`} 
                          className="group/link flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-transparent hover:from-purple-50 hover:to-purple-50/30 transition-all duration-200 border border-transparent hover:border-purple-200"
                        >
                          <span className="font-semibold text-foreground group-hover/link:text-primary transition-colors break-all">
                            {e}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/link:text-primary group-hover/link:translate-x-1 transition-all flex-shrink-0 ml-2" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Location</CardTitle>
                    <CardDescription className="mt-1 text-xs">Visit us</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Our office and warehouse</p>
              </CardHeader>
              <CardContent className="relative">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : address && (address.line1 || address.city) ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 space-y-1 text-sm">
                      {address.line1 && <div className="font-semibold text-foreground">{address.line1}</div>}
                      {address.line2 && <div className="text-muted-foreground">{address.line2}</div>}
                      <div className="text-muted-foreground">
                        {(address.city ? address.city + ', ' : '') + (address.state || '')} {address.pincode ? address.pincode : ''}
                      </div>
                    </div>
                    {mapsUrl && (
                      <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-green-50 transition-all duration-200 border border-transparent hover:border-green-200 group/map"
                      >
                        <MapPin className="h-4 w-4" />
                        View on Google Maps
                        <ArrowRight className="h-4 w-4 group-hover/map:translate-x-1 transition-transform" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-sm text-muted-foreground">No address provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 md:p-8 border border-primary/20 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-3 flex-shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Response Times</h3>
                <p className="text-muted-foreground">
                  For urgent matters, please call us directly. Email inquiries are typically answered within one business day. 
                  Our customer support team is dedicated to providing prompt and helpful assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form Section */}
          <div className="mt-20 pt-16 border-t-2 border-gray-200">
            <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block">
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Quick Response
                </div>
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Send us a Message
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 md:p-10 hover:shadow-2xl transition-shadow duration-300">
              <InquiryForm />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            <div className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-3xl font-black text-primary">24/7</div>
              <div className="text-sm font-medium text-muted-foreground">Support Available</div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-3xl font-black text-primary">&lt;24h</div>
              <div className="text-sm font-medium text-muted-foreground">Email Response</div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-3xl font-black text-primary">100%</div>
              <div className="text-sm font-medium text-muted-foreground">Customer Satisfaction</div>
            </div>
            <div className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-3xl font-black text-primary">1000+</div>
              <div className="text-sm font-medium text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}