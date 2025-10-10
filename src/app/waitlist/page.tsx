"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import useGooglePlacesAutocomplete from '@/hooks/utils/useGooglePlaces';
import { ChevronDown, Mail, User } from "lucide-react"
import { WaitlistAPIs } from "@/hooks/api/waitlist/waitlistAPI"
import { useRouter } from "next/navigation"
import { storeCookie } from "@/lib/storage"
import ReactPlayer from "react-player"
import 'odometer/themes/odometer-theme-default.css';
import dynamic from "next/dynamic";
const Odometer = dynamic(() => import('react-odometerjs'), {ssr: false,});
import { toast } from 'sonner';
const WaitlistPage = () => {
  const [activeTab, setActiveTab] = useState("Default")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState({ fullName: "", email: "", role: "", phone: "" })
  const { waitlistResponse, getWaitlistQuery } = WaitlistAPIs()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopIndexRef = useRef<number | null>(null)
  const [percentage, setPercentage] = useState(0)
  const [randomTab, setRandomTab] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const roles = ["Buyer", "Homeowner", "Agent"];
  const [preferredLocation, setPreferredLocation] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const locationSuggestions = useGooglePlacesAutocomplete(preferredLocation);
  // const locationSuggestions = ["New York", "Los Angeles", "San Francisco", "Austin", "Chicago", "Miami", "Seattle", "Dallas", "Atlanta"]
  const [isClient, setIsClient] = useState(false);
  const [referralSource, setReferralSource] = useState("");
const referr = ["LinkedIn", "Instagram", "Facebook", "Twitter", "Google", "Word of Mouth"];
  const [loadingLocation, setLoadingLocation] = useState(false);
  useEffect(() => {
    // Ensures it renders only after hydration
    setIsClient(true);
  }, []);
  const { data, isLoading, error } = getWaitlistQuery;
  // debugger
 console.log(data)
  const filteredLocations = locationSuggestions.filter((loc) =>
    loc.toLowerCase().includes(preferredLocation.toLowerCase())
  )
  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const images = [
    "/assets/images/buyer-waitlist.gif",
    "/assets/images/seller-waitlist.gif",
    "/assets/images/agent-waitlist.gif",
  ]

  const tabs = ["Buyer", "Seller", "Agent"];

  const handleSubmit = async () => {
    setLoading(true)
    const newErrors = { fullName: "", email: "", role: "", phone: "" }
    // if (!fullName.trim()) {
    //   newErrors.fullName = "Full Name is required"
    // }
    // if (!selectedRoles.length) {
    //   newErrors.role = "Role is required"
    // }
    // if (!phoneNumber.trim()) {
    //   newErrors.phone = "Phone number is required";
    // }

    if (!email.trim()) {
      newErrors.email = "Email address is required"
    }
    //  else if (!validateEmail(email)) {
    //   newErrors.email = "Invalid email format"
    // }
    setErrors(newErrors)

    if (!newErrors.fullName && !newErrors.email && !newErrors.phone && !newErrors.role) {
      await waitlistResponse.mutate(
        {
          name: fullName || "",
          email,
          location: preferredLocation || "",
          phone: `+1${phoneNumber}`,
          roles: selectedRoles || "",
        },
        {
          onSuccess: (data) => {
            if (data?.id) {
              setLoading(false)
              storeCookie({ key: "waitlist", value: true });
              router.push(`/waitlist/subscriber?name=${fullName}`);
            }
          },
          onError: (error) => {
            setLoading(false)
             toast.error(error.message);
            console.error("Error submitting waitlist:", error);
          },
        }
      );
    }
  }

  const startCarousel = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)
  }

  useEffect(() => {
    console.log("active ", activeTab);

    // let intervalTime = activeTab === "Default" ? 500 : 300;
    const interval = setInterval(() => {
      setPercentage((prev) => {
        if (prev >= 100) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
          return 0;
        }
        return prev + 5;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Default") {
      const interval = setInterval(() => {
        if (randomTab === 3) {
          setRandomTab(1)
        } else {
          setRandomTab(randomTab + 1)
        }
      }, 6000)
      return () => clearInterval(interval);
    } else {
      setRandomTab(3)
    }
  }, [randomTab]);


  const stopCarousel = (index: number) => {
    clearInterval(intervalRef.current as NodeJS.Timeout)
    stopIndexRef.current = index
    setCurrentIndex(index)
  }

  const handleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? "Default" : tab)
    setPercentage(0)
  }

  useEffect(() => {
    storeCookie({ key: "waitlist", value: false });
  }, [])
  const tabContent = {
    Buyer: (
      <div className="flex justify-center w-full">
        <ReactPlayer
          muted
          url="https://youtu.be/wxnCua71Bpc?si=TUdqnugjLOAPeTxQ"
          playing
          loop
          controls={true}
          width="100%"
          height="500px"
          className="rounded-lg shadow-md"
        />
      </div>
    ),
    Seller: (
      <div className="flex justify-center w-full">
        <ReactPlayer
          muted
          url="https://youtu.be/wxnCua71Bpc?si=TUdqnugjLOAPeTxQ"
          playing
          loop
          controls={true}
          width="100%"
          height="500px"
          className="rounded-lg shadow-md"
        />

      </div>
    ),
    Agent: (
      <div className="flex justify-center w-full">
        <ReactPlayer
          muted
          url="https://youtu.be/wxnCua71Bpc?si=TUdqnugjLOAPeTxQ"
          playing
          loop
          controls={true}
          width="100%"
          height="500px"
          className="rounded-lg shadow-md"
        />

      </div>
    ),
    Default: (
      <div className="flex justify-center w-full">
        <ReactPlayer
          muted
          url="https://youtu.be/wxnCua71Bpc?si=TUdqnugjLOAPeTxQ"
          playing
          loop
          controls={true}
          width="100%"
          height="500px"
          className="rounded-lg shadow-md"
        />
      </div>
    ),
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, "");

    // Apply formatting for US phone number (XXX) XXX-XXXX
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove non-numeric characters and format properly
    value = formatPhoneNumber(value);
    setPhoneNumber(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && phoneNumber.length > 0) {
      // Handle deletion by removing last numeric character and reformatting
      setPhoneNumber((prev) => formatPhoneNumber(prev.slice(0, -1)));
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex justify-center flex-col bg-black">
      {/* Header */}
      <header className="w-full py-4 bg-black text-white px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex">
          <Image
            src="/assets/images/image.png"
            alt="logo"
            className="w-[120px] h-[36px] sm:w-[170px] sm:h-[45px] lg:w-[240px] lg:h-[72px]"
            width={240}
            height={72}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-black text-white">
        <div className="container mx-auto">
          <div className="mt-4 flex flex-col lg:flex-row gap-8">
            {/* Left Section - Form */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  The Future of Real Estate is Here
                </h1>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                  Empowering Buyers, Sellers and Agents with Smart, Seamless & Transparent Solutions
                </p>
              </div>
              <div className="space-y-4 w-full">
                {/* Full Name Input */}
                <div className="space-y-1">
                  <div className="flex items-center px-4 py-3 rounded-lg border transition bg-gray-800 border-gray-700">
                    <User className="text-gray-400 w-5 h-5 mr-3" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-white"
                    />
                  </div>
                  {/* {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>} */}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <div className="flex items-center px-4 py-3 rounded-lg border transition bg-gray-800 border-gray-700">
                    <Mail className="text-gray-400 w-5 h-5 mr-3" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-white"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                {/* Phone Input */}
                <div className="space-y-1">
                  <div className="flex items-center bg-gray-800 rounded-md overflow-hidden">
                    <span className="px-4 py-3 bg-gray-700 text-white rounded-l-md">+1</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-800 text-white border-none outline-none"
                      placeholder="(XXX) XXX-XXXX"
                      maxLength={14} // Limits input to (XXX) XXX-XXXX format
                    />
                  </div>
                </div>
                {/* Role Selection Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white shadow-sm focus:border-gray-500 focus:outline-none transition"
                  >
                    <span className="text-gray-400">
                      {selectedRoles.length > 0 ? selectedRoles.join(", ") : "What describes you best?"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-300" />
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 mt-2 w-full rounded-lg border border-gray-700 bg-gray-800 shadow-lg max-h-40 overflow-y-auto z-10">
                      {roles.map((role) => (
                        <label
                          key={role}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            checked={selectedRoles.includes(role)}
                            onChange={() => {
                              toggleRole(role)
                              setIsOpen(false)
                            }}
                            className="h-4 w-4 accent-gray-500"
                          />
                          {role}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {/* Preferred Location Input */}
                <div className="relative space-y-1">
                  {/* <LocationEdit /> */}
                  <input
                    type="text"
                    placeholder="Preferred Location"
                    value={preferredLocation}
                    onChange={(e) => {
                      setPreferredLocation(e.target.value)
                      setShowSuggestions(true)
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none"
                  />
                  {/* <MapPinHouse className="text-gray-400 w-5 h-5 mr-3" /> */}
                  {showSuggestions && filteredLocations.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md max-h-40 overflow-y-auto">
                      {filteredLocations.map((loc, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setPreferredLocation(loc)
                            setShowSuggestions(false)
                          }}
                          className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                        >
                          {loc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                 <div className="relative">
                <select
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-gray-400 rounded-md"
                >
                  <option value="">How did you hear about us</option>
                  {referr.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                {/* {errors.referralSource && <p className="text-red-500 text-sm">{errors.referralSource}</p>} */}
              </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full font-semibold py-3 rounded-lg transition duration-300 bg-white text-black hover:bg-gray-200"
                >
                  {loading ? "Processing..." : "Join the waitlist"}
                </button>
              </div>
            </div>

            {/* Right Section - Image Carousel */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0 space-y-6 flex flex-col items-center">
              {isClient?<div className="text-white text-4xl sm:text-5xl font-bold tracking-tight animate-fadeInUp">
                <Odometer value={128+parseInt(data?.total)} format="(,ddd)" duration={2000} />+
                <p className="text-lg text-gray-400 mt-1">early adopters are already experiencing radical transparency with Snaphomz</p>
              </div>:null}
              <div className="w-full">{tabContent[activeTab as keyof typeof tabContent]}</div>

              {/* Tab Navigation */}
              {/* <div className="flex justify-center space-x-2 sm:space-x-4 md:space-x-8 text-white mt-4">
                {tabs.map((tab, index) => (
                  <div key={tab} className="relative flex flex-col items-center">
                    <button
                      className={`text-sm sm:text-base md:text-lg px-2 sm:px-4 md:px-6 py-2 rounded-full transition-all duration-300 ${activeTab === tab
                        ? `font-bold text-white shadow-lg`
                        : `hover:text-white hover:bg-gray-700 transition`
                        }`}
                      onClick={() => handleTab(tab)}
                      onMouseEnter={() => stopCarousel(index)}
                      onMouseLeave={startCarousel}
                    >
                      {tab}
                    </button>
                    {activeTab === tab && (
                      <div className="mt-2 h-1 w-full rounded-full bg-gray-300 overflow-hidden">
                        <div
                          className="h-full bg-orange-700 transition-all duration-500 ease-in-out rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                    {(activeTab === "Default" && tab === tabs[randomTab - 1]) && (
                      <div className="mt-2 h-1 w-full rounded-full bg-gray-300 overflow-hidden">
                        <div
                          className="h-full bg-orange-700 transition-all duration-500 ease-in-out rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div> */}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-8 pb-6">
        <div className="container mx-auto">
          <hr className="w-full mt-8 sm:mt-12 border-gray-500" />
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-xs sm:text-sm">
            <p className="mb-2 sm:mb-0">© SnapHomz Inc. 2025</p>
            {/* <div className="space-x-4">
              <a href="" className="hover:text-gray-700">Terms</a>
              <a href="" className="hover:text-gray-700">Privacy Policy</a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default WaitlistPage

