import hoodieImg from "@/assets/product-hoodie-1.jpg";
import tshirtImg from "@/assets/product-tshirt-1.jpg";
import capImg from "@/assets/product-cap-1.jpg";
import jacketImg from "@/assets/product-jacket-1.jpg";
import pantsImg from "@/assets/product-pants-1.jpg";
import backpackImg from "@/assets/product-backpack-1.jpg";

import homepageImg1 from "@/assets/homepage1.webp";

import homepageImg3 from "@/assets/homepage3.webp";
import finalkvImg from "@/assets/Final_KV__banner_desk_01.webp";
import activewearImg from "@/assets/ACTIVEWEAR_HOMEPAGE_BANNER.webp";
import homepage5 from"@/assets/5.webp";
import homepage6 from"@/assets/6.webp";
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Cosmic Hoodie",
    price: 3499,
    category: "Hoodies",
    description: "Premium black hoodie featuring an exclusive geometric gold logo design. Made from high-quality cotton blend for ultimate comfort and durability.",
    image: homepageImg1,
    images: [homepageImg1],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "2",
    name: "Essential Tee",
    price: 1299,
    category: "T-Shirts",
    description: "Classic black t-shirt with bold white typography. Perfect for everyday wear with a streetwear edge.",
    image: homepageImg3,
    images: [homepageImg3],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "3",
    name: "Luxury Cap",
    price: 1799,
    category: "Accessories",
    description: "Premium snapback cap with embroidered gold logo. Adjustable fit for maximum comfort.",
    image: homepage5,
    images: [homepage5],
    sizes: ["One Size"],
    colors: ["Black"],
  },
  {
    id: "4",
    name: "Bomber Jacket",
    price: 5999,
    category: "Jackets",
    description: "Sleek black bomber jacket with gold zipper details. Perfect for layering and making a statement.",
    image: finalkvImg,
    images: [finalkvImg],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "5",
    name: "Premium Joggers",
    price: 2799,
    category: "Bottoms",
    description: "Comfortable black jogger pants with gold drawstring details. Modern streetwear essential.",
    image: activewearImg,
    images: [activewearImg],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  },
  {
    id: "6",
    name: "Co-ord Set",
    price: 2799,
    category: "Co-ord Sets",
    description: "Comfortable black jogger pants with gold drawstring details. Modern streetwear essential.",
    image: homepage6,
    images: [homepage6],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"],
  }
];
