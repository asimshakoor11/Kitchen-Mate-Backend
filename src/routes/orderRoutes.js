import express from 'express';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

const router = express.Router();


// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total orders count
        const totalOrders = await Order.countDocuments();

        // Get pending orders count
        const pendingOrders = await Order.countDocuments({ status: 'pending' });

        // Get total products count
        const totalProducts = await Product.countDocuments();

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        // Get total revenue
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get order status distribution
        const orderStatusDistribution = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
        ]);

        // Get monthly orders
        const monthlyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$_id', 1] }, then: 'Jan' },
                                { case: { $eq: ['$_id', 2] }, then: 'Feb' },
                                { case: { $eq: ['$_id', 3] }, then: 'Mar' },
                                { case: { $eq: ['$_id', 4] }, then: 'Apr' },
                                { case: { $eq: ['$_id', 5] }, then: 'May' },
                                { case: { $eq: ['$_id', 6] }, then: 'Jun' },
                                { case: { $eq: ['$_id', 7] }, then: 'Jul' },
                                { case: { $eq: ['$_id', 8] }, then: 'Aug' },
                                { case: { $eq: ['$_id', 9] }, then: 'Sep' },
                                { case: { $eq: ['$_id', 10] }, then: 'Oct' },
                                { case: { $eq: ['$_id', 11] }, then: 'Nov' },
                                { case: { $eq: ['$_id', 12] }, then: 'Dec' }
                            ]
                        }
                    },
                    count: 1
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get top selling products
        const topSellingProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    sales: { $sum: '$items.quantity' }
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    product: { $arrayElemAt: ['$productDetails.name', 0] },
                    sales: 1
                }
            }
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            totalProducts,
            recentOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            orderStatusDistribution,
            monthlyOrders,
            topSellingProducts
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
});

// Get all orders (admin only)
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update order status (admin only)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');;

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update order status
        order.status = status;
        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    try {
        const { id, items, shippingInfo, totalAmount, deliveryFee, paymentMethod } = req.body;

        // Create order
        const order = new Order({
            user: id,
            items,
            shippingInfo,
            totalAmount,
            deliveryFee,
            paymentMethod,
            status: 'pending'
        });

        // Save order
        await order.save();

        // Update product stock
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        res.status(201).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get user's orders
router.get('/my-orders', async (req, res) => {
    try {
        const id = req.query.id;
        const orders = await Order.find({ user: id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


export default router; 