import { Router } from 'express';
import { OrderModel } from '../orders/order.model.js';
import { UserModel } from '../users/user.model.js';
import { ProductModel } from '../products/product.model.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/admin.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, requireAdmin);

// GET /api/v1/dashboard/stats
router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      ordersToday,
      pendingOrders,
      totalCustomers,
      totalProducts,
      monthlyRevenue,
      totalRevenue,
    ] = await Promise.all([
      OrderModel.countDocuments(),
      OrderModel.countDocuments({ createdAt: { $gte: startOfToday } }),
      OrderModel.countDocuments({ status: { $in: ['pending', 'confirmed', 'processing'] } }),
      UserModel.countDocuments({ role: 'customer' }),
      ProductModel.countDocuments({ isActive: true }),
      OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
            paymentStatus: 'paid',
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      OrderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    res.json({
      success: true,
      message: 'Dashboard stats fetched',
      data: {
        totalOrders,
        ordersToday,
        pendingOrders,
        totalCustomers,
        totalProducts,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  })
);

// GET /api/v1/dashboard/revenue?days=30
router.get(
  '/revenue',
  asyncHandler(async (req, res) => {
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, message: 'Revenue data fetched', data: { revenue } });
  })
);

// GET /api/v1/dashboard/recent-orders
router.get(
  '/recent-orders',
  asyncHandler(async (_req, res) => {
    const orders = await OrderModel.find()
      .sort('-createdAt')
      .limit(10)
      .select('orderId status total paymentMethod createdAt user guestInfo');

    res.json({ success: true, message: 'Recent orders fetched', data: { orders } });
  })
);

// GET /api/v1/dashboard/top-products
router.get(
  '/top-products',
  asyncHandler(async (_req, res) => {
    const topProducts = await OrderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, message: 'Top products fetched', data: { topProducts } });
  })
);

export default router;
