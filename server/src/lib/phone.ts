import { parsePhoneNumberFromString } from "libphonenumber-js/max";

export type PhoneCheck =
  | { ok: true; e164: string; country: string }
  | { ok: false; reason: "invalid" | "not_mobile" | "country_not_allowed" };

/** Validates a phone number and returns it in E.164 form (+919876543210). */
/** Pass "any" to accept a valid mobile number from any country. */
export function checkPhone(dialCode: string, local: string, allowedCountries: string[] | "any"): PhoneCheck {
  const digits = local.replace(/[^0-9]/g, "").replace(/^0+/, "");
  const parsed = parsePhoneNumberFromString(`${dialCode}${digits}`);
  if (!parsed || !parsed.isValid()) return { ok: false, reason: "invalid" };
  const type = parsed.getType();
  if (type && type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") return { ok: false, reason: "not_mobile" };
  const country = parsed.country ?? "";
  if (allowedCountries !== "any" && !allowedCountries.includes(country)) return { ok: false, reason: "country_not_allowed" };
  return { ok: true, e164: parsed.number, country };
}
