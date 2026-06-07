const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('./models/Category');
const Product  = require('./models/Product');
const User     = require('./models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  await Category.deleteMany();
  await Product.deleteMany();
  await User.deleteMany();

  const cats = await Category.insertMany([
    { name: 'Waterproofing',       slug: 'waterproofing', icon: '🌊', sortOrder: 1 },
    { name: 'Adhesives & Grouts',  slug: 'adhesives',     icon: '🔩', sortOrder: 2 },
    { name: 'Concrete Admixtures', slug: 'admixtures',    icon: '🧱', sortOrder: 3 },
    { name: 'Protective Coatings', slug: 'coatings',      icon: '🛡️', sortOrder: 4 },
    { name: 'Repair Mortars',      slug: 'repair',        icon: '🔧', sortOrder: 5 },
    { name: 'Sealants',            slug: 'sealants',      icon: '🌿', sortOrder: 6 },
  ]);

  await Product.insertMany([
    { name: 'HydroSeal Pro X1',          description: 'Premium waterproofing membrane.', category: cats[0]._id, price: 1850, mrp: 2200, stock: 150, unit: 'unit', sku: 'HS-001', isFeatured: true, badge: 'Best Seller', rating: 4.8, numReviews: 128 },
    { name: 'TileFix Ultra Epoxy',        description: 'High-strength epoxy adhesive.',   category: cats[1]._id, price: 980,  stock: 200, unit: 'kg',   sku: 'TF-002', isFeatured: true, badge: 'New',         rating: 4.2, numReviews: 64  },
    { name: 'ConcreteMax Superplasticizer',description: 'Workability-enhancing admixture.',category: cats[2]._id, price: 1200, mrp: 1500, stock: 300, unit: 'litre', sku: 'CM-003', isFeatured: true, badge: 'Sale',        rating: 4.9, numReviews: 211 },
    { name: 'ArmourCoat Anti-Carbonation', description: 'Protective elastomeric coating.', category: cats[3]._id, price: 2350, stock: 80,  unit: 'litre', sku: 'AC-004', isFeatured: true, rating: 4.3, numReviews: 47  },
  ]);

  await User.create({ name: 'Super Admin', email: 'superadmin@constore.com', password: 'super123',  role: 'superadmin' });
  await User.create({ name: 'Admin',       email: 'admin@constore.com',      password: 'admin123',  role: 'admin'      });
  await User.create({ name: 'Staff',       email: 'staff@constore.com',      password: 'staff123',  role: 'staff'      });
  await User.create({ name: 'Test User',   email: 'user@constore.com',       password: 'user123',   role: 'user'       });

  console.log('✅ Seeded successfully');
  console.log('   superadmin@constore.com / super123');
  console.log('   admin@constore.com      / admin123');
  console.log('   staff@constore.com      / staff123');
  console.log('   user@constore.com       / user123');
  process.exit();
};

run().catch(err => { console.error(err); process.exit(1); });