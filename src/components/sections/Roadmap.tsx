import { BarChart, PenTool, Layout, Code2, ShieldCheck, Rocket, Wrench, BookOpen } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Requirement Analysis",
    description: "We conduct a thorough analysis of your requirements to establish the foundation for your website.",
    icon: BarChart,
  },
  {
    id: 2,
    title: "Planning",
    description: "We make detailed plans and customized strategies to ensure a secure roadmap to success.",
    icon: PenTool,
  },
  {
    id: 3,
    title: "Design (UI/UX)",
    description: "In this phase, we craft UI/UX aligned with your vision using best technology, ensuring best user experience.",
    icon: Layout,
  },
  {
    id: 4,
    title: "Development",
    description: "After designing UI/UX, we implement concepts with cutting-edge programming languages and standards.",
    icon: Code2,
  },
  {
    id: 5,
    title: "System Testing and QA",
    description: "We ensure reliability through rigorous System Testing and QA for a seamless user experience and robust website.",
    icon: ShieldCheck,
  },
  {
    id: 6,
    title: "Deployment",
    description: "After ensuring website quality, we launch it from prototype to fully-fledged, live for your entire audience.",
    icon: Rocket,
  },
  {
    id: 7,
    title: "Maintenance & Monitoring",
    description: "After deployment, we provide ongoing monitoring and support to ensure your website runs smoothly.",
    icon: Wrench,
  },
  {
    id: 8,
    title: "Knowledge Transfer",
    description: "We provide training on website operations, troubleshooting, implementation, and user data access post-launch.",
    icon: BookOpen,
  },
];

const ArcDiagram = ({ side, items, offsetStart }: { side: "left" | "right", items: typeof steps, offsetStart: number }) => {
  return (
    <div className="relative w-full h-[600px] hidden lg:flex items-center justify-center">
      {/* Center "MODULES" Circle */}
      <div className={`absolute top-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-20 ${side === 'left' ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'}`}>
        <span className="font-bold text-foreground tracking-widest text-sm">MODULES</span>
      </div>

      {/* Connecting Arc SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 600" preserveAspectRatio="none">
        {side === 'left' ? (
          <path d="M0 100 C150 100, 150 500, 0 500" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-primary/30" />
        ) : (
          <path d="M200 100 C50 100, 50 500, 200 500" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-primary/30" />
        )}
      </svg>

      {/* Floating Icons */}
      {items.map((item, index) => {
        // Calculate vertical position (spread across the arc)
        const topPositions = ["15%", "35%", "65%", "85%"];
        const rightPositionsLeftArc = ["25%", "10%", "10%", "25%"];
        const leftPositionsRightArc = ["25%", "10%", "10%", "25%"];

        const Icon = item.icon;

        return (
          <div 
            key={item.id}
            className="absolute flex items-center gap-3"
            style={{ 
              top: topPositions[index], 
              ...(side === 'left' ? { right: rightPositionsLeftArc[index] } : { left: leftPositionsRightArc[index] }),
              transform: 'translateY(-50%)'
            }}
          >
            {side === 'left' && (
              <span className="text-sm font-bold text-foreground/50">{String(item.id).padStart(2, '0')}</span>
            )}
            
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-border/50 transition-transform hover:-translate-y-1 hover:shadow-primary/20">
              <Icon className="w-8 h-8 text-primary" />
            </div>

            {side === 'right' && (
              <span className="text-sm font-bold text-foreground/50">{String(item.id).padStart(2, '0')}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Roadmap = () => {
  const leftSteps = steps.slice(0, 4);
  const rightSteps = steps.slice(4, 8);

  return (
    <section id="roadmap" className="py-24 overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-16 lg:mb-24">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Roadmap
          </h2>
        </div>

        {/* Desktop Layout (lg+) */}
        <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1.2fr_1fr] gap-8 items-center max-w-7xl mx-auto">
          
          {/* Col 1: Left Arc */}
          <ArcDiagram side="left" items={leftSteps} offsetStart={0} />

          {/* Col 2: Left Text */}
          <div className="flex flex-col gap-12 py-8">
            {leftSteps.map((step) => (
              <div key={step.id} className="space-y-3 relative group">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">{step.id}.</span> {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Col 3: Right Text */}
          <div className="flex flex-col gap-12 py-8">
            {rightSteps.map((step) => (
              <div key={step.id} className="space-y-3 relative group">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">{step.id}.</span> {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Col 4: Right Arc */}
          <ArcDiagram side="right" items={rightSteps} offsetStart={4} />

        </div>

        {/* Mobile/Tablet Layout (Vertical Timeline) */}
        <div className="lg:hidden max-w-2xl mx-auto relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20" />
          
          <div className="space-y-12 relative">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex gap-6 relative">
                  <div className="w-16 h-16 shrink-0 bg-white rounded-2xl shadow-md border border-border flex items-center justify-center relative z-10">
                    <Icon className="w-8 h-8 text-primary" />
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-brand-gradient text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {step.id}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
