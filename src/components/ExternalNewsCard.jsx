import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, Zap, ChevronRight } from 'lucide-react';

export default function ExternalNewsCard({ item }) {
    const publishedAt = item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    }) : 'Recent';

    const imageUrl = item.image || item.urlToImage || null;
    const sourceName = item.source?.name || 'Top Headlines';
    const sourceLogo = item.source?.logo || null;
    const isWorld = item.category === 'world';

    const handlePress = () => {
        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="relative w-full rounded-2xl bg-white shadow-md border border-emerald-50 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:shadow-lg transition-transform transform hover:-translate-y-1 overflow-hidden" onClick={handlePress}>
            <div className="flex flex-col w-full h-full p-4">
                {/* Header with source logo */}
                <div className="flex items-center mb-3">
                    {sourceLogo ? (
                        <img src={sourceLogo} alt={sourceName} className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 object-contain mr-3" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mr-3 border border-emerald-100">
                            <Newspaper size={18} className="text-emerald-600" />
                        </div>
                    )}
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{sourceName}</h4>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                            <span>{publishedAt}</span>
                            <span className="mx-1.5">•</span>
                            <Zap size={10} className={isWorld ? 'text-amber-500' : 'text-amber-600'} />
                            <span className={`ml-1 font-semibold ${isWorld ? 'text-amber-500' : 'text-amber-600'}`}>
                                {isWorld ? '🌍 World' : 'Trending'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-3">
                    {item.title}
                </h3>

                {/* Article Image */}
                {imageUrl && (
                    <div className="w-full relative rounded-xl overflow-hidden mb-3 bg-gray-100" style={{ paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
                        <img src={imageUrl} alt={item.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                    </div>
                )}

                {/* Description */}
                {item.description && item.description.length > 10 && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                        {item.description}
                    </p>
                )}

                <div className="mt-auto border-t border-gray-100 pt-3 flex items-center">
                    <button onClick={(e) => { e.stopPropagation(); handlePress(); }} className="flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition">
                        <Newspaper size={16} className="mr-1.5" />
                        Read full article <ChevronRight size={14} className="ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
