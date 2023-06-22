import { useMemo } from "react";
import { useMatches } from "@remix-run/react";
import type { User } from "./models/user.server";
import moment from "moment";


export function useMatchesData(id: string) {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );

  return route?.data;
}

export function isUser(user: User) {
  return user && typeof user === "object";
}

export function useOptionalUser() {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

function findDateFormat(dates: string[]): string {
  // Possible date formats to test
  const formats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'DD.MM.YYYY', 'MM.DD.YYYY'];
  
  // This object will track how many dates match each format
  let formatMatches: {[key: string]: number} = {};
  for (let format of formats) formatMatches[format] = 0;

  // Iterate through the dates
  for (let date of dates) {
    // Test each format
    for (let format of formats) {
      // If the date is valid with this format, increment the count
      if (moment(date, format, true).isValid()) {
        formatMatches[format]++;
      }
    }
  }

  // Find the format with the most matches
  let mostMatches = 0;
  let bestFormat = null;
  for (let format of formats) {
    if (formatMatches[format] > mostMatches) {
      mostMatches = formatMatches[format];
      bestFormat = format;
    }
  }

  // If no format had any matches, return null
  if (mostMatches == 0) return "";

  // Otherwise, return the best format
  return bestFormat!;
}

export function convertDates(dates: string[]): Date[] | null {
  // Find the format of the dates
  let format = findDateFormat(dates);
  
  // If no format could be determined, return an array of empty strings
  if (format === null) return null;

  // Otherwise, convert the dates to the desired format
  let convertedDates = dates.map(date => {
    // If the date is valid with the determined format, convert it to the desired format
    if (moment(date, format, true).isValid()) {
      return moment(date, format).toDate();
    } else {
      // If the date is invalid with the determined format, return an empty string
      return null;
    }
  });
  
  return convertedDates.includes(null) ? null : convertedDates as Date[];
}
