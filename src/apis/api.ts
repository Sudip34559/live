import api from "./axiosInstance";

export const getPlans = async () => {
  return await api.get("/plans/display/all");
};
export const createQuickRoom = async ({
  title,
  roomType,
}: {
  title: string;
  roomType: string;
}) => {
  return await api.post("/room/quick-create", {
    title,
    roomType,
  });
};

export const getCurrencyFromIP = async () => {
  try {
    const res = await fetch("https://ipwho.is/");
    const { country_code } = await res.json();
    console.log(country_code);

    const currencyMapping: any = {
      // EUR countries (Eurozone)
      AD: "EUR", // Andorra
      AT: "EUR", // Austria
      BE: "EUR", // Belgium
      CY: "EUR", // Cyprus
      EE: "EUR", // Estonia
      FI: "EUR", // Finland
      FR: "EUR", // France
      DE: "EUR", // Germany
      GR: "EUR", // Greece
      IE: "EUR", // Ireland
      IT: "EUR", // Italy
      LV: "EUR", // Latvia
      LT: "EUR", // Lithuania
      LU: "EUR", // Luxembourg
      MT: "EUR", // Malta
      MC: "EUR", // Monaco
      NL: "EUR", // Netherlands
      PT: "EUR", // Portugal
      SM: "EUR", // San Marino
      SK: "EUR", // Slovakia
      SI: "EUR", // Slovenia
      ES: "EUR", // Spain
      VA: "EUR", // Vatican City
      HR: "EUR", // Croatia

      // INR countries
      IN: "INR", // India
      BT: "INR", // Bhutan (also uses INR alongside their currency)

      // USD countries
      US: "USD", // United States
      AS: "USD", // American Samoa
      BQ: "USD", // Bonaire, Sint Eustatius and Saba
      IO: "USD", // British Indian Ocean Territory
      EC: "USD", // Ecuador
      SV: "USD", // El Salvador
      GU: "USD", // Guam
      HT: "USD", // Haiti (alongside Gourde)
      MH: "USD", // Marshall Islands
      FM: "USD", // Micronesia
      MP: "USD", // Northern Mariana Islands
      PW: "USD", // Palau
      PA: "USD", // Panama (alongside Balboa)
      PR: "USD", // Puerto Rico
      TL: "USD", // Timor-Leste
      TC: "USD", // Turks and Caicos Islands
      VI: "USD", // U.S. Virgin Islands
      VG: "USD", // British Virgin Islands
      ZW: "USD", // Zimbabwe
    };

    const currency = currencyMapping[country_code] || "USD";

    console.log(` Currency: ${currency}`);
    return currency;
  } catch (error) {
    console.error("Error fetching currency:", error);
    return "USD"; // fallback
  }
};
