import qs from "qs";

import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";

import { aspectRatioOptions } from "@/constants";

// ========== CLASSNAMES MERGER ==========
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== ERROR HANDLER ==========
export const handleError = (error: unknown): never => {
  if (error instanceof Error) {
    console.error(error.message);
    throw new Error(`Error: ${error.message}`);
  } else if (typeof error === "string") {
    console.error(error);
    throw new Error(`Error: ${error}`);
  } else {
    console.error(error);
    throw new Error(`Unknown error: ${JSON.stringify(error)}`);
  }
};

// ========== SHIMMER PLACEHOLDER ==========
const shimmer = (w: number, h: number): string => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
</svg>`;

const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export const dataUrl = `data:image/svg+xml;base64,${toBase64(
  shimmer(1000, 1000)
)}`;

// ========== FORM URL QUERY ==========
interface FormUrlQueryParams {
  searchParams: URLSearchParams;
  key: string;
  value: string;
}

export const formUrlQuery = ({
  searchParams,
  key,
  value,
}: FormUrlQueryParams): string => {
  const params = { ...qs.parse(searchParams.toString()), [key]: value };

  return `${window.location.pathname}?${qs.stringify(params, {
    skipNulls: true,
  })}`;
};

// ========== REMOVE KEYS FROM QUERY ==========
interface RemoveUrlQueryParams {
  searchParams: string;
  keysToRemove: string[];
}

export function removeKeysFromQuery({
  searchParams,
  keysToRemove,
}: RemoveUrlQueryParams): string {
  const currentUrl = qs.parse(searchParams);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  Object.keys(currentUrl).forEach(
    (key) => currentUrl[key] == null && delete currentUrl[key]
  );

  return `${window.location.pathname}?${qs.stringify(currentUrl)}`;
}

// ========== DEBOUNCE ==========
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ========== GET IMAGE SIZE ==========
export type AspectRatioKey = keyof typeof aspectRatioOptions;

interface ImageData {
  aspectRatio?: string;
  width?: number;
  height?: number;
}

export const getImageSize = (
  type: string,
  image: ImageData,
  dimension: "width" | "height"
): number => {
  if (type === "fill") {
    return (
      aspectRatioOptions[image.aspectRatio as AspectRatioKey]?.[dimension] ||
      1000
    );
  }
  return image?.[dimension] || 1000;
};

// ========== DOWNLOAD IMAGE ==========
export const download = (url: string, filename: string): void => {
  if (!url) {
    throw new Error("Resource URL not provided! You need to provide one");
  }

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;

      if (filename && filename.length) {
        a.download = `${filename.replace(/\s+/g, "_")}.png`;
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    })
    .catch((error) => console.log({ error }));
};

// ========== DEEP MERGE OBJECTS ==========
type PlainObject = Record<string, unknown>;

const isObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function deepMergeObjects<T extends PlainObject>(
  obj1: T,
  obj2: Partial<T>
): T {
  const output = { ...obj1 }; // start from obj1

  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj2, key)) {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (isObject(val1) && isObject(val2)) {
        output[key] = deepMergeObjects(
          val1 as PlainObject,
          val2 as PlainObject
        ) as T[typeof key];
      } else if (val2 !== undefined) {
        output[key] = val2 as T[typeof key];
      }
    }
  }

  return output;
}
