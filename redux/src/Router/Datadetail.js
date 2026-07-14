let DATAS=[

  {
    id: 1,
    title: "Chicken Burger",
    price: 24,
    category: "Burger",
    image: "https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg" // Replace with actual image URL or import
  },
  {
    id: 2,
    title: "Vegetarian Pizza",
    price: 115,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_2.1.f15385546f60c8d0f0d9.jpg"
  },
  {
    id: 3,
    title: "Double Cheese Margherita",
    price: 110,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_3.1.9c207cdf68c9700b11ce.jpg"
  },
  {
    id: 4,
    title: "Maxican Green Wave",
    price: 110,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_4.1.3c8ecc492220a3922731.jpg"
  },
  {
    id: 5,
    title: "Cheese Burger",
    price: 24,
    category: "Burger",
    image: "https://react-food-project-five.vercel.app/static/media/product_04.f7c5294d0481fb12cc4c.jpg"
  },
  {
    id: 6,
    title: "Royal Cheese Burger",
    price: 24,
    category: "Burger",
    image: "https://react-food-project-five.vercel.app/static/media/product_01.6be97a612b580d595585.jpg"
  },
  {
    id: 7,
    title: "Seafood Pizza",
    price: 115,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_2.2.4967c9cbe3fec366a31a.jpg"
  },
  {
    id: 8,
    title: "Thin Cheese Pizza",
    price: 110,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_3.2.ebcb16b50e4ef0060a5e.jpg"
  },
  {
    id: 9,
    title: "Pizza With Mushroom",
    price: 110,
    category: "Pizza",
    image: "https://react-food-project-five.vercel.app/static/media/product_4.2.e82e43e0a3fc5dab999e.jpg"
  },
  {
    id: 10,
    title: "Classic Hamburger",
    price: 24,
    category: "Burger",
    image: "https://react-food-project-five.vercel.app/static/media/product_08.efc6c71968cf3ffe817a.jpg"
  },
  {
    id: 11,
    title: "Crunchy Bread",
    price: 35,
    category: "Snacks",
    image: "https://react-food-project-five.vercel.app/static/media/bread(1).2fbb5c91c696e21efcb6.png"
  },
  {
    id: 12,
    title: "Delicious Bread",
    price: 35,
    category: "Snacks",
    image: "https://react-food-project-five.vercel.app/static/media/bread(2).dd485726262fc6f94474.png"
  },
  {
    id: 13,
    title: "Loaf Bread",
    price: 35,
    category: "Snacks",
    image: "https://react-food-project-five.vercel.app/static/media/bread(3).e4b9fdd91579778ae4cc.png"
  },
  {
    id: 14,
    title: "Red Bull",
    price: 35,
    category: "Drink",
    image: "https://react-food-project-five.vercel.app/static/media/bread(3).e4b9fdd91579778ae4cc.png"
  },
  
]
let pizzaData = [
  {
    id: 1,
    title: "Vegetarian Pizza",
    price: 115,
    image: "https://react-food-project-five.vercel.app/static/media/product_2.1.f15385546f60c8d0f0d9.jpg",
  },
  {
    id: 2,
    title: "Double Cheese Margherita",
    price: 110,
    image: "/images/cheese-margherita.jpg",
  },
  {
    id: 3,
    title: "Maxican Green Wave",
    price: 110,
    image: "/images/green-wave.jpg",
  },
  {
    id: 4,
    title: "Seafood Pizza",
    price: 115,
    image: "/images/seafood-pizza.jpg",
  }
];

 pizzaData = DATAS.filter(item => item.category === 'Pizza').slice(0, 4);
 pizzaData=pizzaData.map((hh)=>({...hh,quantity:1}))
console.log(pizzaData);

export { pizzaData };





DATAS=DATAS.map((hh)=>({...hh,quantity:1}))
console.log(DATAS);


export default DATAS