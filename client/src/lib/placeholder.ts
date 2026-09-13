export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23eee8db'/%3E%3Cg fill='none' stroke='%23c6bda9' stroke-width='2'%3E%3Crect x='120' y='140' width='160' height='120' rx='4'/%3E%3Cpath d='M120 230 L170 180 L210 220 L240 190 L280 230'/%3E%3Ccircle cx='155' cy='170' r='12'/%3E%3C/g%3E%3C/svg%3E";

export const productImage = (imageUrl: string | undefined | null) =>
  imageUrl || PLACEHOLDER_IMAGE;
