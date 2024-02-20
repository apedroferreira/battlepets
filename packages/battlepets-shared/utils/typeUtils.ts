export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type EnhancedOmit<T, K> = string extends keyof T ? T : T extends unknown ? Pick<T, Exclude<keyof T, K>> : never
