import type { ProductCapability } from "./ProductCapability.js"

export interface SemanticProduct {
readonly id: string
readonly name: string
readonly model: string

readonly manufacturer: ProductManufacturer
readonly family?: ProductFamily
readonly productClass?: ProductClassReference

readonly functions: ProductFunction[]
readonly capabilities: ProductCapability[]
readonly characteristics: ProductCharacteristic[]
}

export interface ProductManufacturer {
readonly id: string
readonly name: string
}

export interface ProductFamily {
readonly id: string
readonly name: string
}

export interface ProductClassReference {
readonly id: string
readonly name: string
}

export interface ProductFunction {
readonly id: string
readonly name: string
}

export interface ProductCharacteristic {
readonly id: string
readonly name: string
readonly value: unknown
readonly unit?: string
}
