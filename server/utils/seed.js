const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const setupDB = require('./db');
const { ROLES } = require('../constants');
const User = require('../models/user');
const Brand = require('../models/brand');
const Product = require('../models/product');
const Category = require('../models/category');

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

const NUM_PRODUCTS = 100;
const NUM_BRANDS = 10;
const NUM_CATEGORIES = 10;
const BRAND_SPECIFIC_PRODUCTS = 15; // Products per Bangladeshi brand

const seedDB = async () => {
  try {
    let categories = [];

    const usersToSeed = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: ROLES.Admin
      },
      {
        email: 'member@example.com',
        password: 'member123',
        firstName: 'Member',
        lastName: 'User',
        role: ROLES.Member
      },
      {
        email: 'merchant@example.com',
        password: 'merchant123',
        firstName: 'Merchant',
        lastName: 'User',
        role: ROLES.Merchant
      }
    ];

    console.log(`${chalk.blue('✓')} ${chalk.blue('Seed database started')}`);

    for (const userData of usersToSeed) {
      const { email, password } = userData;

      if (!email || !password) throw new Error('Missing email or password');

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log(`${chalk.yellow('!')} ${chalk.yellow(`Seeding user: ${email}`)}`);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          ...userData,
          password: hashedPassword
        });

        await newUser.save();
        console.log(`${chalk.green('✓')} ${chalk.green(`User ${email} seeded.`)}`);
      } else {
        console.log(`${chalk.yellow('!')} ${chalk.yellow(`User ${email} already exists, skipping.`)}`);
      }
    }

    // Define categories, including those for Bangladeshi brands
    const brandCategories = [
      { name: 'Televisions', description: 'High-definition LED and OLED TVs.' },
      { name: 'Cameras', description: 'Mirrorless and DSLR cameras.' },
      { name: 'Audio', description: 'Headphones, speakers, and soundbars.' },
      { name: 'Gaming', description: 'Gaming consoles and accessories.' },
      { name: 'Mobile Phones', description: 'Smartphones and accessories.' },
      { name: 'Home Appliances', description: 'Refrigerators, microwaves, and washing machines.' },
      { name: 'Furniture', description: 'Home and office furniture.' }
    ];

    const categoriesCount = await Category.countDocuments();
    if (categoriesCount >= NUM_CATEGORIES + brandCategories.length) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of categories already exist, skipping seeding for categories.')}`);
      categories = await Category.find().select('_id name');
    } else {
      // Seed brand-specific categories
      for (const cat of brandCategories) {
        const existingCategory = await Category.findOne({ name: cat.name });
        if (!existingCategory) {
          const category = new Category({
            name: cat.name,
            description: cat.description,
            isActive: true
          });
          await category.save();
          categories.push(category);
        } else {
          categories.push(existingCategory);
        }
      }

      // Seed additional random categories to reach NUM_CATEGORIES
      const remainingCategories = NUM_CATEGORIES - (await Category.countDocuments());
      for (let i = 0; i < remainingCategories; i++) {
        const category = new Category({
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
          isActive: true
        });
        await category.save();
        categories.push(category);
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Categories seeded, including brand-specific categories.')}`);
    }

    // Define Bangladeshi brands
    const bangladeshiBrands = [
      {
        name: 'Sony Bangladesh',
        description: 'Official Sony brand for Bangladesh, offering premium electronics and entertainment products.'
      },
      {
        name: 'Walton',
        description: 'Leading Bangladeshi electronics brand specializing in appliances and gadgets.'
      },
      {
        name: 'RFL',
        description: 'Renowned Bangladeshi brand for furniture, plastics, and household products.'
      },
      {
        name: 'Vision',
        description: 'Popular Bangladeshi electronics brand focusing on TVs and appliances.'
      },
      {
        name: 'Singer Bangladesh',
        description: 'Trusted brand in Bangladesh for home appliances and consumer electronics.'
      }
    ];

    // Seed Bangladeshi brands
    const brandMap = new Map();
    for (const b of bangladeshiBrands) {
      const existingBrand = await Brand.findOne({ name: b.name });
      if (!existingBrand) {
        const brand = new Brand({
          name: b.name,
          description: b.description,
          isActive: true
        });
        await brand.save();
        brandMap.set(b.name, brand);
        console.log(`${chalk.green('✓')} ${chalk.green(`${b.name} brand seeded.`)}`);
      } else {
        brandMap.set(b.name, existingBrand);
        console.log(`${chalk.yellow('!')} ${chalk.yellow(`${b.name} brand already exists, skipping seeding.`)}`);
      }
    }

    // Seed other brands
    const brandsCount = await Brand.countDocuments();
    if (brandsCount >= NUM_BRANDS) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of brands already exist, skipping seeding for additional brands.')}`);
    } else {
      for (let i = 0; i < NUM_BRANDS - bangladeshiBrands.length; i++) {
        const brand = new Brand({
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          isActive: true
        });
        await brand.save();
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Additional brands seeded.')}`);
    }

    // Seed brand-specific products
    const productsCount = await Product.countDocuments();
    if (productsCount >= NUM_PRODUCTS + BRAND_SPECIFIC_PRODUCTS * bangladeshiBrands.length) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of products already exist, skipping seeding for products.')}`);
    } else {
      const brands = await Brand.find().select('_id name');

      // Define product types for each Bangladeshi brand
      const brandProductTypes = {
        'Sony Bangladesh': [
          { type: 'TV', prefix: 'Bravia', category: 'Televisions', priceRange: { min: 500, max: 2000 } },
          { type: 'Camera', prefix: 'Alpha', category: 'Cameras', priceRange: { min: 300, max: 1500 } },
          { type: 'Headphones', prefix: 'WH-', category: 'Audio', priceRange: { min: 50, max: 300 } },
          { type: 'Console', prefix: 'PlayStation', category: 'Gaming', priceRange: { min: 400, max: 600 } },
          { type: 'Smartphone', prefix: 'Xperia', category: 'Mobile Phones', priceRange: { min: 200, max: 1000 } }
        ],
        'Walton': [
          { type: 'Refrigerator', prefix: 'W', category: 'Home Appliances', priceRange: { min: 200, max: 800 } },
          { type: 'TV', prefix: 'Smart LED', category: 'Televisions', priceRange: { min: 150, max: 500 } },
          { type: 'Air Conditioner', prefix: 'AC', category: 'Home Appliances', priceRange: { min: 300, max: 600 } }
        ],
        'RFL': [
          { type: 'Chair', prefix: 'Comfort', category: 'Furniture', priceRange: { min: 20, max: 100 } },
          { type: 'Table', prefix: 'Elite', category: 'Furniture', priceRange: { min: 50, max: 200 } },
          { type: 'Storage', prefix: 'Durable', category: 'Furniture', priceRange: { min: 30, max: 150 } }
        ],
        'Vision': [
          { type: 'TV', prefix: 'LED', category: 'Televisions', priceRange: { min: 100, max: 400 } },
          { type: 'Refrigerator', prefix: 'Cool', category: 'Home Appliances', priceRange: { min: 150, max: 500 } }
        ],
        'Singer Bangladesh': [
          { type: 'Washing Machine', prefix: 'Auto', category: 'Home Appliances', priceRange: { min: 200, max: 600 } },
          { type: 'Microwave', prefix: 'Solo', category: 'Home Appliances', priceRange: { min: 80, max: 200 } },
          { type: 'TV', prefix: 'Smart', category: 'Televisions', priceRange: { min: 150, max: 450 } }
        ]
      };

      // Seed products for each Bangladeshi brand
      for (const brandName of bangladeshiBrands.map(b => b.name)) {
        const brand = brandMap.get(brandName);
        const productTypes = brandProductTypes[brandName];
        const existingProducts = await Product.countDocuments({ brand: brand._id });
        const remainingProducts = BRAND_SPECIFIC_PRODUCTS - existingProducts;

        if (remainingProducts > 0) {
          for (let i = 0; i < remainingProducts; i++) {
            const productType = productTypes[faker.number.int({ min: 0, max: productTypes.length - 1 })];
            const categoryId = categories.find(cat => cat.name === productType.category)._id;
            const product = new Product({
              sku: faker.string.alphanumeric(10),
              name: `${brandName} ${productType.prefix} ${faker.commerce.productName()}`,
              description: `High-quality ${productType.type} by ${brandName}. ${faker.lorem.sentence()}`,
              quantity: faker.number.int({ min: 1, max: 50 }),
              price: faker.commerce.price(productType.priceRange),
              taxable: true,
              isActive: true,
              brand: brand._id,
              category: categoryId
            });
            await product.save();
            await Category.updateOne({ _id: categoryId }, { $push: { products: product._id } });
          }
          console.log(`${chalk.green('✓')} ${chalk.green(`${brandName} products seeded.`)}`);
        } else {
          console.log(`${chalk.yellow('!')} ${chalk.yellow(`Sufficient ${brandName} products already exist, skipping seeding.`)}`);
        }
      }

      // Seed other products
      const remainingProducts = NUM_PRODUCTS - (await Product.countDocuments());
      if (remainingProducts > 0) {
        for (let i = 0; i < remainingProducts; i++) {
          const randomCategoryIndex = faker.number.int(categories.length - 1);
          const product = new Product({
            sku: faker.string.alphanumeric(10),
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            quantity: faker.number.int({ min: 1, max: 100 }),
            price: faker.commerce.price(),
            taxable: faker.datatype.boolean(),
            isActive: true,
            brand: brands[faker.number.int(brands.length - 1)]._id,
            category: categories[randomCategoryIndex]._id
          });
          await product.save();
          await Category.updateOne({ _id: categories[randomCategoryIndex]._id }, { $push: { products: product._id } });
        }
        console.log(`${chalk.green('✓')} ${chalk.green('Additional products seeded and associated with categories.')}`);
      }
    }
  } catch (error) {
    console.log(`${chalk.red('x')} ${chalk.red('Error while seeding database')}`);
    console.log(error);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} ${chalk.blue('Database connection closed!')}`);
  }
};

(async () => {
  try {
    await setupDB();
    await seedDB();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
  }
})();
