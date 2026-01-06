/**
 * phoneUtils.js
 * 
 * Utilities for extracting country information from PersonData records
 * 
 * FIELD NAMES (from PersonData.java):
 * - phonenumber (not "phone")
 * - country
 * - address1
 * - placeofbirth
 */

// Country code to country name mapping
const COUNTRY_CODES = {
  "1": "USA/Canada",
  "20": "Egypt",
  "27": "South Africa",
  "30": "Greece",
  "31": "Netherlands",
  "32": "Belgium",
  "33": "France",
  "34": "Spain",
  "36": "Hungary",
  "39": "Italy",
  "40": "Romania",
  "41": "Switzerland",
  "43": "Austria",
  "44": "UK",
  "45": "Denmark",
  "46": "Sweden",
  "47": "Norway",
  "48": "Poland",
  "49": "Germany",
  "51": "Peru",
  "52": "Mexico",
  "53": "Cuba",
  "54": "Argentina",
  "55": "Brazil",
  "56": "Chile",
  "57": "Colombia",
  "58": "Venezuela",
  "60": "Malaysia",
  "61": "Australia",
  "62": "Indonesia",
  "63": "Philippines",
  "64": "New Zealand",
  "65": "Singapore",
  "66": "Thailand",
  "81": "Japan",
  "82": "South Korea",
  "84": "Vietnam",
  "86": "China",
  "90": "Turkey",
  "91": "India",
  "92": "Pakistan",
  "93": "Afghanistan",
  "94": "Sri Lanka",
  "95": "Myanmar",
  "98": "Iran",
  "212": "Morocco",
  "213": "Algeria",
  "216": "Tunisia",
  "218": "Libya",
  "220": "Gambia",
  "221": "Senegal",
  "222": "Mauritania",
  "223": "Mali",
  "224": "Guinea",
  "225": "Ivory Coast",
  "226": "Burkina Faso",
  "227": "Niger",
  "228": "Togo",
  "229": "Benin",
  "230": "Mauritius",
  "231": "Liberia",
  "232": "Sierra Leone",
  "233": "Ghana",
  "234": "Nigeria",
  "235": "Chad",
  "236": "Central African Republic",
  "237": "Cameroon",
  "238": "Cape Verde",
  "239": "Sao Tome and Principe",
  "240": "Equatorial Guinea",
  "241": "Gabon",
  "242": "Republic of Congo",
  "243": "DR Congo",
  "244": "Angola",
  "245": "Guinea-Bissau",
  "246": "British Indian Ocean Territory",
  "248": "Seychelles",
  "249": "Sudan",
  "250": "Rwanda",
  "251": "Ethiopia",
  "252": "Somalia",
  "253": "Djibouti",
  "254": "Kenya",
  "255": "Tanzania",
  "256": "Uganda",
  "257": "Burundi",
  "258": "Mozambique",
  "260": "Zambia",
  "261": "Madagascar",
  "262": "Reunion",
  "263": "Zimbabwe",
  "264": "Namibia",
  "265": "Malawi",
  "266": "Lesotho",
  "267": "Botswana",
  "268": "Eswatini",
  "269": "Comoros",
  "291": "Eritrea",
  "297": "Aruba",
  "298": "Faroe Islands",
  "299": "Greenland",
  "350": "Gibraltar",
  "351": "Portugal",
  "352": "Luxembourg",
  "353": "Ireland",
  "354": "Iceland",
  "355": "Albania",
  "356": "Malta",
  "357": "Cyprus",
  "358": "Finland",
  "359": "Bulgaria",
  "370": "Lithuania",
  "371": "Latvia",
  "372": "Estonia",
  "373": "Moldova",
  "374": "Armenia",
  "375": "Belarus",
  "376": "Andorra",
  "377": "Monaco",
  "378": "San Marino",
  "380": "Ukraine",
  "381": "Serbia",
  "382": "Montenegro",
  "383": "Kosovo",
  "385": "Croatia",
  "386": "Slovenia",
  "387": "Bosnia and Herzegovina",
  "389": "North Macedonia",
  "420": "Czech Republic",
  "421": "Slovakia",
  "423": "Liechtenstein",
  "500": "Falkland Islands",
  "501": "Belize",
  "502": "Guatemala",
  "503": "El Salvador",
  "504": "Honduras",
  "505": "Nicaragua",
  "506": "Costa Rica",
  "507": "Panama",
  "508": "Saint Pierre and Miquelon",
  "509": "Haiti",
  "590": "Guadeloupe",
  "591": "Bolivia",
  "592": "Guyana",
  "593": "Ecuador",
  "594": "French Guiana",
  "595": "Paraguay",
  "596": "Martinique",
  "597": "Suriname",
  "598": "Uruguay",
  "599": "Netherlands Antilles",
  "670": "East Timor",
  "672": "Antarctica",
  "673": "Brunei",
  "674": "Nauru",
  "675": "Papua New Guinea",
  "676": "Tonga",
  "677": "Solomon Islands",
  "678": "Vanuatu",
  "679": "Fiji",
  "680": "Palau",
  "681": "Wallis and Futuna",
  "682": "Cook Islands",
  "683": "Niue",
  "685": "Samoa",
  "686": "Kiribati",
  "687": "New Caledonia",
  "688": "Tuvalu",
  "689": "French Polynesia",
  "690": "Tokelau",
  "691": "Micronesia",
  "692": "Marshall Islands",
  "850": "North Korea",
  "852": "Hong Kong",
  "853": "Macau",
  "855": "Cambodia",
  "856": "Laos",
  "880": "Bangladesh",
  "886": "Taiwan",
  "960": "Maldives",
  "961": "Lebanon",
  "962": "Jordan",
  "963": "Syria",
  "964": "Iraq",
  "965": "Kuwait",
  "966": "Saudi Arabia",
  "967": "Yemen",
  "968": "Oman",
  "970": "Palestine",
  "971": "UAE",
  "972": "Israel",
  "973": "Bahrain",
  "974": "Qatar",
  "975": "Bhutan",
  "976": "Mongolia",
  "977": "Nepal",
  "992": "Tajikistan",
  "993": "Turkmenistan",
  "994": "Azerbaijan",
  "995": "Georgia",
  "996": "Kyrgyzstan",
  "998": "Uzbekistan"
};

// Country name to flag emoji mapping - EXPANDED
const COUNTRY_FLAGS = {
  // Africa
  "Cameroon": "🇨🇲",
  "Nigeria": "🇳🇬",
  "South Africa": "🇿🇦",
  "Ghana": "🇬🇭",
  "Kenya": "🇰🇪",
  "Egypt": "🇪🇬",
  "Morocco": "🇲🇦",
  "Algeria": "🇩🇿",
  "Tunisia": "🇹🇳",
  "Senegal": "🇸🇳",
  "Ivory Coast": "🇨🇮",
  "Ethiopia": "🇪🇹",
  "Uganda": "🇺🇬",
  "Tanzania": "🇹🇿",
  "DR Congo": "🇨🇩",
  "Republic of Congo": "🇨🇬",
  "Angola": "🇦🇴",
  "Mozambique": "🇲🇿",
  "Zimbabwe": "🇿🇼",
  "Zambia": "🇿🇲",
  "Malawi": "🇲🇼",
  "Botswana": "🇧🇼",
  "Namibia": "🇳🇦",
  "Rwanda": "🇷🇼",
  "Burundi": "🇧🇮",
  "Somalia": "🇸🇴",
  "Sudan": "🇸🇩",
  "Mali": "🇲🇱",
  "Niger": "🇳🇪",
  "Burkina Faso": "🇧🇫",
  "Chad": "🇹🇩",
  "Benin": "🇧🇯",
  "Togo": "🇹🇬",
  "Liberia": "🇱🇷",
  "Sierra Leone": "🇸🇱",
  "Guinea": "🇬🇳",
  "Gabon": "🇬🇦",
  "Mauritania": "🇲🇷",
  "Mauritius": "🇲🇺",
  "Seychelles": "🇸🇨",
  "Cape Verde": "🇨🇻",
  "Equatorial Guinea": "🇬🇶",
  "Sao Tome and Principe": "🇸🇹",
  "Djibouti": "🇩🇯",
  "Eritrea": "🇪🇷",
  "Central African Republic": "🇨🇫",
  "Comoros": "🇰🇲",
  "Lesotho": "🇱🇸",
  "Eswatini": "🇸🇿",
  "Gambia": "🇬🇲",
  "Guinea-Bissau": "🇬🇼",
  
  // Europe
  "France": "🇫🇷",
  "UK": "🇬🇧",
  "Germany": "🇩🇪",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Portugal": "🇵🇹",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Austria": "🇦🇹",
  "Sweden": "🇸🇪",
  "Norway": "🇳🇴",
  "Denmark": "🇩🇰",
  "Finland": "🇫🇮",
  "Poland": "🇵🇱",
  "Czech Republic": "🇨🇿",
  "Hungary": "🇭🇺",
  "Romania": "🇷🇴",
  "Bulgaria": "🇧🇬",
  "Greece": "🇬🇷",
  "Ireland": "🇮🇪",
  "Iceland": "🇮🇸",
  "Croatia": "🇭🇷",
  "Serbia": "🇷🇸",
  "Ukraine": "🇺🇦",
  "Russia": "🇷🇺",
  
  // Americas
  "USA/Canada": "🇺🇸",
  "USA": "🇺🇸",
  "Canada": "🇨🇦",
  "Mexico": "🇲🇽",
  "Brazil": "🇧🇷",
  "Argentina": "🇦🇷",
  "Chile": "🇨🇱",
  "Colombia": "🇨🇴",
  "Peru": "🇵🇪",
  "Venezuela": "🇻🇪",
  "Ecuador": "🇪🇨",
  "Bolivia": "🇧🇴",
  "Paraguay": "🇵🇾",
  "Uruguay": "🇺🇾",
  "Cuba": "🇨🇺",
  "Jamaica": "🇯🇲",
  "Haiti": "🇭🇹",
  "Dominican Republic": "🇩🇴",
  
  // Asia
  "China": "🇨🇳",
  "Japan": "🇯🇵",
  "South Korea": "🇰🇷",
  "India": "🇮🇳",
  "Pakistan": "🇵🇰",
  "Bangladesh": "🇧🇩",
  "Indonesia": "🇮🇩",
  "Malaysia": "🇲🇾",
  "Singapore": "🇸🇬",
  "Thailand": "🇹🇭",
  "Vietnam": "🇻🇳",
  "Philippines": "🇵🇭",
  "Myanmar": "🇲🇲",
  "Cambodia": "🇰🇭",
  "Laos": "🇱🇦",
  "Afghanistan": "🇦🇫",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "Saudi Arabia": "🇸🇦",
  "UAE": "🇦🇪",
  "Israel": "🇮🇱",
  "Jordan": "🇯🇴",
  "Lebanon": "🇱🇧",
  "Syria": "🇸🇾",
  "Turkey": "🇹🇷",
  "Kuwait": "🇰🇼",
  "Qatar": "🇶🇦",
  "Bahrain": "🇧🇭",
  "Oman": "🇴🇲",
  "Yemen": "🇾🇪",
  "Nepal": "🇳🇵",
  "Sri Lanka": "🇱🇰",
  
  // Oceania
  "Australia": "🇦🇺",
  "New Zealand": "🇳🇿",
  "Papua New Guinea": "🇵🇬",
  "Fiji": "🇫🇯",
};

/**
 * Extract country from phone number
 * Uses country code prefixes
 * 
 * @param {string} phonenumber - Phone number field from PersonData
 * @returns {string|null} - Country name or null
 */
export function getCountryFromPhoneNumber(phonenumber) {
  if (!phonenumber) return null;
  
  // Clean phone number - remove all non-digits
  const cleaned = phonenumber.replace(/\D/g, "");
  if (!cleaned) return null;
  
  // Try to match country codes (longest first)
  const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (cleaned.startsWith(code)) {
      return COUNTRY_CODES[code];
    }
  }
  
  return null;
}

/**
 * Extract country from address fields
 * Looks for country names in address1 or placeofbirth
 * 
 * @param {string} address - Address text
 * @returns {string|null} - Country name or null
 */
export function getCountryFromAddress(address) {
  if (!address) return null;
  
  const addressLower = address.toLowerCase().trim();
  
  // Common country keywords - EXPANDED
  const countryKeywords = {
    // Cameroon variations
    "cameroon": "Cameroon",
    "cameroun": "Cameroon",
    "cmr": "Cameroon",
    "cm": "Cameroon",
    "yaoundé": "Cameroon",
    "yaounde": "Cameroon",
    "douala": "Cameroon",
    "bafoussam": "Cameroon",
    "bamenda": "Cameroon",
    "garoua": "Cameroon",
    "maroua": "Cameroon",
    "ngaoundéré": "Cameroon",
    "bertoua": "Cameroon",
    "buea": "Cameroon",
    "limbe": "Cameroon",
    "kribi": "Cameroon",
    "edea": "Cameroon",
    
    // France
    "france": "France",
    "french": "France",
    "paris": "France",
    "marseille": "France",
    "lyon": "France",
    "toulouse": "France",
    
    // Nigeria
    "nigeria": "Nigeria",
    "nigerian": "Nigeria",
    "lagos": "Nigeria",
    "abuja": "Nigeria",
    "kano": "Nigeria",
    "ibadan": "Nigeria",
    "port harcourt": "Nigeria",
    
    // Ghana
    "ghana": "Ghana",
    "ghanaian": "Ghana",
    "accra": "Ghana",
    "kumasi": "Ghana",
    
    // Kenya
    "kenya": "Kenya",
    "kenyan": "Kenya",
    "nairobi": "Kenya",
    "mombasa": "Kenya",
    
    // South Africa
    "south africa": "South Africa",
    "southafrica": "South Africa",
    "johannesburg": "South Africa",
    "cape town": "South Africa",
    "capetown": "South Africa",
    "durban": "South Africa",
    "pretoria": "South Africa",
    
    // USA/Canada
    "usa": "USA/Canada",
    "united states": "USA/Canada",
    "america": "USA/Canada",
    "canada": "USA/Canada",
    "new york": "USA/Canada",
    "california": "USA/Canada",
    "toronto": "USA/Canada",
    
    // UK
    "uk": "UK",
    "united kingdom": "UK",
    "england": "UK",
    "london": "UK",
    "manchester": "UK",
    
    // Germany
    "germany": "Germany",
    "deutschland": "Germany",
    "berlin": "Germany",
    "munich": "Germany",
    "hamburg": "Germany",
    
    // Other African countries
    "senegal": "Senegal",
    "dakar": "Senegal",
    "ivory coast": "Ivory Coast",
    "cote d'ivoire": "Ivory Coast",
    "abidjan": "Ivory Coast",
    "mali": "Mali",
    "bamako": "Mali",
    "burkina faso": "Burkina Faso",
    "ouagadougou": "Burkina Faso",
    "niger": "Niger",
    "niamey": "Niger",
    "chad": "Chad",
    "tchad": "Chad",
    "n'djamena": "Chad",
    "gabon": "Gabon",
    "libreville": "Gabon",
    "congo": "Republic of Congo",
    "brazzaville": "Republic of Congo",
    "kinshasa": "DR Congo",
    "ethiopia": "Ethiopia",
    "addis ababa": "Ethiopia",
    "tanzania": "Tanzania",
    "dar es salaam": "Tanzania",
    "uganda": "Uganda",
    "kampala": "Uganda",
    "rwanda": "Rwanda",
    "kigali": "Rwanda",
    "burundi": "Burundi",
    "bujumbura": "Burundi",
  };
  
  // Try exact matches first
  for (const [keyword, country] of Object.entries(countryKeywords)) {
    if (addressLower === keyword || addressLower.includes(keyword)) {
      return country;
    }
  }
  
  return null;
}

/**
 * MAIN FUNCTION: Get country from PersonData record
 * Tries multiple sources in order:
 * 1. country field (direct) - with normalization
 * 2. phonenumber field (extract from country code)
 * 3. address1 field (look for country keywords)
 * 4. placeofbirth field (look for country keywords)
 * 
 * @param {Object} record - PersonData object with fields:
 *   - country
 *   - phonenumber (NOT "phone")
 *   - address1
 *   - placeofbirth
 * @returns {string|null} - Country name or null
 */
export function getCountryFromRecord(record) {
  if (!record) return null;
  
  // 1. Try direct country field with normalization
  if (record.country && record.country.trim()) {
    const normalized = normalizeCountryName(record.country.trim());
    if (normalized) return normalized;
  }
  
  // 2. Try extracting from phone number (field is "phonenumber")
  const phoneCountry = getCountryFromPhoneNumber(record.phonenumber);
  if (phoneCountry) {
    return phoneCountry;
  }
  
  // 3. Try address1 field
  const address1Country = getCountryFromAddress(record.address1);
  if (address1Country) {
    return address1Country;
  }
  
  // 4. Try placeofbirth as fallback
  const birthCountry = getCountryFromAddress(record.placeofbirth);
  if (birthCountry) {
    return birthCountry;
  }
  
  return null;
}

/**
 * Normalize country names to match our flag mapping
 * Handles variations, abbreviations, and ISO codes
 * 
 * @param {string} country - Raw country name from database
 * @returns {string} - Normalized country name
 */
function normalizeCountryName(country) {
  if (!country) return null;
  
  const normalized = country.toLowerCase().trim();
  
  // Map variations to standard names (EXPANDED with ISO codes)
  const countryMap = {
    // Cameroon variations
    "cameroon": "Cameroon",
    "cameroun": "Cameroon",
    "cmr": "Cameroon",
    "cm": "Cameroon",
    "republic of cameroon": "Cameroon",
    
    // France
    "france": "France",
    "fr": "France",
    "fra": "France",
    "french republic": "France",
    
    // Nigeria
    "nigeria": "Nigeria",
    "ng": "Nigeria",
    "nga": "Nigeria",
    "ngn": "Nigeria",
    
    // USA/Canada
    "usa": "USA/Canada",
    "us": "USA/Canada",
    "united states": "USA/Canada",
    "united states of america": "USA/Canada",
    "america": "USA/Canada",
    "canada": "Canada",
    "ca": "Canada",
    "can": "Canada",
    
    // UK
    "uk": "UK",
    "gb": "UK",
    "gbr": "UK",
    "united kingdom": "UK",
    "great britain": "UK",
    "england": "UK",
    "scotland": "UK",
    "wales": "UK",
    
    // Germany
    "germany": "Germany",
    "de": "Germany",
    "deu": "Germany",
    "deutschland": "Germany",
    
    // South Africa
    "south africa": "South Africa",
    "southafrica": "South Africa",
    "za": "South Africa",
    "zaf": "South Africa",
    "rsa": "South Africa",
    
    // Ghana
    "ghana": "Ghana",
    "gh": "Ghana",
    "gha": "Ghana",
    
    // Kenya
    "kenya": "Kenya",
    "ke": "Kenya",
    "ken": "Kenya",
    
    // Egypt
    "egypt": "Egypt",
    "eg": "Egypt",
    "egy": "Egypt",
    
    // Morocco
    "morocco": "Morocco",
    "ma": "Morocco",
    "mar": "Morocco",
    
    // Algeria
    "algeria": "Algeria",
    "dz": "Algeria",
    "dza": "Algeria",
    
    // Tunisia
    "tunisia": "Tunisia",
    "tn": "Tunisia",
    "tun": "Tunisia",
    
    // Other African countries
    "senegal": "Senegal",
    "sn": "Senegal",
    "sen": "Senegal",
    "ivory coast": "Ivory Coast",
    "cote d'ivoire": "Ivory Coast",
    "ci": "Ivory Coast",
    "civ": "Ivory Coast",
    "mali": "Mali",
    "ml": "Mali",
    "mli": "Mali",
    "burkina faso": "Burkina Faso",
    "bf": "Burkina Faso",
    "bfa": "Burkina Faso",
    "niger": "Niger",
    "ne": "Niger",
    "ner": "Niger",
    "chad": "Chad",
    "td": "Chad",
    "tcd": "Chad",
    "tchad": "Chad",
    "gabon": "Gabon",
    "ga": "Gabon",
    "gab": "Gabon",
    "congo": "Republic of Congo",
    "republic of congo": "Republic of Congo",
    "cg": "Republic of Congo",
    "cog": "Republic of Congo",
    "dr congo": "DR Congo",
    "drc": "DR Congo",
    "democratic republic of congo": "DR Congo",
    "cd": "DR Congo",
    "cod": "DR Congo",
    "ethiopia": "Ethiopia",
    "et": "Ethiopia",
    "eth": "Ethiopia",
    "tanzania": "Tanzania",
    "tz": "Tanzania",
    "tza": "Tanzania",
    "uganda": "Uganda",
    "ug": "Uganda",
    "uga": "Uganda",
    "rwanda": "Rwanda",
    "rw": "Rwanda",
    "rwa": "Rwanda",
    "burundi": "Burundi",
    "bi": "Burundi",
    "bdi": "Burundi",
    "mozambique": "Mozambique",
    "mz": "Mozambique",
    "moz": "Mozambique",
    "zimbabwe": "Zimbabwe",
    "zw": "Zimbabwe",
    "zwe": "Zimbabwe",
    "zambia": "Zambia",
    "zm": "Zambia",
    "zmb": "Zambia",
    "malawi": "Malawi",
    "mw": "Malawi",
    "mwi": "Malawi",
    "botswana": "Botswana",
    "bw": "Botswana",
    "bwa": "Botswana",
    "namibia": "Namibia",
    "na": "Namibia",
    "nam": "Namibia",
    "angola": "Angola",
    "ao": "Angola",
    "ago": "Angola",
    "somalia": "Somalia",
    "so": "Somalia",
    "som": "Somalia",
    "sudan": "Sudan",
    "sd": "Sudan",
    "sdn": "Sudan",
    "liberia": "Liberia",
    "lr": "Liberia",
    "lbr": "Liberia",
    "sierra leone": "Sierra Leone",
    "sl": "Sierra Leone",
    "sle": "Sierra Leone",
    "guinea": "Guinea",
    "gn": "Guinea",
    "gin": "Guinea",
    "togo": "Togo",
    "tg": "Togo",
    "tgo": "Togo",
    "benin": "Benin",
    "bj": "Benin",
    "ben": "Benin",
    
    // European countries
    "italy": "Italy",
    "it": "Italy",
    "ita": "Italy",
    "spain": "Spain",
    "es": "Spain",
    "esp": "Spain",
    "portugal": "Portugal",
    "pt": "Portugal",
    "prt": "Portugal",
    "netherlands": "Netherlands",
    "nl": "Netherlands",
    "nld": "Netherlands",
    "belgium": "Belgium",
    "be": "Belgium",
    "bel": "Belgium",
    "switzerland": "Switzerland",
    "ch": "Switzerland",
    "che": "Switzerland",
    
    // Asian countries
    "china": "China",
    "cn": "China",
    "chn": "China",
    "japan": "Japan",
    "jp": "Japan",
    "jpn": "Japan",
    "india": "India",
    "in": "India",
    "ind": "India",
    "south korea": "South Korea",
    "korea": "South Korea",
    "kr": "South Korea",
    "kor": "South Korea",
    
    // Americas
    "brazil": "Brazil",
    "br": "Brazil",
    "bra": "Brazil",
    "mexico": "Mexico",
    "mx": "Mexico",
    "mex": "Mexico",
    "argentina": "Argentina",
    "ar": "Argentina",
    "arg": "Argentina",
    "chile": "Chile",
    "cl": "Chile",
    "chl": "Chile",
    "colombia": "Colombia",
    "co": "Colombia",
    "col": "Colombia",
    "peru": "Peru",
    "pe": "Peru",
    "per": "Peru",
    "venezuela": "Venezuela",
    "ve": "Venezuela",
    "ven": "Venezuela",
    
    // Oceania
    "australia": "Australia",
    "au": "Australia",
    "aus": "Australia",
    "new zealand": "New Zealand",
    "nz": "New Zealand",
    "nzl": "New Zealand",
  };
  
  const mapped = countryMap[normalized];
  if (mapped) {
    console.log(`🗺️  Mapped "${country}" → "${mapped}"`);
    return mapped;
  }
  
  // Return original if no mapping found (will use globe emoji)
  console.log(`⚠️  No mapping for "${country}"`);
  return country;
}

/**
 * Get flag emoji for a country
 * 
 * @param {string} country - Country name
 * @returns {string} - Flag emoji or 🌍 default
 */
export function getCountryFlag(country) {
  if (!country) return "🌍";
  return COUNTRY_FLAGS[country] || "🌍";
}

/**
 * Format phone number for display
 * Adds spaces and formatting for better readability
 * 
 * @param {string} phonenumber - Raw phone number
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phonenumber) {
  if (!phonenumber) return "";
  
  // Remove all non-digits
  const cleaned = phonenumber.replace(/\D/g, "");
  if (!cleaned) return phonenumber;
  
  // Try to identify country code and format accordingly
  // Format: +XXX XXX XXX XXX
  
  // If starts with common country codes, format with country code
  if (cleaned.startsWith("237")) {
    // Cameroon: +237 6XX XXX XXX
    return `+237 ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`.trim();
  } else if (cleaned.startsWith("33")) {
    // France: +33 X XX XX XX XX
    return `+33 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`.trim();
  } else if (cleaned.startsWith("234")) {
    // Nigeria: +234 XXX XXX XXXX
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`.trim();
  } else if (cleaned.startsWith("1")) {
    // USA/Canada: +1 XXX XXX XXXX
    return `+1 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`.trim();
  } else if (cleaned.startsWith("44")) {
    // UK: +44 XXXX XXXXXX
    return `+44 ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`.trim();
  }
  
  // Generic formatting for other countries
  // Format as: +XXX XXX XXX XXX
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 9);
    const rest = cleaned.slice(-9);
    return `+${countryCode} ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`.trim();
  }
  
  // If no country code detected, just add spaces every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ");
}