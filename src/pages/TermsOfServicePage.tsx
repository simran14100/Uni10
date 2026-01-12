import { useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ChevronDown, CheckCircle, Info } from 'lucide-react';

// Interfaces matching the backend schema
interface Paragraph {
  content: string;
}

interface Point {
  point: string;
}

interface InputField {
  label: string;
  value: string;
}

interface TermsOfServiceSection {
  _id?: string;
  heading: string;
  subHeading?: string;
  paragraphs?: Paragraph[];
  description?: string;
  points?: Point[];
  inputFields?: InputField[];
}

interface TermsOfServiceData {
  _id?: string;
  mainHeading: string;
  sections: TermsOfServiceSection[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TermsOfServicePage = () => {
  const [policy, setPolicy] = useState<TermsOfServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await fetch('/api/terms-of-service');
        if (!response.ok) {
          throw new Error('Failed to fetch terms of service');
        }
        const data = await response.json();
        if (data?.data) {
          setPolicy(data.data as TermsOfServiceData);
          // Initialize all sections as open
          const initialOpenState: Record<string, boolean> = {};
          data.data.sections.forEach((_, index: number) => {
            initialOpenState[`section-${index}`] = true;
          });
          setOpenSections(initialOpenState);
        } else {
          setPolicy({ mainHeading: '', sections: [] });
        }
      } catch (err) {
        console.error('Error fetching terms of service:', err);
        setError(err instanceof Error ? err.message : 'Network error or server unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [sectionId]: !prevOpenSections[sectionId],
    }));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mt-10 mb-10">
                <FileText className="h-12 w-12 text-gray-800 animate-pulse" />
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">Terms of Service</h1>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-8 animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100">
          <div className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
            <div className="container mx-auto relative z-10">
              <div className="flex items-center justify-center space-x-4 mt-10 mb-4">
                <FileText className="h-14 w-14 text-gray-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
                Terms of Service
              </h1>
            </div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-gray-300 rounded-2xl p-8 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Terms of Service</h2>
                <p className="text-gray-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <div className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5 pattern-grid"></div>
          <div className="container mx-auto relative z-10">
            <div className="flex items-center justify-center space-x-4 mt-10 mb-4">
              <FileText className="h-14 w-14 text-gray-300" />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-4 tracking-tight">
              {policy?.mainHeading || "Terms of Service"}
            </h1>
            <p className="text-lg text-center text-gray-300 leading-relaxed px-4">
              Please read these terms and conditions carefully before using Our Service.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            {policy?.sections && policy.sections.length > 0 ? (
              <div className="space-y-6">
                {policy.sections.map((section, index) => {
                  const sectionId = `section-${index}`;
                  const isOpen = openSections[sectionId];
                  return (
                    <div
                      key={sectionId}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300"
                    >
                      <div
                        className="flex justify-between items-center cursor-pointer p-6 sm:p-8 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => toggleSection(sectionId)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-800 p-3 rounded-xl shadow-md">
                            <Info className="h-6 w-6 text-white" />
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {section.heading}
                          </h2>
                        </div>
                        <ChevronDown
                          className={`h-7 w-7 text-gray-400 transition-all duration-300 flex-shrink-0 ${
                            isOpen ? 'rotate-180 text-gray-600' : ''
                          }`}
                        />
                      </div>
                    
                      <div
                        className="transition-all duration-500 ease-in-out"
                        style={{
                          maxHeight: isOpen ? '1000px' : '0',
                          opacity: isOpen ? '1' : '0',
                          overflow: 'hidden',
                        }}
                      >
                        <div className="px-6 sm:px-8 pb-8">
                          <div className="border-t border-slate-200 pt-6">
                            {section.subHeading && (
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {section.subHeading}
                              </h3>
                            )}
                            {section.paragraphs && section.paragraphs.map((p, pIndex) => (
                              <p key={pIndex} className="text-lg text-gray-700 leading-relaxed mb-4">
                                {p.content}
                              </p>
                            ))}
                            {section.description && (
                              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                {section.description}
                              </p>
                            )}
                            {section.points && section.points.length > 0 && (
                              <ul className="list-disc list-inside space-y-2">
                                {section.points.map((point, pIndex) => (
                                  <li key={pIndex} className="flex items-start text-green-500">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                    <span>{point.point}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {section.inputFields && section.inputFields.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700 mt-4">
                                {section.inputFields.map((field, fIndex) => (
                                  <div key={fIndex}>
                                    <p><span className="font-medium">{field.label} :</span> {field.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-2xl shadow-lg p-12 max-w-2xl mx-auto">
                  <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    No Terms of Service Available
                  </h2>
                  <p className="text-lg text-gray-700 mb-2">
                    No terms of service content available yet.
                  </p>
                  <p className="text-gray-600">
                    Please check back later or contact support.
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="mt-16 bg-gray-800 rounded-2xl p-10 border border-gray-700">
              <div className="flex items-start space-x-5">
                <div className="bg-gray-700 p-3 rounded-xl">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Questions About Our Terms of Service?
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    If you have any questions or concerns regarding our terms of service, 
                    please don't hesitate to contact our support team for clarification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .pattern-grid {
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px;
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

