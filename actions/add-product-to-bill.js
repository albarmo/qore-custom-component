const insertBill = async (row, client, args, user, quantity) => {
  const date = new Date()
  const prefixBillId = `${date.getTime()}-${row.service_place_products.id}-${
    args.cashier_id
  }`

  //insert new bill and bill item
  await client.execute([
    {
      operation: 'Insert',
      instruction: {
        table: 'bills',
        name: 'insertBills',
        data: {
          bill_id: prefixBillId,
          status: 'Draft',
          total_price: row.price,
          grand_total: row.price,
          is_current_bills: true,
          bill_service_place_id: row.service_place_products.id,
          bill_cashier: args.cashier_id,
        },
      },
    },
    {
      operation: 'Insert',
      instruction: {
        table: 'bill_items',
        name: 'insertBillItem',
        data: {
          bill: '{{insertBills[0].id}}',
          product_bills: row.id,
          quantity: quantity,
          grand_total: row.price,
          item_type: 'Product',
        },
      },
    },
    {
      operation: 'Update',
      instruction: {
        table: 'Products',
        name: 'updateProductQty',
        condition: {
          id: row.id,
        },
        set: {
          quantity: row.quantity - quantity,
          // total_stock_out: row.total_stock_out + quantity,
          // total_stock_sales: row.total_stock_sales + quantity
        },
      },
    },
    // {
    //   operation: 'Insert',
    //   instruction: {
    //     table: 'stock_log',
    //     name: "insertStockLog",
    //     data: {
    //       stock_log_product: row.id,
    //       qty: quantity,
    //       type: "Keluar",
    //       note: `Transaksi POS ${prefixBillId}`,
    //       qty_before: row.quantity,
    //       qty_after: row.quantity - quantity
    //     },
    //   },
    // },
  ])
}

const updateBill = async (bill, row, client, args, quantity) => {
  //get bill item by bill id
  const { data } = await client.execute([
    {
      operation: 'Select',
      instruction: {
        table: 'bill_items',
        name: 'data',
        condition: {
          bill: bill.id,
        },
      },
    },
  ])

  //find same product in bill
  const indexFound = data.findIndex((i) => i.product_bills == row.id)

  //if product not found, insert bill item, and update summary bill
  if (indexFound < 0) {
    await client.execute([
      {
        operation: 'Insert',
        instruction: {
          table: 'bill_items',
          name: 'insertBillItem',
          data: {
            bill: bill.id,
            product_bills: row.id,
            quantity: quantity,
            grand_total: row.price,
            item_type: 'Product',
          },
        },
      },
      {
        operation: 'Update',
        instruction: {
          table: 'Products',
          name: 'updateProductQty',
          condition: {
            id: row.id,
          },
          set: {
            quantity: row.quantity - quantity,
            // total_stock_out: row.total_stock_out + quantity,
            // total_stock_sales: row.total_stock_sales + quantity
          },
        },
      },
      // {
      //   operation: 'Insert',
      //   instruction: {
      //     table: 'stock_log',
      //     name: "insertStockLog",
      //     data: {
      //       stock_log_product: row.id,
      //       qty: quantity,
      //       type: "Keluar",
      //       note: `Transaksi POS ${bill.bill_id}`,
      //       qty_before: row.quantity,
      //       qty_after: row.quantity - quantity
      //     },
      //   },
      // },
    ])
  } else {
    //if product found, update bill item, and update summary bill
    await client.execute([
      {
        operation: 'Update',
        instruction: {
          table: 'bill_items',
          name: 'updateBillItem',
          condition: {
            bill: bill.id,
            product_bills: row.id,
          },
          set: {
            quantity: data[indexFound].quantity + quantity,
            grand_total: row.price * (data[indexFound].quantity + quantity),
          },
        },
      },
      {
        operation: 'Update',
        instruction: {
          table: 'Products',
          name: 'updateProductQty',
          condition: {
            id: row.id,
          },
          set: {
            quantity: row.quantity - quantity,
            // total_stock_out: row.total_stock_out + quantity,
            // total_stock_sales: row.total_stock_sales + quantity
          },
        },
      },
      // {
      //   operation: 'Insert',
      //   instruction: {
      //     table: 'stock_log',
      //     name: "insertStockLog",
      //     data: {
      //       stock_log_product: row.id,
      //       qty: quantity,
      //       type: "Keluar",
      //       note: `Transaksi POS ${bill.bill_id}`,
      //       qty_before: row.quantity,
      //       qty_after: row.quantity - quantity
      //     },
      //   },
      // },
    ])
  }
}

async function main(user, row, client, args) {
  //check stock
  if (row.quantity <= 0) throw new Error('Out of stock!')
  if (!args.cashier_id) throw new Error('Cashier id is empty')

  const quantity = args.quantity_input >= 1 ? Number(args.quantity_input) : 1

  //find bill by user and status draft
  const { data } = await client.execute([
    {
      operation: 'Select',
      instruction: {
        table: 'bills',
        name: 'data',
        condition: {
          status: {
            $eq: 'Draft',
          },
          bill_service_place_id: {
            $eq: row.service_place_products.id,
          },
          is_current_bills: {
            $eq: 'true',
          },
          bill_cashier: {
            $eq: args.cashier_id,
          },
        },
      },
    },
  ])

  //if bill found, update bill
  if (!data.length) {
    // return {status: 'insert new bills'}
    return await insertBill(row, client, args, user, quantity)
  } else {
    // if bill not found, insert new bill
    return await updateBill(data[0], row, client, args, quantity)
  }
}
