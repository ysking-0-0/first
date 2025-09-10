// 修改商品创建部分
console.log('开始创建商品...');

// 商品1
try {
  const product1 = await Product.create({
    shopId: shop._id,
    categoryId: categories[0]._id,
    name: "红富士苹果",
    price: 12.8,
    originalPrice: 15.9,
    description: "新鲜红富士苹果，甜脆多汁，产地山东",
    coverImage: "/images/apple-cover.jpg",
    images: ["/images/apple1.jpg", "/images/apple2.jpg"],
    stock: 100,
    sales: 0,
    specs: [
      { name: "重量", values: ["500g", "1000g"] },
      { name: "产地", values: ["山东", "陕西"] }
    ],
    isRecommend: true,
    isOnSale: true
  });
  console.log('✅ 商品1创建成功:', product1.name);
} catch (error) {
  console.error('❌ 商品1创建失败:', error.message);
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      console.error(`  字段 ${key}: ${error.errors[key].message}`);
    });
  }
}

// 商品2 - 先用最简单数据测试
try {
  const product2 = await Product.create({
    shopId: shop._id,
    categoryId: categories[0]._id,
    name: "海南香蕉",
    price: 8.5,
    description: "海南香蕉，香甜软糯，自然成熟"
  });
  console.log('✅ 商品2创建成功:', product2.name);
} catch (error) {
  console.error('❌ 商品2创建失败:', error.message);
  if (error.errors) {
    Object.keys(error.errors).forEach(key => {
      console.error(`  字段 ${key}: ${error.errors[key].message}`);
    });
  }
}