import SettingsModal from "../../utils/models/Settings.js";

/**
 * Get landing page data for storefront
 * @param {customerId} string - shopify customer id
 * @param {shop} string - shopify store handle swiss-local-dev.myshopify.com
 * @return {object} landing page data
 */
const getLandingPageData = async (
  customerId = null,
  shop,
  { page = 1, limit = 10, startDate = null, endDate = null } = {}
) => {
  try {
    const now = new Date();

    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (safePage - 1) * safeLimit;

    const sDate = startDate ? new Date(startDate) : null;
    const eDate = endDate ? new Date(endDate) : null;

    const dateMatch =
      sDate || eDate
        ? {
            createdAt: {
              ...(sDate ? { $gte: sDate } : {}),
              ...(eDate ? { $lte: eDate } : {}),
            },
          }
        : null;

    const pipeline = [
      {
        $set: {
          customerId: {
            $convert: {
              input: customerId,
              to: "long",
              onError: null,
              onNull: null,
            },
          },
        },
      },

      // ---------- Storefront offers ----------
      {
        $lookup: {
          from: "storefront_offers",
          pipeline: [
            { $match: { status: "active" } },
            { $sort: { position: 1 } },
            {
              $project: {
                _id: 0,
                position: 1,
                code: 1,
                status: 1,
                title: 1,
                description: 1,
                btnText: 1,
                url: 1,
                info: 1,
              },
            },
          ],
          as: "storefrontOffers",
        },
      },
      {
        $lookup: {
          from: "wallets",
          let: { cid: "$customerId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$cid", null] },
                    { $eq: ["$customerId", "$$cid"] },
                  ],
                },
              },
            },
            { $project: { _id: 1, balance: 1 } }, // keep _id
            { $limit: 1 },
          ],
          as: "wallet",
        },
      },
      {
        $set: {
          wallet: {
            $ifNull: [{ $first: "$wallet" }, { _id: null, balance: 0 }],
          },
        },
      },
      {
        $set: {
          wid: {
            $cond: [
              { $ne: ["$wallet._id", null] },
              { $toString: "$wallet._id" },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "transactions",
          let: { wid: "$wid" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$$wid", null] },
                    { $eq: ["$walletId", "$$wid"] },
                  ],
                },
                ...(dateMatch ? dateMatch : {}),
              },
            },
            {
              $facet: {
                meta: [{ $count: "total" }],
                data: [
                  { $sort: { createdAt: -1 } },
                  { $skip: skip },
                  { $limit: safeLimit },
                ],
              },
            },
            {
              $project: {
                total: { $ifNull: [{ $first: "$meta.total" }, 0] },
                transactions: "$data",
              },
            },
          ],
          as: "transactionsWrap",
        },
      },
      {
        $set: {
          transactions: {
            $let: {
              vars: { tw: { $first: "$transactionsWrap" } },
              in: {
                total: { $ifNull: ["$$tw.total", 0] },
                transactions: { $ifNull: ["$$tw.transactions", []] },
                pagination: {
                  currentPage: safePage,
                  nextPage: {
                    $let: {
                      vars: {
                        tp: {
                          $ceil: {
                            $divide: [
                              { $ifNull: ["$$tw.total", 0] },
                              safeLimit,
                            ],
                          },
                        },
                      },
                      in: {
                        $cond: [
                          { $lt: [safePage, "$$tp"] },
                          { $add: [safePage, 1] },
                          null,
                        ],
                      },
                    },
                  },
                  prevPage: {
                    $cond: [
                      { $gt: [safePage, 1] },
                      { $subtract: [safePage, 1] },
                      null,
                    ],
                  },
                  totalPages: {
                    $max: [
                      1,
                      {
                        $ceil: {
                          $divide: [{ $ifNull: ["$$tw.total", 0] }, safeLimit],
                        },
                      },
                    ],
                  },
                  pages: {
                    $let: {
                      vars: {
                        tp: {
                          $max: [
                            1,
                            {
                              $ceil: {
                                $divide: [
                                  { $ifNull: ["$$tw.total", 0] },
                                  safeLimit,
                                ],
                              },
                            },
                          ],
                        },
                      },
                      in: {
                        $map: {
                          input: { $range: [1, { $add: ["$$tp", 1] }] },
                          as: "p",
                          in: "$$p",
                        },
                      },
                    },
                  },
                },
                filters: { startDate: sDate, endDate: eDate },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "points",
          let: { wid: "$wid", cid: "$customerId", now },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        {
                          $and: [
                            { $ne: ["$$wid", null] },
                            { $eq: ["$walletId", "$$wid"] },
                          ],
                        },
                        {
                          $and: [
                            { $ne: ["$$cid", null] },
                            { $eq: ["$customerId", "$$cid"] },
                          ],
                        },
                      ],
                    },
                    { $eq: ["$status", "ready"] },
                    { $gt: ["$expiresOn", "$$now"] },
                    { $gt: ["$amount", 0] },
                  ],
                },
              },
            },
            {
              $facet: {
                balance: [
                  { $group: { _id: null, total: { $sum: "$amount" } } },
                ],
                nearestExpiringCredit: [
                  { $sort: { expiresOn: 1 } },
                  { $limit: 1 },
                  { $project: { _id: 0, amount: 1, expiresOn: 1 } },
                ],
              },
            },
            {
              $project: {
                balance: { $ifNull: [{ $first: "$balance.total" }, 0] },
                nearestExpiringCredit: { $first: "$nearestExpiringCredit" },
              },
            },
          ],
          as: "pointsSummary",
        },
      },

      {
        $set: {
          points: {
            $ifNull: [
              { $first: "$pointsSummary" },
              { balance: 0, nearestExpiringCredit: null },
            ],
          },
        },
      },
      { $unset: ["transactionsWrap", "pointsSummary", "customerId", "wid"] },

      {
        $project: {
          _id: 0,
          usage: 1,
          order_allocation: 1,
          max_cashback: 1,
          expiry_period: 1,
          storefrontOffers: 1,
          wallet: 1,
          transactions: 1,
          points: 1,
        },
      },
    ];

    const [result] = await SettingsModal.aggregate(pipeline);

    if (!result) {
      throw new Error(`Settings not found for shop: ${shop}`);
    }
    return {
      configs: {
        expiry_period: result.expiry_period,
        max_cashback: {
          value: result.max_cashback,
        },
        order_allocation: result.order_allocation,
        usage: result.usage,
      },
      offers: result.storefrontOffers ?? [],
      wallet: result.wallet ?? { balance: 0 },
      transactions: result.transactions ?? {
        total: 0,
        transactions: [],
        pagination: {
          currentPage: safePage,
          nextPage: null,
          prevPage: null,
          totalPages: 1,
          pages: [1],
        },
        filters: { startDate: sDate, endDate: eDate },
      },

      expiringPoints: result.points ?? {
        balance: 0,
        nearestExpiringCredit: null,
      },
    };
  } catch (err) {
    throw new Error(
      "Failed to get landing page data reason --> " + err.message
    );
  }
};

export { getLandingPageData };
