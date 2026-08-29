import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const translations = {
  en: {
    navVaccines: "Vaccines",
    navHowItWorks: "How It Works",
    navWhyUs: "Why Us",
    navContact: "Contact",
    login: "LOGIN",
    signUp: "SIGN UP",
    myOrders: "My Bookings",
    adminDashboard: "Admin Portal",
    logout: "Logout",

    verifiedInventory: "VERIFIED INVENTORY",
    availableVaccines: "Available Vaccines",
    showingProducts: "Showing {count} verified products available in Prayagraj",
    searchPlaceholder: "Search vaccines by name...",

    filters: "Filters",
    clearAll: "Clear all",
    priceRange: "Price Range",
    availability: "Availability",
    sortBy: "Sort By",
    under1k: "Under Rs.1,000",
    from1kTo3k: "Rs.1,000 - Rs.3,000",
    from3kTo5k: "Rs.3,000 - Rs.5,000",
    above5k: "Above Rs.5,000",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    priceLowToHigh: "Price: Low to High",
    priceHighToLow: "Price: High to Low",
    nameAZ: "Name: A - Z",
    activeFilters: "Active filters:",

    addToCart: "Add to Cart",
    inCart: "In Cart",
    addedToCart: "Added to Booking Cart!",
    coldChain: "COLD CHAIN 2°C - 8°C",
    verifiedVaccine: "VERIFIED VACCINE",

    cartTitle: "Your Vaccine Booking Cart",
    items: "item",
    subtotal: "Subtotal",
    coldChainShipping: "Cold-Chain Shipping",
    free: "FREE",
    totalAmount: "Total Amount",
    loginToComplete: "Login to Complete Booking",
    proceedToCheckout: "Proceed to Checkout",

    switchLang: "हिंदी",
    currentLangTag: "EN"
  },
  hi: {
    navVaccines: "वैक्सीन",
    navHowItWorks: "यह कैसे काम करता है",
    navWhyUs: "हमें क्यों चुनें",
    navContact: "संपर्क करें",
    login: "लॉगिन",
    signUp: "साइन अप",
    myOrders: "मेरे ऑर्डर्स",
    adminDashboard: "एडमिन पोर्टल",
    logout: "लॉगआउट",

    verifiedInventory: "सत्यापित इन्वेंटरी",
    availableVaccines: "उपलब्ध वैक्सीन",
    showingProducts: "प्रयागराज में उपलब्ध {count} सत्यापित उत्पाद",
    searchPlaceholder: "वैक्सीन का नाम खोजें...",

    filters: "फ़िल्टर",
    clearAll: "सभी साफ़ करें",
    priceRange: "कीमत सीमा",
    availability: "उपलब्धता",
    sortBy: "क्रमानुसार",
    under1k: "₹1,000 से कम",
    from1kTo3k: "₹1,000 – ₹3,000",
    from3kTo5k: "₹3,000 – ₹5,000",
    above5k: "₹5,000 से अधिक",
    inStock: "स्टॉक में है",
    lowStock: "कम स्टॉक",
    outOfStock: "स्टॉक ख़त्म",
    priceLowToHigh: "कीमत: कम से ज्यादा",
    priceHighToLow: "कीमत: ज्यादा से कम",
    nameAZ: "नाम: A – Z",
    activeFilters: "सक्रिय फ़िल्टर:",

    addToCart: "कार्ट में जोड़ें",
    inCart: "कार्ट में है",
    addedToCart: "कार्ट में जोड़ा गया!",
    coldChain: "कोल्ड चेन 2°C - 8°C",
    verifiedVaccine: "सत्यापित वैक्सीन",

    cartTitle: "आपकी वैक्सीन बुकिंग कार्ट",
    items: "आइटम",
    subtotal: "सबटोटल",
    coldChainShipping: "कोल्ड-चेन शिपिंग",
    free: "मुफ़्त",
    totalAmount: "कुल राशि",
    loginToComplete: "बुकिंग पूरी करने के लिए लॉगिन करें",
    proceedToCheckout: "चेकआउट के लिए आगे बढ़ें",

    switchLang: "English",
    currentLangTag: "HI"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("vaxflow_lang") || "en");

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "hi" : "en";
    setLang(newLang);
    localStorage.setItem("vaxflow_lang", newLang);
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations["en"]?.[key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
