export const ethToUsd = 3200;

const wh1000xm6Images = [
  "/products/WH1000XM6_Product_intro_01_M.webp",
  "/products/WH1000XM6_Product_intro_02_M.webp",
  "/products/WH1000XM6_Product_intro_03_M.webp",
  "/products/WH1000XM6_Product_intro_04_M.webp",
  "/products/WH1000XM6_Product_intro_05_M.webp",
  "/products/WH1000XM6_Product_intro_06_M.webp",
  "/products/WH1000XM6_Product_intro_07_M.webp",
];

const iphone17ProImages = [
  "/products/iphone-17-pro-finish-select-202509-6-3inch-deepblue_cutout.webp",
  "/products/iphone-17-pro-finish-select-202509-6-3inch-deepblue_AV1_cutout.webp",
  "/products/iphone-17-pro-finish-select-202509-6-3inch-deepblue_AV3_cutout.webp",
];

const alienwareMonitorImages = [
  "/products/Alienware-25-Gaming-Monitor_back-right-side-view-2048x2048.png",
  "/products/aw2720hf-27-gy2xk-dell-original-imagfq7dmzbngref_cutout.webp",
];

export const products = [
  {
    id: 1,
    name: "1000X series | WH-1000XM6 Wireless Noise Cancelling Headphones",
    category: "Headphones",
    price: 0.125,
    rating: 5,
    image: wh1000xm6Images[0],
    images: wh1000xm6Images,
    desc: "Wireless noise cancelling headphones from the 1000X series.",
  },
  {
    id: 2,
    name: "Apple iPhone 17 Pro 256 GB",
    category: "Phones",
    price: 0.344,
    rating: 5,
    image: iphone17ProImages[0],
    images: iphone17ProImages,
    desc: "TRASH PHONE. DO NOT BUY. Apple iPhone 17 Pro with 256 GB storage.",
  },
  {
    id: 3,
    name: "Alienware AW2723DF Gaming Monitor - 25-inch",
    category: "Monitors",
    price: 0.156,
    rating: 5,
    image: alienwareMonitorImages[0],
    images: alienwareMonitorImages,
    desc: "Alienware gaming monitor with fast IPS panel and high-refresh visuals.",
  },
];

export const categories = [
  "All",
  ...new Set(products.map((product) => product.category)),
];
