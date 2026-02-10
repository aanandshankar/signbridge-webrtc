import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

const CTACard = () => {
    return (
        <section className="relative overflow-hidden bg-[#1D4ED8] rounded-lg p-20 flex flex-col items-center text-center text-white shadow-2xl">
            {/* Background Decorative Icon */}
            <div className="absolute top-2.5 right-0 -translate-y-1/2 opacity-20 pointer-events-none transform rotate-12">
                <Handshake size={150} strokeWidth={1} />
            </div>

            <div className="relative z-10 max-w-4xl">
                <h2 className="text-4xl font-bold mb-6 tracking-tight leading-none text-white">
                    Ready to start talking?
                </h2>
                <p className="text-blue-100/90 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
                    Join thousands of users who have found a better way to communicate. Start your free account today.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Button
                        size="lg"
                        variant={"secondary"}
                    >
                        Create Free Account
                    </Button>
                    <Button
                        size="lg"
                        variant={"secondary"}
                    >
                        Start a new Call
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default CTACard;
