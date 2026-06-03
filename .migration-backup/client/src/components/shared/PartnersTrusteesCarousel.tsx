import { Shield, Lock, Eye, Building2, FileText, Briefcase, Network, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const partners = [
  {
    name: "Global Threat Intelligence Partner",
    segment: "Cybersecurity",
    role: "Tier-1 Cybersecurity Alliance",
    icon: Shield,
  },
  {
    name: "Digital Threat Monitoring",
    segment: "Threat Monitoring",
    role: "Advanced Network Surveillance",
    icon: Eye,
  },
  {
    name: "Asset Recovery Trustee",
    segment: "Asset Recovery",
    role: "Digital Asset Reclamation",
    icon: Lock,
  },
  {
    name: "Alliance Trust Realty",
    segment: "Real Estate",
    role: "Real Estate Brokerage Alliance",
    icon: Building2,
  },
  {
    name: "Legal & Trust Services Partner",
    segment: "Trust & Legal",
    role: "Power of Attorney & Documentation",
    icon: FileText,
  },
  {
    name: "Investment Portfolio Manager",
    segment: "Investment",
    role: "Strategic Portfolio Growth",
    icon: Briefcase,
  },
  {
    name: "Quantum Financial Infrastructure",
    segment: "Financial & QFS",
    role: "Next-Gen QFS Integration",
    icon: Network,
  },
  {
    name: "Market Insights Advisory",
    segment: "Advisory",
    role: "Strategic Market Analytics",
    icon: Lightbulb,
  },
];

export function PartnersTrusteesCarousel() {
  // We duplicate the items to create a seamless infinite loop
  const carouselItems = [...partners, ...partners];

  return (
    <div className="w-full overflow-hidden py-8">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-2xl font-display font-bold text-foreground">Our Trusted Partners & Business Allies</h2>
        <p className="text-muted-foreground">Working with world-class organizations to deliver excellence.</p>
      </div>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {carouselItems.map((partner, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-80 mx-4 glass-panel p-6 rounded-xl border border-white/10 flex flex-col items-center text-center gap-4 transition-transform hover:scale-105 hover:border-primary/50 cursor-default"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-box">
                <partner.icon className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs text-primary font-mono mb-1">{partner.segment}</div>
                <h3 className="font-bold text-lg text-foreground leading-tight mb-1 whitespace-normal">{partner.name}</h3>
                <p className="text-xs text-muted-foreground whitespace-normal">{partner.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}