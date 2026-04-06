// Country to flag emoji mapping
// This utility converts country names to their respective flag emojis

const countryToCode: Record<string, string> = {
  // Africa
  "algeria": "DZ",
  "angola": "AO",
  "benin": "BJ",
  "botswana": "BW",
  "burkina faso": "BF",
  "burundi": "BI",
  "cameroon": "CM",
  "cameroun": "CM",
  "cape verde": "CV",
  "central african republic": "CF",
  "chad": "TD",
  "comoros": "KM",
  "congo": "CG",
  "democratic republic of congo": "CD",
  "drc": "CD",
  "cote d'ivoire": "CI",
  "ivory coast": "CI",
  "djibouti": "DJ",
  "egypt": "EG",
  "equatorial guinea": "GQ",
  "eritrea": "ER",
  "eswatini": "SZ",
  "swaziland": "SZ",
  "ethiopia": "ET",
  "gabon": "GA",
  "gambia": "GM",
  "ghana": "GH",
  "guinea": "GN",
  "guinea-bissau": "GW",
  "kenya": "KE",
  "lesotho": "LS",
  "liberia": "LR",
  "libya": "LY",
  "madagascar": "MG",
  "malawi": "MW",
  "mali": "ML",
  "mauritania": "MR",
  "mauritius": "MU",
  "morocco": "MA",
  "mozambique": "MZ",
  "namibia": "NA",
  "niger": "NE",
  "nigeria": "NG",
  "rwanda": "RW",
  "sao tome and principe": "ST",
  "senegal": "SN",
  "seychelles": "SC",
  "sierra leone": "SL",
  "somalia": "SO",
  "south africa": "ZA",
  "south sudan": "SS",
  "sudan": "SD",
  "tanzania": "TZ",
  "togo": "TG",
  "tunisia": "TN",
  "uganda": "UG",
  "zambia": "ZM",
  "zimbabwe": "ZW",
  
  // Europe
  "albania": "AL",
  "andorra": "AD",
  "armenia": "AM",
  "austria": "AT",
  "azerbaijan": "AZ",
  "belarus": "BY",
  "belgium": "BE",
  "bosnia and herzegovina": "BA",
  "bulgaria": "BG",
  "croatia": "HR",
  "cyprus": "CY",
  "czech republic": "CZ",
  "czechia": "CZ",
  "denmark": "DK",
  "estonia": "EE",
  "finland": "FI",
  "france": "FR",
  "georgia": "GE",
  "germany": "DE",
  "greece": "GR",
  "hungary": "HU",
  "iceland": "IS",
  "ireland": "IE",
  "italy": "IT",
  "kazakhstan": "KZ",
  "kosovo": "XK",
  "latvia": "LV",
  "liechtenstein": "LI",
  "lithuania": "LT",
  "luxembourg": "LU",
  "malta": "MT",
  "moldova": "MD",
  "monaco": "MC",
  "montenegro": "ME",
  "netherlands": "NL",
  "north macedonia": "MK",
  "macedonia": "MK",
  "norway": "NO",
  "poland": "PL",
  "portugal": "PT",
  "romania": "RO",
  "russia": "RU",
  "russian federation": "RU",
  "san marino": "SM",
  "serbia": "RS",
  "slovakia": "SK",
  "slovenia": "SI",
  "spain": "ES",
  "sweden": "SE",
  "switzerland": "CH",
  "turkey": "TR",
  "ukraine": "UA",
  "united kingdom": "GB",
  "uk": "GB",
  "great britain": "GB",
  "england": "GB",
  "scotland": "GB",
  "wales": "GB",
  "vatican city": "VA",
  
  // Americas
  "antigua and barbuda": "AG",
  "argentina": "AR",
  "bahamas": "BS",
  "barbados": "BB",
  "belize": "BZ",
  "bolivia": "BO",
  "brazil": "BR",
  "canada": "CA",
  "chile": "CL",
  "colombia": "CO",
  "costa rica": "CR",
  "cuba": "CU",
  "dominica": "DM",
  "dominican republic": "DO",
  "ecuador": "EC",
  "el salvador": "SV",
  "grenada": "GD",
  "guatemala": "GT",
  "guyana": "GY",
  "haiti": "HT",
  "honduras": "HN",
  "jamaica": "JM",
  "mexico": "MX",
  "nicaragua": "NI",
  "panama": "PA",
  "paraguay": "PY",
  "peru": "PE",
  "puerto rico": "PR",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint vincent and the grenadines": "VC",
  "suriname": "SR",
  "trinidad and tobago": "TT",
  "united states": "US",
  "usa": "US",
  "us": "US",
  "america": "US",
  "uruguay": "UY",
  "venezuela": "VE",
  
  // Asia
  "afghanistan": "AF",
  "bahrain": "BH",
  "bangladesh": "BD",
  "bhutan": "BT",
  "brunei": "BN",
  "cambodia": "KH",
  "china": "CN",
  "hong kong": "HK",
  "india": "IN",
  "indonesia": "ID",
  "iran": "IR",
  "iraq": "IQ",
  "israel": "IL",
  "japan": "JP",
  "jordan": "JO",
  "kuwait": "KW",
  "kyrgyzstan": "KG",
  "laos": "LA",
  "lebanon": "LB",
  "macau": "MO",
  "malaysia": "MY",
  "maldives": "MV",
  "mongolia": "MN",
  "myanmar": "MM",
  "burma": "MM",
  "nepal": "NP",
  "north korea": "KP",
  "oman": "OM",
  "pakistan": "PK",
  "palestine": "PS",
  "philippines": "PH",
  "qatar": "QA",
  "saudi arabia": "SA",
  "singapore": "SG",
  "south korea": "KR",
  "korea": "KR",
  "sri lanka": "LK",
  "syria": "SY",
  "taiwan": "TW",
  "tajikistan": "TJ",
  "thailand": "TH",
  "timor-leste": "TL",
  "east timor": "TL",
  "turkmenistan": "TM",
  "united arab emirates": "AE",
  "uae": "AE",
  "uzbekistan": "UZ",
  "vietnam": "VN",
  "yemen": "YE",
  
  // Oceania
  "australia": "AU",
  "fiji": "FJ",
  "kiribati": "KI",
  "marshall islands": "MH",
  "micronesia": "FM",
  "nauru": "NR",
  "new zealand": "NZ",
  "palau": "PW",
  "papua new guinea": "PG",
  "samoa": "WS",
  "solomon islands": "SB",
  "tonga": "TO",
  "tuvalu": "TV",
  "vanuatu": "VU"
};

/**
 * Convert country code to flag emoji
 * Uses regional indicator symbols to create flag emojis
 */
function codeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "🏳️";
  }
  
  const code = countryCode.toUpperCase();
  const offset = 127397; // Regional Indicator Symbol offset
  
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

/**
 * Get flag emoji for a country name
 * @param country - Country name (case insensitive)
 * @returns Flag emoji or default flag if not found
 */
export function getCountryFlag(country: string | null | undefined): string {
  if (!country) {
    return "🏳️";
  }
  
  const normalizedCountry = country.toLowerCase().trim();
  const code = countryToCode[normalizedCountry];
  
  if (code) {
    return codeToFlag(code);
  }
  
  // Try partial match for compound names
  for (const [name, countryCode] of Object.entries(countryToCode)) {
    if (normalizedCountry.includes(name) || name.includes(normalizedCountry)) {
      return codeToFlag(countryCode);
    }
  }
  
  return "🏳️"; // Default flag
}

/**
 * Get country name with flag emoji
 * @param country - Country name
 * @returns Country name prefixed with flag emoji
 */
export function getCountryWithFlag(country: string | null | undefined): string {
  if (!country) {
    return "🏳️ Unknown";
  }
  
  const flag = getCountryFlag(country);
  return `${flag} ${country}`;
}

/**
 * Get just the country code from a country name
 * @param country - Country name
 * @returns ISO 3166-1 alpha-2 country code or null
 */
export function getCountryCode(country: string | null | undefined): string | null {
  if (!country) {
    return null;
  }
  
  const normalizedCountry = country.toLowerCase().trim();
  return countryToCode[normalizedCountry] || null;
}

export default getCountryFlag;
