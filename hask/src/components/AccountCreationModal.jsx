import React, { useState } from "react";
import Button from "./Button";

const AVATAR_COUNT = 70;
const COUNTRIES = [
  "United States", "United Kingdom", "Germany", "France", "Spain", "Italy", 
  "Canada", "Australia", "Netherlands", "Sweden", "Norway", "Denmark",
  "Switzerland", "Austria", "Belgium", "Portugal", "Ireland", "Finland",
  "Japan", "South Korea", "Singapore", "New Zealand", "Brazil", "Mexico"
];

const SAMPLE_BIOS = [
  "Building the future of technology",
  "Entrepreneur and software developer",
  "Creating innovative solutions",
  "Passionate about startups and innovation",
  "Full-stack developer and founder",
  "Product manager and tech enthusiast",
  "Designer and creative thinker",
  "AI researcher and developer",
  "Blockchain and crypto enthusiast",
  "Mobile app developer",
  "Data scientist and analyst",
  "Digital marketing expert"
];

const SAMPLE_NAMES = [
  "Alex Johnson", "Sarah Chen", "Michael Rodriguez", "Emma Thompson", "David Kim",
  "Lisa Anderson", "James Wilson", "Maria Garcia", "Robert Taylor", "Jennifer Lee",
  "Christopher Brown", "Amanda Davis", "Daniel Martinez", "Jessica Miller", "Matthew Jones"
];

export default function AccountCreationModal({ isOpen, onSubmit }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    city: "",
    country: "",
    linkedin: "",
    github: "",
    avatar: ""
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomProfile = () => {
    const randomAvatar = Math.floor(Math.random() * AVATAR_COUNT) + 1;
    const randomName = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const randomBio = SAMPLE_BIOS[Math.floor(Math.random() * SAMPLE_BIOS.length)];
    const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    
    setSelectedAvatar(randomAvatar);
    setFormData(prev => ({
      ...prev,
      name: randomName,
      bio: randomBio,
      country: randomCountry,
      avatar: `https://i.pravatar.cc/200?img=${randomAvatar}`
    }));
  };

  const handleRandomizeAvatar = () => {
    const randomAvatar = Math.floor(Math.random() * AVATAR_COUNT) + 1;
    setSelectedAvatar(randomAvatar);
    setFormData(prev => ({
      ...prev,
      avatar: `https://i.pravatar.cc/200?img=${randomAvatar}`
    }));
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError("");
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError("Username is required");
      return;
    }
    
    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    setStep(2);
    // Auto-generate profile data for step 2
    if (!formData.name) {
      generateRandomProfile();
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const accountData = {
        username: formData.username.trim(),
        name: formData.name || SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)],
        handle: formData.username.trim(),
        bio: formData.bio || SAMPLE_BIOS[Math.floor(Math.random() * SAMPLE_BIOS.length)],
        linkedin: formData.linkedin,
        github: formData.github,
        city: formData.city,
        country: formData.country || COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
        avatar: formData.avatar || `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * AVATAR_COUNT) + 1}`
      };

      console.log('Sending account data:', accountData);

      // Call backend API with full URL
      const response = await fetch('http://localhost:8000/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          // Try to parse error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage} - ${errorText}`;
            }
          } catch (textError) {
            console.error('Could not parse error response:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Try to parse successful response
      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        if (!responseText) {
          throw new Error('Empty response from server');
        }
        
        result = JSON.parse(responseText);
        console.log('Parsed response:', result);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      // Validate response structure
      if (!result.username || !result.address) {
        throw new Error('Invalid response format from server');
      }

      // Save to localStorage
      localStorage.setItem("username", accountData.username);
      localStorage.setItem("userProfile", JSON.stringify(accountData));
      localStorage.setItem("userAddress", result.address);
      if (selectedAvatar) {
        localStorage.setItem("profileAvatar", selectedAvatar.toString());
      }

      console.log('Account created successfully:', result);
      onSubmit(accountData);

    } catch (err) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-gray-100 max-h-[90vh] overflow-hidden">
        {step === 1 ? (
          // Step 1: Username
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#fb6058] to-[#ff7a6b] rounded-xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">@</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Handle</h2>
              <p className="text-gray-600">Create a unique handle to get started</p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username/Handle *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">@</span>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    placeholder="johndoe"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 focus:border-[#fb6058]/40 transition-all"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <div className="pt-4">
                <Button type="submit" variant="cta" className="w-full">
                  Continue
                </Button>
              </div>
            </form>
          </div>
        ) : (
          // Step 2: Profile Details
          <div className="flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
              <p className="text-gray-600 mt-1">We've pre-filled some details for you</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Avatar Selection */}
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                {selectedAvatar ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={formData.avatar} 
                      alt="Profile Avatar" 
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-700 text-sm">Avatar #{selectedAvatar}</div>
                      <div className="text-gray-400 text-xs">Your profile picture</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="rounded-lg border border-[#fb6058] bg-[#fb6058]/10 px-4 py-2 text-sm text-[#fb6058] hover:bg-[#fb6058]/20 transition-colors font-medium"
                    >
                      Generate Avatar
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    value={formData.country}
                    onChange={handleInputChange('country')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                  placeholder="e.g., Berlin"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={handleInputChange('linkedin')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={handleInputChange('github')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#fb6058]/40 text-sm"
                    placeholder="github.com/..."
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="secondary"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  variant="cta"
                  className="flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
