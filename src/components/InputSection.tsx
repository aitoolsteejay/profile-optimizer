import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Link, AlertCircle, Loader2 } from "lucide-react";

type ToneOption = "bold" | "professional" | "casual" | "analytical" | "direct" | "persuasive" | "minimal" | "confident";
type DataSource = "scraper" | "manual_fallback";

export interface QuotedIssue {
  issue_type: string;
  quoted_text: string;
  explanation: string;
}

export interface FormData {
  linkedinUrl: string;
  headline: string;
  aboutSection: string;
  role: string;
  targetIcp: string;
  customIcp: string;
  tones: ToneOption[];
  dataSource: DataSource;
}

interface InputSectionProps {
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onScrape: (url: string) => Promise<{ success: boolean; headline?: string; about?: string; role?: string; error?: string }>;
}

const icpOptions = [
  "CHROs",
  "Talent Leaders",
  "RevOps",
  "Sales Leaders",
  "Founders",
  "Marketers",
  "Other",
];

const toneOptions: ToneOption[] = [
  "bold",
  "professional",
  "casual",
  "analytical",
  "direct",
  "persuasive",
  "minimal",
  "confident",
];

const InputSection = ({ onSubmit, isLoading, onScrape }: InputSectionProps) => {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    linkedinUrl: "",
    headline: "",
    aboutSection: "",
    role: "",
    targetIcp: "",
    customIcp: "",
    tones: ["bold"],
    dataSource: "scraper",
  });
  const [errors, setErrors] = useState<{ headline?: string; aboutSection?: string; linkedinUrl?: string }>({});
  const [urlSubmitted, setUrlSubmitted] = useState(false);

  const handleToneToggle = (tone: ToneOption) => {
    setFormData(prev => {
      const currentTones = prev.tones;
      if (currentTones.includes(tone)) {
        if (currentTones.length > 1) {
          return { ...prev, tones: currentTones.filter(t => t !== tone) };
        }
        return prev;
      } else {
        return { ...prev, tones: [...currentTones, tone] };
      }
    });
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!linkedinUrl.trim()) {
      setErrors({ linkedinUrl: "Please enter your LinkedIn profile URL" });
      return;
    }

    const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
    if (!linkedinUrlPattern.test(linkedinUrl.trim())) {
      setErrors({ linkedinUrl: "Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)" });
      return;
    }

    setErrors({});
    setIsScraping(true);
    setScrapeError(null);

    try {
      const result = await onScrape(linkedinUrl.trim());
      
      if (result.success && result.headline && result.about) {
        // Successfully scraped both required fields
        setFormData(prev => ({
          ...prev,
          linkedinUrl: linkedinUrl.trim(),
          headline: result.headline || "",
          aboutSection: result.about || "",
          role: result.role || "",
          dataSource: "scraper",
        }));
        setShowFallback(false);
        setUrlSubmitted(true);
      } else {
        // Scraping failed or incomplete - show fallback
        const missingFields: string[] = [];
        if (!result.headline) missingFields.push("headline");
        if (!result.about) missingFields.push("about section");
        
        setScrapeError(result.error || `We could not fetch your ${missingFields.join(" and ")} automatically. Please paste the missing information to continue.`);
        setFormData(prev => ({
          ...prev,
          linkedinUrl: linkedinUrl.trim(),
          headline: result.headline || "",
          aboutSection: result.about || "",
          role: result.role || "",
          dataSource: "manual_fallback",
        }));
        setShowFallback(true);
        setUrlSubmitted(true);
      }
    } catch (error) {
      setScrapeError("Failed to fetch profile. Please paste your profile information manually.");
      setFormData(prev => ({
        ...prev,
        linkedinUrl: linkedinUrl.trim(),
        dataSource: "manual_fallback",
      }));
      setShowFallback(true);
      setUrlSubmitted(true);
    } finally {
      setIsScraping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { headline?: string; aboutSection?: string } = {};
    
    if (!formData.headline.trim()) {
      newErrors.headline = "Please enter your current headline";
    }
    
    if (!formData.aboutSection.trim()) {
      newErrors.aboutSection = "Please enter your current About section";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  return (
    <section id="input-section" className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="card-elevated p-8 md:p-10 glow-accent animate-scale-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Analyze Your Profile</h2>
          </div>
          
          {/* LinkedIn URL Input - Always shown first */}
          {!urlSubmitted && (
            <form onSubmit={handleUrlSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="linkedin-url" className="block text-sm font-medium text-foreground">
                  LinkedIn Profile URL <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin-url"
                    type="url"
                    placeholder="https://www.linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      if (errors.linkedinUrl) setErrors({ ...errors, linkedinUrl: undefined });
                    }}
                    className={`pl-11 ${errors.linkedinUrl ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}`}
                    disabled={isScraping}
                  />
                </div>
                {errors.linkedinUrl && (
                  <p className="text-sm text-destructive">{errors.linkedinUrl}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We analyze publicly available LinkedIn profile information. No login or posting access is required.
                </p>
              </div>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isScraping}
              >
                {isScraping ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Fetching Profile...
                  </>
                ) : (
                  <>
                    Fetch My Profile
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Main form after URL is submitted */}
          {urlSubmitted && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Scrape error message */}
              {scrapeError && showFallback && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80">{scrapeError}</p>
                </div>
              )}

              {/* Show headline/about only if fallback or editable */}
              {(showFallback || !formData.headline || !formData.aboutSection) && (
                <>
                  {/* Current Headline */}
                  <div className="space-y-2">
                    <label htmlFor="headline" className="block text-sm font-medium text-foreground">
                      Current LinkedIn Headline <span className="text-primary">*</span>
                    </label>
                    <Input
                      id="headline"
                      type="text"
                      placeholder="CEO @ Company | Helping teams achieve X"
                      value={formData.headline}
                      onChange={(e) => {
                        setFormData({ ...formData, headline: e.target.value });
                        if (errors.headline) setErrors({ ...errors, headline: undefined });
                      }}
                      className={errors.headline ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""}
                    />
                    {errors.headline && (
                      <p className="text-sm text-destructive">{errors.headline}</p>
                    )}
                  </div>

                  {/* Current About Section */}
                  <div className="space-y-2">
                    <label htmlFor="about" className="block text-sm font-medium text-foreground">
                      Current LinkedIn About Section <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="about"
                      placeholder="I help companies achieve..."
                      value={formData.aboutSection}
                      onChange={(e) => {
                        setFormData({ ...formData, aboutSection: e.target.value });
                        if (errors.aboutSection) setErrors({ ...errors, aboutSection: undefined });
                      }}
                      rows={6}
                      className={`flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none ${
                        errors.aboutSection 
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20" 
                          : "border-border focus:border-primary"
                      }`}
                    />
                    {errors.aboutSection && (
                      <p className="text-sm text-destructive">{errors.aboutSection}</p>
                    )}
                  </div>
                </>
              )}

              {/* Scraped content preview (when successfully scraped) */}
              {!showFallback && formData.headline && formData.aboutSection && (
                <div className="space-y-4 p-4 bg-secondary/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-muted-foreground">Profile data fetched successfully</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Headline</p>
                      <p className="text-sm text-foreground">{formData.headline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">About</p>
                      <p className="text-sm text-foreground line-clamp-3">{formData.aboutSection}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFallback(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit manually
                  </button>
                </div>
              )}
              
              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-foreground">
                  Your Role
                </label>
                <Input
                  id="role"
                  type="text"
                  placeholder="CEO, VP of Sales, Marketing Director"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
              
              {/* Target ICP */}
              <div className="space-y-2">
                <label htmlFor="target-icp" className="block text-sm font-medium text-foreground">
                  Target ICP
                </label>
                <select
                  id="target-icp"
                  value={formData.targetIcp}
                  onChange={(e) => setFormData({ ...formData, targetIcp: e.target.value, customIcp: "" })}
                  className="flex w-full rounded-lg border bg-input px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 border-border focus:border-primary"
                >
                  <option value="">Select your target audience</option>
                  {icpOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                
                {formData.targetIcp === "Other" && (
                  <Input
                    type="text"
                    placeholder="Enter your target audience"
                    value={formData.customIcp}
                    onChange={(e) => setFormData({ ...formData, customIcp: e.target.value })}
                    className="mt-3"
                  />
                )}
              </div>
              
              {/* Tone Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Tone Preference <span className="text-muted-foreground text-xs">(select one or more)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <Button
                      key={tone}
                      type="button"
                      variant="tone"
                      data-active={formData.tones.includes(tone)}
                      onClick={() => handleToneToggle(tone)}
                      className="capitalize px-4 py-2"
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                className="w-full mt-8"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Analyzing..."
                ) : (
                  <>
                    Make My Profile Better
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default InputSection;
