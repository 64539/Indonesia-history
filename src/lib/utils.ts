import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getGradeSlug(grade: string | number | undefined): string {
  if (!grade) return "umum";
  const gradeStr = String(grade).toLowerCase();
  
  if (gradeStr.includes("10") || gradeStr.includes("x") && !gradeStr.includes("xi")) return "kelas-x";
  if (gradeStr.includes("11") || gradeStr.includes("xi") && !gradeStr.includes("xii")) return "kelas-xi";
  if (gradeStr.includes("12") || gradeStr.includes("xii")) return "kelas-xii";
  
  return "umum";
}
