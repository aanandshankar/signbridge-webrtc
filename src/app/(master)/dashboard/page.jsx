"use client";

import { Bell, Calendar, Hand, Keyboard, Mic, Search, Signal, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

import { activities, systemChecks, userData } from "@/data/dashboardData";
import { ActivityItem, QuickActionCard, SystemCheckItem } from "@/components/custom/dashboard";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";

export default function DashboardPage() {
    const user = useUserStore((state) => state.user);
    const { stats } = userData; // Keeping stats from mock data for now
    const router = useRouter();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back, {user?.username?.split(' ')[0] || 'User'}</h1>
                    <p className="text-sm text-slate-500 font-medium">You have {stats.scheduledCalls} scheduled calls today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" className="group rounded-xl h-10 w-10 bg-slate-50 border-slate-100 transition-colors hover:bg-white">
                        <Bell className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </Button>
                    <Button variant="outline" size="icon" className="group rounded-xl h-10 w-10 bg-slate-50 border-slate-100 transition-colors hover:bg-white">
                        <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* Hero Action Card */}
                    <div className="bg-primary/5 rounded-3xl p-8 border border-primary h-[300px] flex flex-col justify-center relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-bold text-slate-900 max-w-xs leading-tight">
                                Start a high-definition video call with real-time interpretation.
                            </h3>
                            <p className="text-slate-500 max-w-[240px] text-sm">
                                Optimized for accessibility with high-contrast UI and low-latency streaming.
                            </p>
                            <Button
                                onClick={() => {
                                    console.log("Start New Call clicked");
                                    const roomId = Math.random().toString(36).substring(7);
                                    console.log("Navigating to room:", roomId);
                                    router.push(`/room/${roomId}`);
                                }}
                                className="bg-chart-2 hover:bg-chart-3 text-white px-6 py-5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10 transition-all hover:scale-[1.02] active:scale-95 gap-2"
                            >
                                <Video className="w-4 h-4" />
                                Start New Call
                            </Button>
                        </div>
                        {/* Decorative background elements */}
                        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/5 rounded-full blur-[60px]" />
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.02] rotate-12">
                            <Hand className="w-48 h-48" />
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <QuickActionCard
                            icon={<Keyboard className="w-6 h-6" />}
                            title="Join with Code"
                            description="Enter a meeting code or invitation link to join an existing session."
                            colorClass="bg-chart-2/10 text-primary"
                        />
                        <QuickActionCard
                            icon={<Calendar className="w-6 h-6" />}
                            title="Schedule Call"
                            description="Set up a future meeting and invite participants to your calendar."
                            colorClass="bg-green-50 text-green-600"
                        />
                    </div>
                </div>

                {/* Side Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* System Check Card */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-900 mb-6">System Check</h4>
                        <div className="space-y-4">
                            {systemChecks.map((item) => (
                                <SystemCheckItem
                                    key={item.id}
                                    icon={item.label === "Camera" ? <Video className="w-4 h-4" /> : item.label === "Microphone" ? <Mic className="w-4 h-4" /> : <Signal className="w-4 h-4" />}
                                    label={item.label}
                                    status={item.status}
                                    statusColor={item.type === "success" ? "text-green-500 bg-green-50" : "text-blue-500 bg-blue-50"}
                                />
                            ))}
                        </div>
                        <Button variant="default" className="uppercase w-full mt-8 py-5 rounded-xl bg-foreground hover:bg-slate-800 text-white font-bold tracking-widest text-[10px]">
                            run full test
                        </Button>
                    </div>

                    {/* Recent Activity Card */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-sm font-bold text-slate-900">Recent Activity</h4>
                            <button className="text-blue-600 text-[10px] font-bold hover:underline uppercase tracking-wider">View All</button>
                        </div>
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <ActivityItem key={activity.id} name={activity.name} date={activity.date} avatar={activity.avatar} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}