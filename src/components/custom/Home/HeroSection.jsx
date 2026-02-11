import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
    return (
        <section className="bg-gradient-to-br w-[100dvw] h-[100dvh] from-primary/5 to-primary/20 flex items-center justify-center text-center p-10">
            {/* Left-section */}
            <div>
                <Badge className={"text-md px-5"}>Now With Sign Optimization</Badge>
                <h3>Bridging the Gap in Every Conversation</h3>
                <p>Real-time video calling designed for accessibility. Experience a platform build for everyone with low-latency and ML-driven tools.</p>
                <div>
                    <Button>Start Calling</Button>
                    <Button>About Us</Button>
                </div>
            </div>
            {/* Right-Section */}
        </section>
    )
}

export default HeroSection;