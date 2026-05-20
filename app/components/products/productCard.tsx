import React from 'react'
import AddToCart from './addToCart';

const ProductCard = () => {
  return (
    <div className='p-1.5 my-6 bg-sky-700 text-white text-xl hover:bg-sky-200'>
      <AddToCart />
    </div>
  )
}

export default ProductCard
