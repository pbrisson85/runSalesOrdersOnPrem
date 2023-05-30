### Going to be an app the runs on cron to pull a real time list of sales orders and manually calc OTHP. WIll also include routes for projecting sales via open sales orders.

### TODO. Need to manually calc the OTHP (will need a sub table if want the detail as there will be more lines in OTHPO than on the invoice.)

- For now I am not calculating the OTJHP at all.

### Note that through research I have found that the cost on a sales order is based on the average cost of the item at the time the sales order was entered. Within a sales order you can choose tools -> reprice lines to update the average cost as of the current inventory. I NEED TO MANUALLY CALC THIS BASED ON DAILY PERPETUAL

### Note that the cost on an invoice will be the actual lot cost if the line is tagged
