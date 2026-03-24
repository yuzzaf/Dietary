import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { detectFoodImage } from '../../services/foodService';
import { createLog } from '../../services/logService';
import toast from 'react-hot-toast';
import { formatCalories } from '../../utils/formatCalories';

const Detect = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const root = useRef(null);

  useEffect(() => {
    if (root.current) {
      const container = root.current.querySelector('.detect-container');
      if (container) {
        container.animate(
          [{ transform: 'translateY(20px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
          { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    }
  }, []);

  useEffect(() => {
    if (detectionResult && root.current) {
      const resultEl = root.current.querySelector('.detect-result');
      if (resultEl) {
        resultEl.animate(
          [{ transform: 'scale(0.95)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
          { duration: 500, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' }
        );
      }
    }
  }, [detectionResult]);

  const detectMutation = useMutation({
    mutationFn: (formData) => detectFoodImage(formData),
    onSuccess: (data) => {
      // Backend returns { detected: string, options: Array }
      setDetectionResult(data);
      setQuantity(1);
      toast.success('Food detected successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Detection failed');
    },
  });

  const logMutation = useMutation({
    mutationFn: (logData) => createLog(logData),
    onSuccess: () => {
      toast.success('Food logged to your daily intake!');
      setDetectionResult(null);
      setSelectedImage(null);
      setPreviewUrl(null);
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Logging failed');
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setDetectionResult(null);
    }
  };

  const handleDetect = () => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append('image', selectedImage);
    detectMutation.mutate(formData);
  };

  // Taking the best match from options
  const bestMatch = detectionResult?.options?.[0];

  const handleLog = () => {
    if (!bestMatch) return;
    logMutation.mutate({
      name: bestMatch.name,
      calories: bestMatch.calories,
      protein: bestMatch.protein,
      fat: bestMatch.fat,
      carbs: bestMatch.carbs,
      source: bestMatch.source,
      externalId: bestMatch.externalId,
      quantity: Number(quantity) || 1,
    });
  };

  return (
    <div ref={root}>
      <div className="detect-container opacity-0 max-w-2xl mx-auto space-y-8 pb-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Detect Food</h1>
        <p className="text-gray-500 mt-2">Upload an image to identify the dish and its calories.</p>
      </header>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
        {previewUrl ? (
          <div className="relative w-full aspect-square max-w-sm rounded-xl overflow-hidden mb-6 border-2 border-dashed border-gray-200">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
              className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-md"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="w-full aspect-square max-w-sm flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition mb-6 text-center px-4">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-sm">Click to upload or drag & drop food image</p>
            </div>
            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
          </label>
        )}

        <button
          onClick={handleDetect}
          disabled={!selectedImage || detectMutation.isPending}
          className={`w-full max-w-sm py-3 px-6 rounded-lg font-semibold text-white transition-all ${
            !selectedImage || detectMutation.isPending ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {detectMutation.isPending ? 'Analyzing Image...' : 'Detect Nutrition'}
        </button>
      </div>

      {detectionResult && (
        <div className="detect-result opacity-0 bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Results Found</h2>
          
          {bestMatch ? (
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Detected Dish</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{bestMatch.name}</p>
                <p className="text-xs text-blue-400 italic">AI match: {detectionResult.detected}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Calories</p>
                <p className="text-2xl font-bold text-blue-600">{formatCalories(bestMatch.calories)}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl text-center mb-6">
              <p className="text-gray-500 font-medium">We identified this as <span className="font-bold text-blue-600">"{detectionResult.detected}"</span>, but couldn't find exact nutritional data.</p>
              <Link to="/search" className="text-blue-600 text-sm font-bold hover:underline mt-2 inline-block">Try manual search</Link>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="space-y-4">
              {bestMatch && (
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="text-sm font-bold text-gray-700 whitespace-nowrap">Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 font-medium"
                  />
                  <span className="text-sm text-gray-500">
                    Total: <strong className="text-blue-600">{formatCalories((bestMatch.calories * quantity) || bestMatch.calories)}</strong>
                  </span>
                </div>
              )}
              
              <button
                onClick={handleLog}
                disabled={logMutation.isPending || !bestMatch}
                className={`w-full py-4 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center ${
                  !bestMatch ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {logMutation.isPending ? 'Logging...' : 'Add to Daily Log'}
              </button>
            </div>
          ) : (
            <div className="text-center p-4 bg-white rounded-xl border border-blue-100 italic text-gray-600">
              <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link> to save this result to your daily log.
            </div>
          )}
        </div>
      )}
    </div>
    </div>
  );
};

export default Detect;
