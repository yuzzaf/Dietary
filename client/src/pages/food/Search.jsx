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
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
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
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 400, delay: index * 100, easing: 'ease-out', fill: 'forwards' }
        );
      });
    }
  }, [results, isLoading]);

  const logMutation = useMutation({
    mutationFn: (logData) => createLog(logData),
    onSuccess: () => {
      toast.success('Food logged to your daily intake!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Logging failed');
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleLog = (food) => {
    logMutation.mutate({
      food_id: food.id,
      name: food.name,
      calories: food.calories,
    });
  };

  return (
    <div ref={root}>
      <div className="search-container opacity-0 max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Search Food</h1>
        <p className="text-gray-500 mt-2">Search our database for nutritional info and log your meals.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g. Avocado, Chicken Breast, Pizza...)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 py-12"><Loader /></div>
        ) : results?.length > 0 ? (
          results.map((food, index) => (
            <div key={food.id || `search-result-${index}`} className="search-result-item opacity-0 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition">
              <div>
                <h3 className="font-bold text-gray-900 capitalize text-lg">{food.name}</h3>
                <p className="text-blue-600 font-semibold">{formatCalories(food.calories)}</p>
              </div>
              
              {isAuthenticated ? (
                <button
                  onClick={() => handleLog(food)}
                  disabled={logMutation.isPending}
                  className="bg-green-50 text-green-700 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden group-hover:inline pr-1">Add Log</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Login to log
                </Link>
              )}
            </div>
          ))
        ) : searchTerm ? (
          <p className="col-span-2 text-center text-gray-500 py-12">No results found for "{searchTerm}"</p>
        ) : null}
      </div>
      </div>
    </div>
  );
};

export default Search;
