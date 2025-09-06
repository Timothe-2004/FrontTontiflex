import { GlassCard } from "@/components/GlassCard";

const TontineJoiningSkeleton = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <GlassCard>
                        {/* Header skeleton */}
                        <div className="text-center mb-8">
                            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
                        </div>

                        {/* Détails de la tontine skeleton */}
                        <div className="rounded-lg p-4 mb-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Form skeleton */}
                        <div className="space-y-6">
                            {/* Contribution field */}
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
                                <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                            </div>

                            {/* Upload sections */}
                            <div className="space-y-4">
                                <div className="h-5 bg-gray-200 rounded w-56 animate-pulse"></div>
                                
                                {/* Recto */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                                </div>

                                {/* Verso */}
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                                </div>

                                {/* Note */}
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Frais d'adhésion */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>

                            {/* Submit button */}
                            <div className="h-12 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default TontineJoiningSkeleton;