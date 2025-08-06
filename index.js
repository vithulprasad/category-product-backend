const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

const product_model = require('../backend/schema/Product')
const category_model = require('../backend/schema/Category')
const brand =     require('../backend/schema/Brand')



app.use(cors({
    origin: 'http://localhost:8080',
    methods: ["GET", "POST","delete"],
  }));


  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  mongoose.connect('mongodb://127.0.0.1:27017/productManage',{
    useNewUrlParser:true,
    useUnifiedTopology:true
  })
  .then(()=>{
    console.log("database connected ");
  })
  .catch((error)=>{
    console.log(error);
  })




const PORT = 8088
app.listen(PORT,()=>{
    console.log('lisning to port')
})



app.post('/create_category',async(req,res)=>{
    const body = req.body
    console.log('creting category',req.body)
    const create_category = new category_model({
        name:body.name,
        slug:body.name,
        parent:body.parent,
        type:body.type
    })
    const result = await create_category.save()

    res.send({message:'created',data:result})
})


app.get('/get_category', async (req, res) => {
  try {
    const categoriesWithCount = await category_model.aggregate([
      {
        $lookup: {
          from: 'products', // collection name in MongoDB (lowercase plural of model)
          localField: '_id',
          foreignField: 'category', // field in products referencing category
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $project: {
          products: 0 // exclude products array, keep only count
        }
      }
    ]);
    console.log(categoriesWithCount)

    res.send({ data: categoriesWithCount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


app.post('/create_product',async(req,res)=>{
    const body = req.body
    console.log('creting category',req.body)
    const create_product = new product_model({
        name:body.name,
        slug:body.name,
        description:body.description,
        price:body.price,
        category:body.category_id,
        stock:body.in_stock,
        // brand:body.brand,
        images:body.image_url
    })
    const result = await create_product.save()

    res.send({message:'created',data:result})
})
app.get('/get_products',async(req,res)=>{
     const find_product = await product_model.find()

     res.send({data:find_product})
})


app.get('/get_working', async (req, res) => {
  try {
    // Fetch all categories with their parent populated
    const categories = await category_model.find().populate('parent').lean();

    // Fetch product counts for each category
    const productCounts = await product_model.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    productCounts.forEach(pc => {
      countMap[pc._id?.toString()] = pc.count;
    });

    // Helper: get category name + count
    const getNameWithCount = (cat) => {
      const count = countMap[cat._id?.toString()] || 0;
      return count > 0 ? `${cat.name} (${count})` : cat.name;
    };

    // Step 1: Build a map by _id for quick lookup
    const catMap = {};
    categories.forEach(cat => {
      catMap[cat._id.toString()] = {
        ...cat,
        children: []
      };
    });

    // Step 2: Build hierarchy
    const roots = [];
    categories.forEach(cat => {
      if (cat.parent && catMap[cat.parent._id?.toString()]) {
        catMap[cat.parent._id.toString()].children.push(catMap[cat._id.toString()]);
      } else {
        roots.push(catMap[cat._id.toString()]);
      }
    });

    // Step 3: Convert to desired nested object format
    const buildNested = (nodes) => {
      const obj = {};
      nodes.forEach(node => {
        if (node.children.length > 0) {
          obj[getNameWithCount(node)] = buildNested(node.children);
        } else {
          obj[getNameWithCount(node)] = [];
        }
      });
      return obj;
    };

    const finalStructure = buildNested(roots);

    res.json({ data: finalStructure });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.post('/delete_product', async (req, res) => {
  try {
    const deletedProduct = await product_model.deleteOne({ _id: req.query.id });

    if (deletedProduct.deletedCount === 0) {
      return res.status(404).send({ message: 'Product not found' });
    }

    res.send({ data: deletedProduct, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.post('/delete_category', async (req, res) => {
  try {
    console.log(req.query.id)
    const deletedCategory = await category_model.deleteOne({ _id: req.query.id });

    if (deletedCategory.deletedCount === 0) {
      return res.status(404).send({ message: 'Category not found' });
    }

    res.send({ data: deletedCategory, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});



app.get('/products_by_category',async(req,res)=>{
    const find_product = await product_model.find({category:req.query.id})
    res.send({data:find_product})
})