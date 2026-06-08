export type CartItem = {
  product_id: string
  name: string
  brand: string
  price_eur: number
  image: string
  quantity: number
}

export type CartState = {
  items: CartItem[]
}
