export const SUPPORTED_ALGORITHMS = ["sha256", "md5", "sha512"];

export const ALGORITHM = "aes-256-gcm";
export const KEY_LENGTH = 32;
export const IV_LENGTH = 12;
export const SALT_LENGTH = 16;
export const AUTH_TAG_LENGTH = 16;
export const HEADER_LENGTH = SALT_LENGTH + IV_LENGTH;
