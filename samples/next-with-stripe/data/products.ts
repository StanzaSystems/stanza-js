import { type Product } from './product';

const product: Product[] = [
  {
    name: 'Bananas',
    description: 'Yummy yellow fruit',
    id: 'sku_GBJ2Ep8246qeeT',
    price: 400,
    image:
      'https://images.unsplash.com/photo-1574226516831-e1dff420e562?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=225&q=80',
    attribution: 'Photo by Priscilla Du Preez on Unsplash',
    currency: 'USD',
    tags: ['featured'],
  },
  {
    name: 'Tangerines',
    id: 'sku_GBJ2WWfMaGNC2Z',
    price: 100,
    image:
      'https://images.unsplash.com/photo-1482012792084-a0c3725f289f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=225&q=80',
    attribution: 'Photo by Jonathan Pielmayer on Unsplash',
    currency: 'USD',
    tags: [],
  },
  {
    name: 'Apples',
    id: 'sku_GBJ2WWfMaGNC2f',
    price: 80,
    image:
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwbGUlMjBmcnVpdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=225&q=60',
    attribution: 'Photo by Amit Lahav on Unsplash',
    currency: 'USD',
    tags: ['featured'],
  },
  {
    name: 'Pineapples',
    id: 'sku_GBJ2WWfMaGWFRd',
    price: 380,
    image:
      'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cGluZWFwcGxlJTIwZnJ1aXR8ZW58MHx8MHx8&auto=format&fit=crop&w=225&q=60',
    attribution: 'Photo by Julien Pianetti on Unsplash',
    currency: 'USD',
    tags: [],
  },
];
export default product;
