import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { searchFood } from '../../services/foodService';
import { createLog } from '../../services/logService';
import toast from 'react-hot-toast';
import { formatCalories } from '../../utils/formatCalories';
import Loader from '../../components/common/Loader';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const root = useRef(null);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.search-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }
        );
      }
    }
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ['food-search', searchTerm],
    queryFn: () => searchFood(searchTerm),
    enabled: !!searchTerm,
  });

  useEffect(() => {
    if (results && results.length > 0 && !isLoading && root.current) {
      const resultItems = root.current.querySelectorAll('.search-result-item');
      resultItems.forEach((el, index) => {
        el.animate(
          [{ transform: 'translateY(12px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 350, delay: index * 60, easing: 'ease-out', fill: 'forwards' }
        );
      });
    }
  }, [results, isLoading]);

  const logMutation = useMutation({
    mutationFn: (logData) => createLog(logData),
    onSuccess: () => {
      toast.success('Food logged to daily intake!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Logging failed');
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchTerm(query.trim());
  };

  const handleLog = (food) => {
    logMutation.mutate({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      fat: food.fat,
      carbs: food.carbs,
      source: food.source,
      externalId: food.externalId,
    });
  };

  return (
    <div ref={root} className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="search-container opacity-0 space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-semibold border border-zinc-200">
            FatSecret & Edamam Verified
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Food Database Search</h1>
          <p className="text-xs text-zinc-500">
            Search verified macronutrients and calories for over 100,000+ meals and ingredients.
          </p>
        </header>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_24px_-4px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food (e.g. Avocado, Grilled Chicken, Oatmeal...)"
                className="w-full pl-10 pr-4 py-2.5 text-sm text-zinc-900 bg-zinc-50/60 border border-zinc-200 rounded-xl transition duration-150 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {isLoading ? (
            <div className="col-span-2 py-12"><Loader /></div>
          ) : results?.length > 0 ? (
            results.map((food, index) => (
              <div 
                key={food.id || `search-result-${index}`} 
                className="search-result-item opacity-0 bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-sm flex justify-between items-center hover:border-zinc-300 transition-all group"
              >
                <div>
                  <h3 className="font-semibold text-zinc-900 capitalize text-sm">{food.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-blue-600 tabular-nums">{formatCalories(food.calories)}</span>
                    {food.protein != null && (
                      <span className="text-[10px] text-zinc-400 font-medium">
                        &bull; P: {food.protein}g &bull; C: {food.carbs}g &bull; F: {food.fat}g
                      </span>
                    )}
                  </div>
                </div>
                
                {isAuthenticated ? (
                  <button
                    onClick={() => handleLog(food)}
                    disabled={logMutation.isPending}
                    className="inline-flex items-center gap-1 bg-zinc-50 hover:bg-emerald-600 text-zinc-700 hover:text-white border border-zinc-200 hover:border-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
                    </svg>
                    Log
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Sign in to log
                  </Link>
                )}
              </div>
            ))
          ) : searchTerm ? (
            <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-zinc-200/80 p-8">
              <p className="text-xs text-zinc-400 font-medium">No foods matching "{searchTerm}" found in verified database.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Search;
