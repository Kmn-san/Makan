import * as paymentService from "../service/paymentService.js"
export const mockPayment = async (req, res) => {
    try {
        req.customer = { id: '90000000-0000-0000-0000-000000000001' }; 
        
        const customer = req.customer;
        if (!customer) {
            return res.status(401).json({ success: false, code: "UNAUTHORIZED" })
        }

        const { orderId } = req.params;
        const result = await paymentService.processMockPayment(orderId,customer.id)

        return res.status(200).json({
            success: true,
            code: "PAYMENT_SUCCESSFULLY",
            data: result
        })

    } catch (error) {
         console.error('Payment controller error:', error);
        return res.status(500).json({
            success: false,
            connected: 'INTERNAL_SERVER_ERROR'
        });
    }

}